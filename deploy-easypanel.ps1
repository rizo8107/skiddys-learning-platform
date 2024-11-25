# Configuration
$SERVER = "root@78.46.225.53"
$REMOTE_DIR = "/opt/easypanel/data/projects/skiddys-project/volumes"
$LOCAL_PB_DIR = ".\pb_data"

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

# 1. Create backup of PocketBase data
if (Test-Path $LOCAL_PB_DIR) {
    Write-Host "Creating backup of PocketBase data..."
    Compress-Archive -Path $LOCAL_PB_DIR -DestinationPath "pb_data_backup.zip" -Force
    
    Write-Host "Copying PocketBase data to server..."
    Copy-ToServer "pb_data_backup.zip" "/tmp/"
    
    # Extract on server
    Write-Host "Extracting PocketBase data on server..."
    Invoke-SSHCommand "cd /tmp && unzip -o pb_data_backup.zip && rm -rf '$REMOTE_DIR/pb_data/*' && cp -r pb_data/* '$REMOTE_DIR/pb_data/' && rm -rf pb_data pb_data_backup.zip && chown -R 1000:1000 '$REMOTE_DIR/pb_data'"
    
    # Cleanup local backup
    Remove-Item "pb_data_backup.zip" -Force
}

# 2. Copy configuration files
Write-Host "Copying configuration files..."
Copy-ToServer "pb_config.json" "$REMOTE_DIR/pb_config/"
Invoke-SSHCommand "chown 1000:1000 '$REMOTE_DIR/pb_config/pb_config.json'"

# 3. Copy migrations if they exist
if (Test-Path "pb_migrations") {
    Write-Host "Copying migrations..."
    Copy-ToServer "pb_migrations/*" "$REMOTE_DIR/pb_migrations/"
    Invoke-SSHCommand "chown -R 1000:1000 '$REMOTE_DIR/pb_migrations'"
}

# 4. Copy hooks if they exist
if (Test-Path "pb_hooks") {
    Write-Host "Copying hooks..."
    Copy-ToServer "pb_hooks/*" "$REMOTE_DIR/pb_hooks/"
    Invoke-SSHCommand "chown -R 1000:1000 '$REMOTE_DIR/pb_hooks'"
}

# 5. Restart PocketBase service
Write-Host "Restarting PocketBase service..."
Invoke-SSHCommand "cd /opt/easypanel && docker-compose restart skiddys-project-pocketbase"

Write-Host "Deployment completed! PocketBase service has been restarted."
