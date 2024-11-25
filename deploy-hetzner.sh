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

# Create docker-compose.yml
echo -e "${GREEN}Creating docker-compose configuration...${NC}"
cat > docker-compose.yml << 'EOL'
version: '3'

services:
  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_API_URL=https://skiddytamil.in/api
    volumes:
      - ./dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    networks:
      - default
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3

  pocketbase:
    image: ghcr.io/muchobien/pocketbase:latest
    restart: unless-stopped
    ports:
      - "8090:8090"
    environment:
      - SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
      - SMTP_PORT=587
      - SMTP_USERNAME=AKIA46BWJRR3A3ZAIEXZ
      - SMTP_PASSWORD=BP/mgFX44Zq55129YEVCBRLXL9l3IVG9JxFITKfm5EMQ
      - SMTP_SECURE=true
    volumes:
      - ./pb_data:/pb/pb_data
      - ./pb_migrations:/pb/pb_migrations
      - ./pb_hooks:/pb/pb_hooks
      - ./pb_config.json:/pb/pb_config.json
    networks:
      - default
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:8090/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3

networks:
  default:
    driver: bridge

volumes:
  pb_data:
  pb_migrations:
  pb_hooks:
  ssl:
EOL

# Create nginx configuration
echo -e "${GREEN}Creating Nginx configuration...${NC}"
cat > nginx.conf << 'EOL'
server {
    listen 80;
    listen [::]:80;
    server_name skiddytamil.in www.skiddytamil.in;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name skiddytamil.in www.skiddytamil.in;

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }

    location /api/ {
        proxy_pass http://pocketbase:8090/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_/ {
        proxy_pass http://pocketbase:8090/_/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOL

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
