#!/bin/bash

set -e

log_file="deployment.log"
exec > >(tee -i $log_file)
exec 2>&1

handle_error() {
    echo "An error occurred during the deployment. Check the log file: $log_file"
    exit 1
}

trap 'handle_error' ERR

# Checking if the database volume exists
if docker volume ls | grep -q "dominican-studentate-system-main-db-1"; then
    echo "Creating database backup..."
    chmod +x db/postgres_backup.sh
    db/postgres_backup.sh
else
    echo "Database volume 'dominican-studentate-system-main-db-1' not found. Skipping backup."
fi

# Checking if the frontend build volume exists
if docker compose ps | grep "Up"; then
    echo "Shutting down all services..."
    docker compose down
else
    echo "No running services found. Skipping shutdown."
fi

echo "Removing frontend builder volume..."
docker volume rm dominican-studentate-system-main-frontend-builder || echo "Volume not found, skipping removal."

echo "Building all services..."
docker compose build

echo "Removing dangling images..."
docker image prune

echo "Starting up all services..."
docker compose up -d

echo "New version deployed successfully"
