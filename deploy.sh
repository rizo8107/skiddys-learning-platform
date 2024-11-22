#!/bin/bash

# Update system
apt-get update
apt-get upgrade -y

# Install Docker and required packages
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    software-properties-common \
    docker.io

# Start and enable Docker
systemctl start docker
systemctl enable docker

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create app directory
mkdir -p /opt/skiddys-app
cd /opt/skiddys-app

# Set up SSL with Certbot
apt-get install -y certbot python3-certbot-nginx
