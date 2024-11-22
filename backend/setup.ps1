# Download Pocketbase
$url = "https://github.com/pocketbase/pocketbase/releases/download/v0.21.1/pocketbase_0.21.1_windows_amd64.zip"
$output = "pocketbase.zip"
Invoke-WebRequest -Uri $url -OutFile $output

# Extract the zip file
Expand-Archive -Path $output -DestinationPath "."

# Remove the zip file
Remove-Item $output

Write-Host "Pocketbase has been downloaded and extracted successfully!"
Write-Host "To start Pocketbase, run: ./pocketbase serve"
