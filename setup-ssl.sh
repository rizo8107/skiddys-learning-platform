#!/bin/bash

# Create SSL directory if it doesn't exist
mkdir -p ./ssl

# Generate self-signed certificate for development
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ./ssl/privkey.pem \
  -out ./ssl/fullchain.pem \
  -subj "/C=IN/ST=Tamil Nadu/L=Chennai/O=Skiddys/CN=skiddytamil.in"

# Set proper permissions
chmod 600 ./ssl/privkey.pem
chmod 644 ./ssl/fullchain.pem
