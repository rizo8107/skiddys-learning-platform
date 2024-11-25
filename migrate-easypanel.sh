#!/bin/bash

# Configuration
SERVER="root@78.46.225.53"
REMOTE_DIR="/opt/easypanel/data/projects/skiddys-project/volumes"
LOCAL_PB_DIR="./pb_data"

# Create a temporary backup of PocketBase data
echo "Creating backup of local PocketBase data..."
if [ -d "$LOCAL_PB_DIR" ]; then
    tar -czf pb_data_backup.tar.gz $LOCAL_PB_DIR
    echo "Copying PocketBase data to server..."
    scp pb_data_backup.tar.gz $SERVER:/tmp/

    # Extract backup on remote server
    echo "Extracting PocketBase data on server..."
    ssh $SERVER "cd /tmp && \
                 tar -xzf pb_data_backup.tar.gz && \
                 rm -rf $REMOTE_DIR/pb_data/* && \
                 cp -r pb_data/* $REMOTE_DIR/pb_data/ && \
                 rm -rf pb_data pb_data_backup.tar.gz && \
                 chown -R 1000:1000 $REMOTE_DIR/pb_data"

    # Clean up local backup
    rm pb_data_backup.tar.gz
fi

# Copy configuration files
echo "Copying configuration files..."
scp pb_config.json $SERVER:$REMOTE_DIR/pb_config/
ssh $SERVER "chown 1000:1000 $REMOTE_DIR/pb_config/pb_config.json"

# Copy migrations and hooks if they exist
if [ -d "pb_migrations" ]; then
    echo "Copying migrations..."
    scp -r pb_migrations/* $SERVER:$REMOTE_DIR/pb_migrations/
    ssh $SERVER "chown -R 1000:1000 $REMOTE_DIR/pb_migrations"
fi

if [ -d "pb_hooks" ]; then
    echo "Copying hooks..."
    scp -r pb_hooks/* $SERVER:$REMOTE_DIR/pb_hooks/
    ssh $SERVER "chown -R 1000:1000 $REMOTE_DIR/pb_hooks"
fi

# Restart PocketBase service in Easypanel
echo "Restarting PocketBase service..."
ssh $SERVER "cd /opt/easypanel && docker-compose restart skiddys-project-pocketbase"

echo "Migration completed! PocketBase service has been restarted."
