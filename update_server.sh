#!/bin/bash

# Configuration
APP_DIR="/opt/skiddys-app"
REPO_URL="https://github.com/rizo8107/skiddys-learning-platform.git"
BRANCH="main"

# Update system packages
echo "Updating system packages..."
apt-get update
apt-get upgrade -y

# Install Git if not installed
if ! command -v git &> /dev/null; then
    echo "Installing Git..."
    apt-get install -y git
fi

# Create or clean app directory
echo "Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Backup existing data
echo "Backing up existing data..."
if [ -d "backend/pb_data" ]; then
    cp -r backend/pb_data ../pb_data_backup
fi

# Clone or pull repository
if [ -d ".git" ]; then
    echo "Pulling latest changes..."
    git pull origin $BRANCH
else
    echo "Cloning repository..."
    git clone -b $BRANCH $REPO_URL .
fi

# Restore data backup
echo "Restoring data backup..."
if [ -d "../pb_data_backup" ]; then
    rm -rf backend/pb_data
    mv ../pb_data_backup backend/pb_data
fi

# Set permissions
echo "Setting permissions..."
chmod +x deploy.sh
chmod +x init-letsencrypt.sh

# Stop existing containers
echo "Stopping existing containers..."
docker-compose down

# Start application with SSL
echo "Starting application..."
./deploy.sh

echo "Deployment complete!"
