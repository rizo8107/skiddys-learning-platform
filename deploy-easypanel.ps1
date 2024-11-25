# Configuration
$SERVER = "root@78.46.225.53"
$REMOTE_DIR = "/opt/easypanel/data/projects/skiddys-project"
$PROJECT_NAME = "skiddys-project"

Write-Host "Starting deployment to Easypanel..."

# Create SSH command function
function Invoke-SSHCommand {
    param (
        [string]$command
    )
    ssh $SERVER $command
}

# Create SCP function
function Copy-ToServer {
    param (
        [string]$source,
        [string]$destination
    )
    scp -r $source "${SERVER}:$destination"
}

# Create project directory
Write-Host "Creating project directory..."
Invoke-SSHCommand "mkdir -p $REMOTE_DIR"

# Copy configuration files
Write-Host "Copying configuration files..."
Copy-ToServer "docker-compose.yml" "$REMOTE_DIR/"
Copy-ToServer "nginx.conf" "$REMOTE_DIR/"
Copy-ToServer "pb_config.json" "$REMOTE_DIR/"

# Create necessary directories
Write-Host "Creating directories..."
Invoke-SSHCommand "mkdir -p $REMOTE_DIR/volumes/{pb_data,pb_migrations,pb_hooks,ssl}"

# Copy PocketBase data if exists
if (Test-Path "pb_data") {
    Write-Host "Copying PocketBase data..."
    Copy-ToServer "pb_data/*" "$REMOTE_DIR/volumes/pb_data/"
}

# Copy migrations if exists
if (Test-Path "pb_migrations") {
    Write-Host "Copying migrations..."
    Copy-ToServer "pb_migrations/*" "$REMOTE_DIR/volumes/pb_migrations/"
}

# Copy hooks if exists
if (Test-Path "pb_hooks") {
    Write-Host "Copying hooks..."
    Copy-ToServer "pb_hooks/*" "$REMOTE_DIR/volumes/pb_hooks/"
}

# Set proper permissions
Write-Host "Setting permissions..."
Invoke-SSHCommand "chown -R 1000:1000 $REMOTE_DIR/volumes && chmod -R 755 $REMOTE_DIR/volumes"

# Deploy using Docker Compose
Write-Host "Deploying services..."
Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose pull && docker-compose up -d"

# Wait for services to start
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 10

# Check service status
Write-Host "Checking service status..."
Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose ps"

Write-Host "`nDeployment completed! Services should be accessible at:"
Write-Host "Frontend: https://skiddytamil.in"
Write-Host "PocketBase Admin: https://skiddytamil.in/api/_/"

# Monitor logs
Write-Host "`nMonitoring logs (Ctrl+C to exit)..."
Invoke-SSHCommand "cd $REMOTE_DIR && docker-compose logs -f"
