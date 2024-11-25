#!/bin/bash

# Build the frontend
npm run build

# Deploy to server
rsync -avz --delete ./dist/ root@78.46.225.53:/var/www/skiddytamil/
rsync -avz ./pb_migrations/ root@78.46.225.53:/opt/pocketbase/pb_migrations/
rsync -avz ./pb_hooks/ root@78.46.225.53:/opt/pocketbase/pb_hooks/

echo "Deployment completed!"
