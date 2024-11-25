#!/bin/bash

# Configuration
SERVER="root@78.46.225.53"
DEPLOY_PATH="/var/www/skiddytamil"
POCKETBASE_PATH="/opt/pocketbase"

# Build the frontend
echo "Building frontend..."
npm install
npm run build

# Deploy frontend files
echo "Deploying frontend files..."
ssh $SERVER "mkdir -p $DEPLOY_PATH/dist"
scp -r dist/* $SERVER:$DEPLOY_PATH/dist/

# Deploy PocketBase files
if [ -d "pb_migrations" ]; then
    echo "Deploying PocketBase migrations..."
    ssh $SERVER "mkdir -p $POCKETBASE_PATH/pb_migrations"
    scp -r pb_migrations/* $SERVER:$POCKETBASE_PATH/pb_migrations/
fi

if [ -d "pb_hooks" ]; then
    echo "Deploying PocketBase hooks..."
    ssh $SERVER "mkdir -p $POCKETBASE_PATH/pb_hooks"
    scp -r pb_hooks/* $SERVER:$POCKETBASE_PATH/pb_hooks/
fi

# Restart services
echo "Restarting services..."
ssh $SERVER "systemctl restart pocketbase"
ssh $SERVER "systemctl restart nginx"

echo "Deployment completed successfully!"
