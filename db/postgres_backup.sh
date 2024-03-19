#!/bin/bash

SOURCE_ENV="/home/bartek/Pulpit/dominicanAPp/Dominican-internal-management-system-main/.env"

# Load environment variables
set -a  # Automatically export all variables
source ${SOURCE_ENV}
set +a  # Stop automatically exporting

# Set the backup directory
BACKUP_DIR="/home/bartek/Pulpit/dominicanAPp/Dominican-internal-management-system-main/backup"

# Create the backup directory if it does not exist
mkdir -p ${BACKUP_DIR}

# Backup the database
docker exec dominican-internal-management-system-main-db-1 pg_dump -U ${POSTGRES_USER} ${POSTGRES_DB} > ${BACKUP_DIR}/db-backup-$(date +%Y-%m-%d_%H-%M-%S).sql

# Set using crontab -e
# and add 0 0 1 * * /path/to/postgres_backup.sh at the end of file