# Server details
$server = "78.46.225.53"
$username = "root"
$password = "Life@123"
$remotePath = "/opt/skiddys-app"

# Create remote directory structure
ssh root@78.46.225.53 "mkdir -p $remotePath"

# Upload files using scp
Write-Host "Uploading files to server..."
scp -r dist backend docker-compose.yml nginx.conf init-letsencrypt.sh deploy.sh root@78.46.225.53:$remotePath/

# Connect to server and run deployment
Write-Host "Running deployment script..."
ssh root@78.46.225.53 "cd $remotePath && chmod +x deploy.sh && ./deploy.sh"
