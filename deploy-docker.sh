#!/bin/bash

# Configuration
SERVER="root@78.46.225.53"
REMOTE_DIR="/opt/skiddytamil"
LOCAL_PB_DIR="./backend/pb_data"

# Create necessary directories on the server
echo "Creating directories on server..."
ssh $SERVER "mkdir -p $REMOTE_DIR/pb_data $REMOTE_DIR/pb_migrations $REMOTE_DIR/pb_hooks"

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
               mv backend/pb_data/* $REMOTE_DIR/pb_data/ && \
               rm -rf backend pb_data_backup.tar.gz && \
               chown -R root:root $REMOTE_DIR/pb_data"
  
  # Clean up local backup
  rm pb_data_backup.tar.gz
fi

# Copy files to server
echo "Copying files to server..."
scp docker-compose.yml Dockerfile nginx.conf pb_config.json $SERVER:$REMOTE_DIR/
scp -r dist pb_migrations pb_hooks $SERVER:$REMOTE_DIR/

# Install Docker and Docker Compose on the server if not already installed
echo "Setting up Docker on server..."
ssh $SERVER "apt-get update && apt-get install -y docker.io docker-compose"

# Start the application
echo "Starting the application..."
ssh $SERVER "cd $REMOTE_DIR && docker-compose pull && docker-compose up -d"

# Setup SSL with Certbot
echo "Setting up SSL..."
ssh $SERVER "apt-get install -y certbot python3-certbot-nginx && \
             certbot --nginx -d skiddytamil.in -d www.skiddytamil.in --non-interactive --agree-tos --email your-email@example.com"

echo "Deployment completed! Your application should be running at https://skiddytamil.in"
