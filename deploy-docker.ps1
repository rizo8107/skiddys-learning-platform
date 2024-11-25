# Generate SSL certificates if they don't exist
if (-not (Test-Path "./ssl/fullchain.pem")) {
    Write-Host "Generating SSL certificates..."
    New-Item -ItemType Directory -Force -Path "./ssl"
    
    # Using OpenSSL to generate self-signed certificate
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout "./ssl/privkey.pem" `
        -out "./ssl/fullchain.pem" `
        -subj "/C=IN/ST=Tamil Nadu/L=Chennai/O=Skiddys/CN=localhost"
}

# Build and start the services
Write-Host "Building and starting services..."
docker-compose build --no-cache
docker-compose up -d

# Wait for services to start
Write-Host "Waiting for services to start..."
Start-Sleep -Seconds 10

# Check service status
Write-Host "Checking service status..."
docker-compose ps

Write-Host "`nDeployment completed! Services should be accessible at:"
Write-Host "Frontend: https://localhost"
Write-Host "PocketBase Admin: https://localhost/api/_/"

# Show logs
Write-Host "`nShowing logs (Ctrl+C to exit)..."
docker-compose logs -f
