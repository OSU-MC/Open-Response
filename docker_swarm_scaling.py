import docker
import psutil
import time
import logging
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Docker Swarm service names
BACKEND_SERVICE = os.getenv("BACKEND_SERVICE", "openresponse_backend")
FRONTEND_SERVICE = os.getenv("FRONTEND_SERVICE", "openresponse_frontend")

# Scaling thresholds (from .env or defaults)
CPU_UP_THRESHOLD = int(os.getenv("CPU_UP_THRESHOLD", 70))  # Scale up if CPU > 70%
CPU_DOWN_THRESHOLD = int(os.getenv("CPU_DOWN_THRESHOLD", 30))  # Scale down if CPU < 30%
MEMORY_UP_THRESHOLD = int(os.getenv("MEMORY_UP_THRESHOLD", 80))  # Scale up if memory > 80%
MEMORY_DOWN_THRESHOLD = int(os.getenv("MEMORY_DOWN_THRESHOLD", 40))  # Scale down if memory < 40%

# System-wide memory threshold
SYSTEM_MEMORY_LIMIT = int(os.getenv("SYSTEM_MEMORY_LIMIT", 90))  # Scale down if total memory exceeds 90%

# Scaling limits
MIN_REPLICAS = int(os.getenv("MIN_REPLICAS", 1))
MAX_REPLICAS = int(os.getenv("MAX_REPLICAS", 5))

# Cooldown period (in seconds)
SCALE_COOLDOWN = int(os.getenv("SCALE_COOLDOWN", 900))  # 15 minutes

# Logging configuration
logging.basicConfig(filename="autoscaler.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Initialize Docker client
client = docker.from_env()
api_client = docker.APIClient()

# Track last scaling time for cooldown
last_scaled = {BACKEND_SERVICE: 0, FRONTEND_SERVICE: 0}

def get_service_replicas(service_name):
    """Fetches the current replica count for a service."""
    try:
        service = client.services.get(service_name)
        return service.attrs['Spec']['Mode']['Replicated']['Replicas']
    except docker.errors.NotFound:
        logging.error(f"Service {service_name} not found.")
        return None
    except docker.errors.APIError as e:
        logging.error(f"Docker API error while fetching {service_name}: {e}")
        return None

def scale_service(service_name, new_replicas):
    """Scales a Docker Swarm service with retries and cooldown handling."""
    global last_scaled

    # Enforce cooldown period
    current_time = time.time()
    if current_time - last_scaled.get(service_name, 0) < SCALE_COOLDOWN:
        logging.info(f"Skipping scaling for {service_name} (cooldown active).")
        return

    retries = 3
    for attempt in range(retries):
        try:
            service = client.services.get(service_name)
            service.update(mode={"Replicated": {"Replicas": new_replicas}})
            last_scaled[service_name] = time.time()
            logging.info(f"Scaled {service_name} to {new_replicas} replicas.")
            return
        except docker.errors.APIError as e:
            logging.error(f"Failed to scale {service_name} (attempt {attempt+1}/{retries}): {e}")
            time.sleep(5)
    logging.error(f"Scaling for {service_name} failed after {retries} attempts.")

def get_service_stats(service_name):
    """Fetches CPU and memory usage for a specific Docker Swarm service."""
    try:
        tasks = api_client.tasks(filters={"service": service_name})
        total_cpu_usage = 0
        total_memory_usage = 0
        container_count = 0
        
        for task in tasks:
            if "ContainerStatus" in task["Status"]:
                container_id = task["Status"]["ContainerStatus"]["ContainerID"]
                
                # Get container details to check status
                container = client.containers.get(container_id)
                if container.status != "running":
                    logging.warning(f"Skipping non-running container {container_id} (status: {container.status})")
                    continue  # Skip exited containers
                
                stats = container.stats(stream=False)

                # Extract CPU usage
                cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
                system_cpu_delta = stats["cpu_stats"].get("system_cpu_usage", 0) - stats["precpu_stats"].get("system_cpu_usage", 0)

                if system_cpu_delta > 0 and "percpu_usage" in stats["cpu_stats"]["cpu_usage"]:
                    cpu_percent = (cpu_delta / system_cpu_delta) * len(stats["cpu_stats"]["cpu_usage"]["percpu_usage"]) * 100
                    total_cpu_usage += cpu_percent

                # Extract Memory usage
                memory_usage = stats["memory_stats"]["usage"] / (1024 * 1024)  # Convert bytes to MB
                total_memory_usage += memory_usage

                container_count += 1
        
        if container_count > 0:
            avg_cpu_usage = total_cpu_usage / container_count
            avg_memory_usage = total_memory_usage / container_count
            return avg_cpu_usage, avg_memory_usage
        else:
            return 0, 0

    except Exception as e:
        logging.error(f"Error fetching stats for {service_name}: {e}")
        return 0, 0  # Return 0 instead of None to prevent further errors



def monitor_and_scale():
    """Monitors system and service resources, adjusting scaling accordingly."""
    while True:
        system_memory_usage = psutil.virtual_memory().percent
        logging.info(f"System Memory Usage: {system_memory_usage}%")

        # **System-level memory limit check**
        if system_memory_usage > SYSTEM_MEMORY_LIMIT:
            logging.warning("System memory usage exceeded threshold! Scaling down services.")

            for service in [BACKEND_SERVICE, FRONTEND_SERVICE]:
                replicas = get_service_replicas(service)
                if replicas is not None and replicas > MIN_REPLICAS:
                    scale_service(service, replicas - 1)

        else:
            for service in [BACKEND_SERVICE, FRONTEND_SERVICE]:
                cpu, memory = get_service_stats(service)
                logging.info(f"{service} - CPU: {cpu}%, Memory: {memory}MB")
                current_replicas = get_service_replicas(service)
                if cpu is not None and current_replicas is not None:
                    if cpu > CPU_UP_THRESHOLD or memory > MEMORY_UP_THRESHOLD:
                        new_replicas = min(current_replicas + 1, MAX_REPLICAS)
                    elif cpu < CPU_DOWN_THRESHOLD and memory < MEMORY_DOWN_THRESHOLD:
                        new_replicas = max(current_replicas - 1, MIN_REPLICAS)
                    else:
                        continue
                    if new_replicas != current_replicas:
                        scale_service(service, new_replicas)
        time.sleep(10)

if __name__ == "__main__":
    monitor_and_scale()
