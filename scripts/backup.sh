#!/bin/bash

# Database Backup Script for Disaster Recovery
# This script dumps the Postgres database and compresses it.
# You can mount an S3 bucket or external volume to the BACKUP_DIR.

set -e

# Configuration
DB_URL=${DATABASE_URL}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sql.gz"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

if [ -z "$DB_URL" ]; then
  echo "Error: DATABASE_URL environment variable is not set."
  exit 1
fi

echo "Starting database backup..."
pg_dump "$DB_URL" | gzip > "$BACKUP_FILE"

echo "Backup created successfully: $BACKUP_FILE"

# Optional: Cleanup backups older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -exec rm {} \;
echo "Old backups cleaned up."
