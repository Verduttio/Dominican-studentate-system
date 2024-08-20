#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to the .env file, relative to the script location
SOURCE_ENV="${SCRIPT_DIR}/../.env"

# Load environment variables
set -a  # Automatically export all variables
source ${SOURCE_ENV}
set +a  # Stop automatically exporting

# Set the backup directory
BACKUP_DIR="${SCRIPT_DIR}/../backup"

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
