#!/bin/bash

set -e

echo "Initializing Docker Swarm..."
docker swarm init || echo "Swarm already initialized"

echo "Creating overlay network..."
docker network create --driver overlay openresponse_network || echo "Network already exists"

echo "Building Docker images..."
docker build -t openresponse_backend ./core
docker build -t openresponse_frontend ./client
docker build -t openresponse_socket ./socket

echo "First-time setup complete. Use 'docker service ls' to check running services."
