#!/bin/bash

# Get the directory of the current script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Path to the .env file, relative to the script location
SOURCE_ENV="${SCRIPT_DIR}/../.env"

# Load environment variables
set -a  # Automatically export all variables
source ${SOURCE_ENV}
set +a  # Stop automatically exporting

# Set the backup directory, relative to the script location
BACKUP_DIR="${SCRIPT_DIR}/backup"

# Create the backup directory if it does not exist
mkdir -p ${BACKUP_DIR}

# Backup the database
docker exec -t resource-management-system-main-db-1 pg_dump -c -U ${POSTGRES_USER} ${POSTGRES_DB} > ${BACKUP_DIR}/db-backup-`date +%Y-%m-%d"_"%H_%M_%S`.sql

# Add this to crontab to run the backup automatically
# crontab -e
# and add the following line to schedule it to run on the 1st of every month at midnight:
# 0 0 1 * * /path/to/postgres_backup.sh
