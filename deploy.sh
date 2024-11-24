#!/bin/bash

# Exit on error
set -e

# Configuration
APP_DIR="/opt/skiddys-app"
DOMAIN="skiddytamil.in"
EMAIL="vmanikandan8675@gmail.com"

# Update system
echo "Updating system..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "Installing required packages..."
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    docker.io \
    nginx \
    certbot \
    python3-certbot-nginx

# Start and enable Docker
echo "Setting up Docker..."
systemctl start docker
systemctl enable docker

# Install Docker Compose
echo "Installing Docker Compose..."
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
echo "Setting up application directory..."
mkdir -p $APP_DIR
cd $APP_DIR

# Create directories for SSL certificates
echo "Setting up SSL directories..."
mkdir -p certbot/conf
mkdir -p certbot/www

# Copy application files
echo "Copying application files..."
cp -r /tmp/upload/* .

# Set proper permissions
echo "Setting permissions..."
chown -R root:root .
chmod -R 755 .

# Initialize Docker Swarm if not already initialized
if ! docker info | grep -q "Swarm: active"; then
    echo "Initializing Docker Swarm..."
    docker swarm init
fi

# Build and start the application
echo "Starting application..."
docker-compose build
docker-compose up -d

# Initialize SSL certificates
echo "Setting up SSL certificates..."
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh

echo "Deployment complete! Application should be running at https://$DOMAIN"
echo "Please ensure your DNS is properly configured to point to this server's IP address."
