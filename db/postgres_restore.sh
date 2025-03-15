#!/bin/bash

# Get branch name
branch=$(../branch_name.sh)
echo "Branch: $branch"

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to the .env file, relative to the script location
SOURCE_ENV="${SCRIPT_DIR}/../.env"

# Load environment variables
set -a  # Automatically export all variables
source ${SOURCE_ENV}
set +a  # Stop automatically exporting

# Check if a backup file is provided as an argument
if [ -z "$1" ]; then
  echo "Usage: $0 backup/<backup-file.sql>"
  exit 1
fi

# Path to the backup file
BACKUP_FILE="$1"

# Restore the database
docker exec -i dominican-studentate-system-${branch}-db-1 psql -U ${POSTGRES_USER} -d postgres -c "DROP DATABASE IF EXISTS ${POSTGRES_DB};"
cat ${BACKUP_FILE} | docker exec -i dominican-studentate-system-${branch}-db-1 psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

echo "Database restored from ${BACKUP_FILE}"
