#!/bin/bash

# Configuration
REPO_URL="https://github.com/rizo8107/skiddys-learning-platform.git"
DOMAIN="skiddytamil.in"
EMAIL="nirmal@lifedemy.in"  # Change this to your email

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Starting deployment...${NC}"

# Update system
echo -e "${GREEN}Updating system packages...${NC}"
apt update && apt upgrade -y

# Install required packages
echo -e "${GREEN}Installing required packages...${NC}"
apt install -y docker.io docker-compose nginx certbot python3-certbot-nginx git

# Start and enable Docker
echo -e "${GREEN}Enabling Docker...${NC}"
systemctl start docker
systemctl enable docker

# Stop and disable host Nginx
echo -e "${GREEN}Stopping host Nginx service...${NC}"
systemctl stop nginx
systemctl disable nginx

# Login to GitHub Container Registry
echo -e "${GREEN}Logging in to GitHub Container Registry...${NC}"
echo "Please enter your GitHub Personal Access Token:"
read -s GITHUB_TOKEN
echo "$GITHUB_TOKEN" | docker login ghcr.io -u rizo8107 --password-stdin

# Clone the repository
echo -e "${GREEN}Cloning repository...${NC}"
git clone $REPO_URL /opt/skiddys
cd /opt/skiddys

# Create necessary directories
echo -e "${GREEN}Creating directories...${NC}"
mkdir -p ssl pb_data pb_migrations pb_hooks

# Set up SSL with Certbot
echo -e "${GREEN}Setting up SSL certificates...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Copy SSL certificates
echo -e "${GREEN}Copying SSL certificates...${NC}"
cp /etc/letsencrypt/live/$DOMAIN/fullchain.pem ssl/
cp /etc/letsencrypt/live/$DOMAIN/privkey.pem ssl/
chmod -R 755 ssl

# Stop any running containers
echo -e "${GREEN}Stopping any running containers...${NC}"
docker-compose down --remove-orphans

# Build and start services
echo -e "${GREEN}Building and starting services...${NC}"
docker-compose build --no-cache
docker-compose up -d

# Set up auto-renewal for SSL certificates
echo -e "${GREEN}Setting up SSL auto-renewal...${NC}"
echo "0 0 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew

# Show status
echo -e "${GREEN}Checking service status...${NC}"
docker-compose ps

echo -e "${BLUE}Deployment completed!${NC}"
echo -e "${GREEN}Your application should be accessible at:${NC}"
echo -e "Frontend: https://$DOMAIN"
echo -e "PocketBase Admin: https://$DOMAIN/api/_/"

# Show logs
echo -e "${GREEN}Showing logs (Ctrl+C to exit)...${NC}"
docker-compose logs -f
