#!/bin/bash

# Exit on any error
set -e

# Navigate to project directory
cd ~/gitdiagram

# Pull latest changes
git pull origin main

# Build and restart containers
docker compose down
docker compose up --build -d

# Remove unused images
docker image prune -f

# Show logs
docker compose logs -f