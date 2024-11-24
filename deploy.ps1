# Build frontend
Write-Host "Building frontend..."
npm run build

# Create deployment directory
Write-Host "Creating deployment package..."
$tempDir = "deploy_temp"
New-Item -ItemType Directory -Force -Path $tempDir

# Copy files to temp directory
Copy-Item -Path "dist" -Destination $tempDir -Recurse
Copy-Item -Path "backend" -Destination $tempDir -Recurse
Copy-Item -Path "docker-compose.yml" -Destination $tempDir
Copy-Item -Path "nginx.conf" -Destination $tempDir
Copy-Item -Path "init-letsencrypt.sh" -Destination $tempDir
Copy-Item -Path "deploy.sh" -Destination $tempDir

# Create archive
Compress-Archive -Path "$tempDir\*" -DestinationPath "deploy.zip" -Force

# Cleanup
Remove-Item -Path $tempDir -Recurse

Write-Host "Deployment package created: deploy.zip"
Write-Host "To deploy:"
Write-Host "1. Copy deploy.zip to your server:"
Write-Host "   scp deploy.zip root@your-server-ip:/tmp/"
Write-Host "2. SSH into your server:"
Write-Host "   ssh root@your-server-ip"
Write-Host "3. Run these commands:"
Write-Host "   cd /tmp"
Write-Host "   unzip deploy.zip -d /tmp/upload/"
Write-Host "   cd /opt/skiddys-app"
Write-Host "   ./deploy.sh"
