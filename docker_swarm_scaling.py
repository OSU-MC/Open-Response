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
SCALE_COOLDOWN = int(os.getenv("SCALE_COOLDOWN", 300))  # 5 minutes

# Logging configuration
logging.basicConfig(filename="autoscaler.log", level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

# Initialize Docker client
client = docker.from_env()

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
        tasks = client.tasks(filters={"service": service_name})
        total_cpu_usage = 0
        total_memory_usage = 0
        container_count = 0
        
        for task in tasks:
            if "ContainerStatus" in task["Status"]:
                container_id = task["Status"]["ContainerStatus"]["ContainerID"]
                stats = client.containers.get(container_id).stats(stream=False)

                # Extract CPU usage
                cpu_delta = stats["cpu_stats"]["cpu_usage"]["total_usage"] - stats["precpu_stats"]["cpu_usage"]["total_usage"]
                system_cpu_delta = stats["cpu_stats"]["system_cpu_usage"] - stats["precpu_stats"]["system_cpu_usage"]
                if system_cpu_delta > 0:
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
        return None, None

def monitor_and_scale():
    """Monitors system and service resources, adjusting scaling accordingly."""
    while True:
        system_memory_usage = psutil.virtual_memory().percent
        logging.info(f"System Memory Usage: {system_memory_usage}%")

        # **System-level memory limit check**
        if system_memory_usage > SYSTEM_MEMORY_LIMIT:
            logging.warning("System memory usage exceeded threshold! Scaling down services.")

            # Scale down backend
            backend_replicas = get_service_replicas(BACKEND_SERVICE)
            if backend_replicas is not None and backend_replicas > MIN_REPLICAS:
                scale_service(BACKEND_SERVICE, backend_replicas - 1)

            # Scale down frontend
            frontend_replicas = get_service_replicas(FRONTEND_SERVICE)
            if frontend_replicas is not None and frontend_replicas > MIN_REPLICAS:
                scale_service(FRONTEND_SERVICE, frontend_replicas - 1)

        else:
            # **Per-service scaling**
            backend_cpu, backend_memory = get_service_stats(BACKEND_SERVICE)
            frontend_cpu, frontend_memory = get_service_stats(FRONTEND_SERVICE)

            # Backend Scaling
            current_backend_replicas = get_service_replicas(BACKEND_SERVICE)
            if backend_cpu is not None:
                if backend_cpu > CPU_UP_THRESHOLD or backend_memory > MEMORY_UP_THRESHOLD:
                    new_backend_replicas = min(current_backend_replicas + 1, MAX_REPLICAS)
                    if new_backend_replicas != current_backend_replicas:
                        scale_service(BACKEND_SERVICE, new_backend_replicas)
                elif backend_cpu < CPU_DOWN_THRESHOLD and backend_memory < MEMORY_DOWN_THRESHOLD:
                    new_backend_replicas = max(current_backend_replicas - 1, MIN_REPLICAS)
                    if new_backend_replicas != current_backend_replicas:
                        scale_service(BACKEND_SERVICE, new_backend_replicas)

            # Frontend Scaling
            current_frontend_replicas = get_service_replicas(FRONTEND_SERVICE)
            if frontend_cpu is not None:
                if frontend_cpu > CPU_UP_THRESHOLD or frontend_memory > MEMORY_UP_THRESHOLD:
                    new_frontend_replicas = min(current_frontend_replicas + 1, MAX_REPLICAS)
                    if new_frontend_replicas != current_frontend_replicas:
                        scale_service(FRONTEND_SERVICE, new_frontend_replicas)
                elif frontend_cpu < CPU_DOWN_THRESHOLD and frontend_memory < MEMORY_DOWN_THRESHOLD:
                    new_frontend_replicas = max(current_frontend_replicas - 1, MIN_REPLICAS)
                    if new_frontend_replicas != current_frontend_replicas:
                        scale_service(FRONTEND_SERVICE, new_frontend_replicas)

        time.sleep(10)

if __name__ == "__main__":
    monitor_and_scale()
