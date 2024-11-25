#!/bin/bash

# Configuration
SERVER="root@78.46.225.53"
REMOTE_DIR="/opt/easypanel/data/projects/skiddys-project"
PROJECT_NAME="skiddys-project"

echo "Starting deployment to Easypanel..."

# Create project directory on server
ssh $SERVER "mkdir -p $REMOTE_DIR"

# Copy configuration files
echo "Copying configuration files..."
scp docker-compose.yml nginx.conf pb_config.json $SERVER:$REMOTE_DIR/

# Create necessary directories
echo "Creating directories..."
ssh $SERVER "mkdir -p $REMOTE_DIR/volumes/{pb_data,pb_migrations,pb_hooks,ssl}"

# Copy PocketBase data if exists
if [ -d "pb_data" ]; then
    echo "Copying PocketBase data..."
    scp -r pb_data/* $SERVER:$REMOTE_DIR/volumes/pb_data/
fi

# Copy migrations if exists
if [ -d "pb_migrations" ]; then
    echo "Copying migrations..."
    scp -r pb_migrations/* $SERVER:$REMOTE_DIR/volumes/pb_migrations/
fi

# Copy hooks if exists
if [ -d "pb_hooks" ]; then
    echo "Copying hooks..."
    scp -r pb_hooks/* $SERVER:$REMOTE_DIR/volumes/pb_hooks/
fi

# Set proper permissions
echo "Setting permissions..."
ssh $SERVER "chown -R 1000:1000 $REMOTE_DIR/volumes && chmod -R 755 $REMOTE_DIR/volumes"

# Deploy using Docker Compose
echo "Deploying services..."
ssh $SERVER "cd $REMOTE_DIR && docker-compose pull && docker-compose up -d"

# Wait for services to start
echo "Waiting for services to start..."
sleep 10

# Check service status
echo "Checking service status..."
ssh $SERVER "cd $REMOTE_DIR && docker-compose ps"

echo "Deployment completed! Services should be accessible at:"
echo "Frontend: https://skiddytamil.in"
echo "PocketBase Admin: https://skiddytamil.in/api/_/"

# Monitor logs
echo "Monitoring logs (Ctrl+C to exit)..."
ssh $SERVER "cd $REMOTE_DIR && docker-compose logs -f"
