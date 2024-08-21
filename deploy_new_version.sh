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

echo "Creating database backup..."
db/postgres_backup.sh

echo "Shutting down all services..."
docker compose down

echo "Removing frontend builder volume..."
docker volume rm resource-management-system-main_frontend-build

echo "Building all services..."
docker compose build

echo "Starting up all services..."
docker compose up -d

echo "New version deployed successfully"