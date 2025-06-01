#!/bin/bash

set -e

echo "Building backend image"
docker build -t openresponse_backend ./core

echo "Building frontend image"
docker build -t openresponse_frontend ./client

echo "Building socket image"
docker build -t openresponse_socket ./socket 


echo "Removing existing stack"
docker stack rm openresponse

echo "Deploying stack"
docker stack deploy -c docker-stack.yml openresponse

echo "Deployment complete."
