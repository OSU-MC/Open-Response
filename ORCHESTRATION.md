# Docker Swarm Orchestration

## Overview
This document provides a detailed guide on how to build, run, modify, and manage the application using Docker Swarm for orchestration. It covers containerized deployment, scaling, updating services, and shutting down the Swarm.

## Prerequisites
Ensure that the following dependencies are installed on your system:
- Docker (latest version)
- Docker Compose (latest version)
- A Linux-based system or WSL2 for Windows users

## Initializing Docker Swarm
To use Docker Swarm, initialize a Swarm mode cluster:
```sh
docker swarm init
```
This command sets up the current machine as a manager node in the Swarm.

If deploying across multiple nodes, additional worker nodes can join using:
```sh
docker swarm join --token <TOKEN> <MANAGER-IP>:2377
```
Retrieve the join token from an existing Swarm manager using:
```sh
docker swarm join-token worker
```

## Building the Application
Before deploying, the services need to be built using Docker. Navigate to the root directory of the project and execute:
```sh
docker build -t openresponse_backend ./core
docker build -t openresponse_frontend ./client
```
This will generate the necessary container images for the backend and frontend services.

## Deploying the Stack
Deploy the application stack using Docker Swarm:
```sh
docker stack deploy -c docker-stack.yml openresponse
```
This will create the required services, networks, and volumes as defined in `docker-stack.yml`.

## Monitoring Running Services
To check the status of running services:
```sh
docker service ls
```
To inspect the logs of a specific service:
```sh
docker service logs <service-name>
```
To view detailed service information:
```sh
docker service inspect <service-name>
```

To inspect service healt and list running tasks, their state, and recent failures:
```sh
docker service ps <service-name>
```

## Modifying Services
### Updating the Backend or Frontend
When modifying code, rebuild the respective service:
```sh
docker build -t openresponse_backend ./core
docker build -t openresponse_frontend ./client
```
Then, update the running stack:
```sh
docker stack rm openresponse
docker stack deploy -c docker-stack.yml openresponse
```
This ensures the new image is used while keeping the Swarm configuration intact.

### Scaling Services
To scale a service up or down:
```sh
docker service scale openresponse_backend=3
```
This scales the backend service to three replicas.

## Shutting Down the Swarm
To remove the deployed stack:
```sh
docker stack rm openresponse
```
To leave the Swarm mode on a worker node:
```sh
docker swarm leave
```
On the manager node, to completely disable Swarm mode:
```sh
docker swarm leave --force
```
