#!/bin/bash

SOURCE_ENV="/home/bartek/Pulpit/dominicanAPp/Dominican-internal-management-system-main/.env"

# Load environment variables
set -a  # Automatically export all variables
source ${SOURCE_ENV}
set +a  # Stop automatically exporting

# Set the backup directory
BACKUP_DIR="/home/bartek/Pulpit/dominicanAPp/Dominican-internal-management-system-main/backup"

# Check if a backup file is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 <backup-file.sql>"
  exit 1
fi

# Path to the backup file
BACKUP_FILE="$1"

# Restore the database
cat ${BACKUP_FILE} | docker exec -i dominican-internal-management-system-main-db-1 psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

echo "Database restored from ${BACKUP_FILE}"
