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

echo "Giving privileges to run scripts..."
chmod u+x nginx/start-nginx.sh
chmod u+x db/postgres_backup.sh

# Checking if the database volume exists
if docker volume ls | grep -q "dominican-studentate-system-main_postgres_data"; then
    echo "Creating database backup..."
    chmod +x db/postgres_backup.sh
    db/postgres_backup.sh
else
    echo "Database volume 'dominican-studentate-system-main_postgres_data' not found. Could not perform backup. Exiting."
    exit 1
fi

# Checking if the frontend build volume exists, it has to be stopped before it can be removed
if docker volume ls | grep -q "dominican-studentate-system-main_frontend-build"; then
    echo "Frontend build volume found. Removing after stopping services..."
else
    echo "Volume not found. Removal is necessary for the build to work. Exiting."
    exit 1
fi

if docker compose ps | grep "Up"; then
    echo "Shutting down all services..."
    docker compose down
else
    echo "No running services found. Skipping shutdown."
fi

echo "Removing frontend builder volume..."
docker volume rm dominican-studentate-system-main_frontend-build

echo "Building all services..."
docker compose build

echo "Removing dangling images..."
docker image prune -f

echo "Starting up all services..."
docker compose up -d

echo "New version deployed successfully"
