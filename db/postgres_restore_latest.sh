#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to the .env file, relative to the script location
SOURCE_ENV="${SCRIPT_DIR}/../.env"

# Get branch name
branch=$("${SCRIPT_DIR}/../branch_name.sh")
echo "Branch: $branch"

# Load environment variables
set -a  # Automatically export all variables
source ${SOURCE_ENV}
set +a  # Stop automatically exporting

# Set the backup directory, relative to the script location
BACKUP_DIR="${SCRIPT_DIR}/backup"

# Get the latest backup file (sorted by time)
LATEST_BACKUP=$(ls -t ${BACKUP_DIR}/db-backup-*.sql | head -n 1)

# Check if a backup file exists
if [[ -z "$LATEST_BACKUP" ]]; then
  echo "No backup file found!"
  exit 1
fi

docker exec -i dominican-studentate-system-${branch}-db-1 psql -U ${POSTGRES_USER} -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"
cat ${LATEST_BACKUP} | docker exec -i dominican-studentate-system-${branch}-db-1 psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

echo "Database restored from ${LATEST_BACKUP}"
