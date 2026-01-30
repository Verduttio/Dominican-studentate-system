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
chmod u+x renew_cert.sh
chmod u+x branch_name.sh

branch=$(./branch_name.sh)
echo "Repo based on branch: $branch"

# Checking if the database volume exists
if docker volume ls | grep -q "dominican-studentate-system-${branch}_postgres_data"; then
    echo "Creating database backup..."
    chmod +x db/postgres_backup.sh
    db/postgres_backup.sh
else
    echo "Database volume 'dominican-studentate-system-${branch}_postgres_data' not found. Could not perform backup. Exiting."
    exit 1
fi

# Checking if the frontend build volume exists (it may not exist - that's OK)
FRONTEND_VOL="dominican-studentate-system-${branch}_frontend-build"

if docker volume inspect "${FRONTEND_VOL}" >/dev/null 2>&1; then
    echo "Frontend build volume '${FRONTEND_VOL}' found. It will be removed before build."
    FRONTEND_VOL_EXISTS=1
else
    echo "Frontend build volume '${FRONTEND_VOL}' not found. Skipping removal."
    FRONTEND_VOL_EXISTS=0
fi

if docker compose ps | grep "Up"; then
    echo "Shutting down all services..."
    docker compose down
else
    echo "No running services found. Skipping shutdown."
fi

if [ "${FRONTEND_VOL_EXISTS}" -eq 1 ]; then
    echo "Removing frontend builder volume..."
    docker volume rm "${FRONTEND_VOL}"
fi

echo "Building all services..."
docker compose build

echo "Removing dangling images..."
docker image prune -f

echo "Starting up all services..."
docker compose up -d

echo "New version deployed successfully"
