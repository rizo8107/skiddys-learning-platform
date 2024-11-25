#!/bin/bash

# Update system
sudo apt update && sudo apt upgrade -y

# Install required packages
sudo apt install -y nginx certbot python3-certbot-nginx ufw

# Configure firewall
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw --force enable

# Create directories
sudo mkdir -p /var/www/skiddytamil
sudo mkdir -p /opt/pocketbase

# Download and setup PocketBase
wget https://github.com/pocketbase/pocketbase/releases/download/v0.21.1/pocketbase_0.21.1_linux_amd64.zip
unzip pocketbase_0.21.1_linux_amd64.zip -d /opt/pocketbase
rm pocketbase_0.21.1_linux_amd64.zip

# Create PocketBase service
sudo tee /etc/systemd/system/pocketbase.service << EOF
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

# Start PocketBase service
sudo systemctl daemon-reload
sudo systemctl enable pocketbase
sudo systemctl start pocketbase

# Configure Nginx
sudo cp ./nginx.conf /etc/nginx/sites-available/skiddytamil.in
sudo ln -s /etc/nginx/sites-available/skiddytamil.in /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d skiddytamil.in -d www.skiddytamil.in --non-interactive --agree-tos --email admin@skiddytamil.in

echo "Setup completed! Your server is ready."
