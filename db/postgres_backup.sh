#!/bin/bash
set -euo pipefail

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to the .env file, relative to the script location
SOURCE_ENV="${SCRIPT_DIR}/../.env"

# Get branch name
branch=$("${SCRIPT_DIR}/../branch_name.sh")
echo "Branch: $branch"

# Load environment variables
set -a  # Automatically export all variables
source "${SOURCE_ENV}"
set +a  # Stop automatically exporting

# Set the backup directory, relative to the script location
BACKUP_DIR="${SCRIPT_DIR}/backup"

# Create the backup directory if it does not exist
mkdir -p "${BACKUP_DIR}"

# Target DB container name (depends on branch)
CONTAINER="dominican-studentate-system-${branch}-db-1"

# Backup file path
STAMP="$(date +%Y-%m-%d_%H_%M_%S)"
OUT="${BACKUP_DIR}/db-backup-${STAMP}.sql"

# If the container does not exist, skip backup (first deploy or previous deploy cleanup)
if ! docker container inspect "${CONTAINER}" >/dev/null 2>&1; then
  echo "DB container '${CONTAINER}' does not exist. Skipping backup."
  exit 0
fi

# Check if the container is running
RUNNING="$(docker inspect -f '{{.State.Running}}' "${CONTAINER}")"

# Track whether this script started the container
STARTED_BY_SCRIPT=0

# If the container exists but is not running, start it temporarily
if [ "${RUNNING}" != "true" ]; then
  echo "DB container exists but is not running. Starting it temporarily..."
  docker start "${CONTAINER}" >/dev/null
  STARTED_BY_SCRIPT=1

  # Wait until Postgres is ready to accept connections
  echo "Waiting for Postgres to become ready..."
  for i in {1..30}; do
    if docker exec "${CONTAINER}" pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then
      break
    fi
    sleep 1
  done

  # If Postgres is still not ready, skip backup
  if ! docker exec "${CONTAINER}" pg_isready -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" >/dev/null 2>&1; then
    echo "Postgres did not become ready in time. Skipping backup."
    exit 0
  fi
fi

# Create the database backup
echo "Creating DB backup -> ${OUT}"
docker exec -t "${CONTAINER}" pg_dump -c -U "${POSTGRES_USER}" "${POSTGRES_DB}" > "${OUT}"

# If the script started the container, stop it again to restore previous state
if [ "${STARTED_BY_SCRIPT}" -eq 1 ]; then
  echo "Stopping DB container (started temporarily by this script)..."
  docker stop "${CONTAINER}" >/dev/null
fi

echo "Backup done."

# Add this to crontab to run the backup automatically
# crontab -e
# and add the following line to schedule it to run on the 1st of every month at midnight:
# 0 0 1 * * /path/to/postgres_backup.sh
