#!/bin/bash

# Configuration
DOMAIN="skiddytamil.in"
EMAIL="nirmal@lifedemy.in"

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
apt install -y nginx certbot python3-certbot-nginx nodejs npm wget unzip

# Stop any existing services
echo -e "${GREEN}Stopping existing services...${NC}"
systemctl stop nginx
systemctl stop pocketbase
killall nginx
killall pocketbase

# Clean up any existing processes using ports 80 and 443
echo -e "${GREEN}Cleaning up ports...${NC}"
lsof -ti:80,443 | xargs -r kill -9

# Install pnpm
echo -e "${GREEN}Installing pnpm...${NC}"
npm install -g pnpm

# Download PocketBase
echo -e "${GREEN}Downloading PocketBase...${NC}"
mkdir -p /opt/pocketbase
cd /opt/pocketbase
wget https://github.com/pocketbase/pocketbase/releases/latest/download/pocketbase_linux_amd64.zip
unzip -o pocketbase_linux_amd64.zip
rm pocketbase_linux_amd64.zip
chmod +x pocketbase

# Create PocketBase service
echo -e "${GREEN}Creating PocketBase service...${NC}"
cat > /etc/systemd/system/pocketbase.service << EOL
[Unit]
Description=PocketBase Service
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/opt/pocketbase
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090
Restart=always
Environment=SMTP_HOST=email-smtp.ap-south-1.amazonaws.com
Environment=SMTP_PORT=587
Environment=SMTP_USERNAME=AKIA46BWJRR3A3ZAIEXZ
Environment=SMTP_PASSWORD=BP/mgFX44Zq55129YEVCBRLXL9l3IVG9JxFITKfm5EMQ
Environment=SMTP_SECURE=true

[Install]
WantedBy=multi-user.target
EOL

# Clone and build frontend
echo -e "${GREEN}Cloning and building frontend...${NC}"
cd /opt
rm -rf skiddys
git clone https://github.com/rizo8107/skiddys-learning-platform.git skiddys
cd skiddys
pnpm install
VITE_API_URL=https://skiddytamil.in/api pnpm build

# Configure Nginx first
echo -e "${GREEN}Configuring Nginx...${NC}"
rm -f /etc/nginx/sites-enabled/default
cat > /etc/nginx/sites-available/skiddys.conf << EOL
server {
    listen 80;
    listen [::]:80;
    server_name skiddytamil.in www.skiddytamil.in;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name skiddytamil.in www.skiddytamil.in;

    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;
    ssl_session_timeout 1d;
    ssl_session_cache shared:SSL:50m;
    ssl_session_tickets off;

    # Modern configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;

    root /opt/skiddys/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml application/javascript;
    gzip_disable "MSIE [1-6]\.";

    location / {
        try_files \$uri \$uri/ /index.html;
        add_header Cache-Control "no-cache";
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Content-Type-Options "nosniff";
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8090/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    location /_/ {
        proxy_pass http://127.0.0.1:8090/_/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOL

# Enable the site
ln -sf /etc/nginx/sites-available/skiddys.conf /etc/nginx/sites-enabled/

# Test Nginx configuration
echo -e "${GREEN}Testing Nginx configuration...${NC}"
nginx -t

# Set up SSL with Certbot
echo -e "${GREEN}Setting up SSL certificates...${NC}"
certbot --nginx -d $DOMAIN -d www.$DOMAIN --non-interactive --agree-tos --email $EMAIL

# Start services
echo -e "${GREEN}Starting services...${NC}"
systemctl daemon-reload

# Start PocketBase first
systemctl enable pocketbase
systemctl start pocketbase
sleep 5

# Then start Nginx
systemctl enable nginx
systemctl start nginx

# Set up SSL auto-renewal
echo -e "${GREEN}Setting up SSL auto-renewal...${NC}"
echo "0 0 * * * root certbot renew --quiet" > /etc/cron.d/certbot-renew

echo -e "${BLUE}Deployment completed!${NC}"
echo -e "${GREEN}Your application should be accessible at:${NC}"
echo -e "Frontend: https://$DOMAIN"
echo -e "PocketBase Admin: https://$DOMAIN/api/_/"

# Show service status
echo -e "${GREEN}Service status:${NC}"
systemctl status nginx
systemctl status pocketbase

# Show logs if there are any issues
echo -e "${GREEN}Recent logs:${NC}"
journalctl -u nginx --no-pager -n 50
journalctl -u pocketbase --no-pager -n 50
