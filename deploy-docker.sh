#!/bin/bash

# Configuration
SERVER="root@78.46.225.53"
REMOTE_DIR="/opt/skiddytamil"

# Create necessary directories on the server
echo "Creating directories on server..."
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Copy files to server
echo "Copying files to server..."
scp docker-compose.yml Dockerfile nginx.conf $SERVER:$REMOTE_DIR/
scp -r dist pb_migrations pb_hooks $SERVER:$REMOTE_DIR/

# Install Docker and Docker Compose on the server if not already installed
echo "Setting up Docker on server..."
ssh $SERVER "apt-get update && apt-get install -y docker.io docker-compose"

# Start the application
echo "Starting the application..."
ssh $SERVER "cd $REMOTE_DIR && docker-compose up -d"

# Setup SSL with Certbot
echo "Setting up SSL..."
ssh $SERVER "apt-get install -y certbot python3-certbot-nginx && \
             certbot --nginx -d skiddytamil.in -d www.skiddytamil.in --non-interactive --agree-tos --email your-email@example.com"

echo "Deployment completed! Your application should be running at https://skiddytamil.in"
