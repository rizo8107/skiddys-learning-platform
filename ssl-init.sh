#!/bin/bash

# Create directories
mkdir -p certbot/conf/live/skiddytamil.in
mkdir -p certbot/www

# Create SSL configuration files
cat > certbot/conf/options-ssl-nginx.conf << 'EOF'
ssl_session_cache shared:le_nginx_SSL:10m;
ssl_session_timeout 1440m;
ssl_session_tickets off;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_prefer_server_ciphers off;

ssl_ciphers "ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384";
EOF

# Generate strong DH parameters
openssl dhparam -out certbot/conf/ssl-dhparams.pem 2048

# Create dummy certificates for initial setup
openssl req -x509 -nodes -newkey rsa:2048 -days 1 \
    -keyout certbot/conf/live/skiddytamil.in/privkey.pem \
    -out certbot/conf/live/skiddytamil.in/fullchain.pem \
    -subj "/CN=skiddytamil.in/emailAddress=contact@thesocialmediacompany.in"

# Set permissions
chmod -R 755 certbot/conf
chmod -R 755 certbot/www
