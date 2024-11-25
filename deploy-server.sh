#!/bin/bash

# Create necessary directories
mkdir -p /var/www/skiddytamil
mkdir -p /opt/pocketbase

# Update system and install required packages
apt update && apt upgrade -y
apt install -y nginx certbot python3-certbot-nginx ufw unzip wget

# Configure firewall
ufw allow 22
ufw allow 80
ufw allow 443
ufw --force enable

# Download and setup PocketBase
cd /opt
wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.1/pocketbase_0.21.1_linux_amd64.zip
unzip pocketbase_0.21.1_linux_amd64.zip -d pocketbase
rm pocketbase_0.21.1_linux_amd64.zip

# Create PocketBase service
cat > /etc/systemd/system/pocketbase.service << 'EOF'
[Unit]
Description=PocketBase service
After=network.target

[Service]
Type=simple
User=root
ExecStart=/opt/pocketbase/pocketbase serve --http=127.0.0.1:8090
WorkingDirectory=/opt/pocketbase
Restart=always

[Install]
WantedBy=multi-user.target
EOF

# Create Nginx configuration
cat > /etc/nginx/sites-available/skiddytamil.in << 'EOF'
server {
    listen 80;
    server_name skiddytamil.in www.skiddytamil.in;

    root /var/www/skiddytamil/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html =404;
        add_header Cache-Control "no-cache";
    }

    location /api/ {
        rewrite ^/api/(.*) /$1 break;
        proxy_pass http://127.0.0.1:8090;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /_/ {
        proxy_pass http://127.0.0.1:8090/_/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Additional security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    add_header Content-Security-Policy "default-src 'self' http: https: data: blob: 'unsafe-inline'" always;
}
EOF

# Enable the site
ln -sf /etc/nginx/sites-available/skiddytamil.in /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Start services
systemctl daemon-reload
systemctl enable pocketbase
systemctl start pocketbase
systemctl restart nginx

# Get SSL certificate
certbot --nginx -d skiddytamil.in -d www.skiddytamil.in --non-interactive --agree-tos --email admin@skiddytamil.in

echo "Server setup completed!"
