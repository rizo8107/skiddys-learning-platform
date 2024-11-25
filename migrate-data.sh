#!/bin/bash

# Configuration
LOCAL_PB_DIR="./backend/pb_data"
REMOTE_HOST="root@78.46.225.53"
REMOTE_DIR="/opt/skiddytamil/pb_data"

# Create a temporary backup
echo "Creating backup of local PocketBase data..."
tar -czf pb_data_backup.tar.gz $LOCAL_PB_DIR

# Copy backup to remote server
echo "Copying backup to remote server..."
scp pb_data_backup.tar.gz $REMOTE_HOST:/tmp/

# Extract backup on remote server and replace existing data
echo "Extracting backup on remote server..."
ssh $REMOTE_HOST "cd /tmp && \
                  tar -xzf pb_data_backup.tar.gz && \
                  rm -rf $REMOTE_DIR/* && \
                  mv backend/pb_data/* $REMOTE_DIR/ && \
                  rm -rf backend pb_data_backup.tar.gz && \
                  chown -R root:root $REMOTE_DIR"

# Clean up local backup
rm pb_data_backup.tar.gz

echo "Migration completed! Please restart the PocketBase service in Easypanel."
