#!/bin/sh

# Start PocketBase in the background
/usr/local/bin/pocketbase serve --http="0.0.0.0:8090" --dir="/pb_data" &

# Start Nginx in the foreground
nginx -g "daemon off;"