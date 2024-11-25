# Configuration
$SERVER = "root@78.46.225.53"
$REMOTE_DIR = "/opt/easypanel/data/projects/skiddys-project"

# Create necessary directories
Write-Host "Creating directories on server..."
ssh $SERVER "mkdir -p $REMOTE_DIR/volumes/nginx/conf.d $REMOTE_DIR/volumes/pb_data $REMOTE_DIR/volumes/pb_migrations $REMOTE_DIR/volumes/pb_hooks $REMOTE_DIR/volumes/pb_config"

# Copy Nginx configuration
Write-Host "Copying Nginx configuration..."
scp nginx.conf "${SERVER}:$REMOTE_DIR/volumes/nginx/conf.d/default.conf"

# Copy PocketBase configuration
Write-Host "Copying PocketBase configuration..."
scp pb_config.json "${SERVER}:$REMOTE_DIR/volumes/pb_config/pb_config.json"

# Set proper permissions
Write-Host "Setting permissions..."
ssh $SERVER "chown -R 1000:1000 $REMOTE_DIR/volumes/pb_* && chmod -R 755 $REMOTE_DIR/volumes/pb_*"

Write-Host "Setup completed! You can now deploy the services in Easypanel."
