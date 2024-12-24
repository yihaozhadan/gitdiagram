#!/bin/bash

# Pull latest changes
git pull origin main

# Build new Docker image
docker build -t gitdiagram-api .

# Stop and remove old container
docker stop gitdiagram-api || true
docker rm gitdiagram-api || true

# Run new container
docker run -d \
  --name gitdiagram-api \
  --restart unless-stopped \
  -p 8000:8000 \
  --env-file .env \
  gitdiagram-api

# Cleanup old images
docker image prune -f