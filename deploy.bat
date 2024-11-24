@echo off
echo Deploying to server...

rem Create a temporary directory
mkdir deploy_temp
xcopy /E /I dist deploy_temp\dist
xcopy /E /I backend deploy_temp\backend
copy docker-compose.yml deploy_temp\
copy nginx.conf deploy_temp\
copy init-letsencrypt.sh deploy_temp\
copy deploy.sh deploy_temp\

rem Create deployment archive
powershell Compress-Archive -Path deploy_temp\* -DestinationPath deploy.zip -Force

rem Upload to server
echo Uploading files...
pscp -pw Life@123 deploy.zip root@78.46.225.53:/tmp/

rem Execute deployment commands
echo Running deployment...
plink -pw Life@123 root@78.46.225.53 "cd /tmp && unzip -o deploy.zip -d /opt/skiddys-app/ && cd /opt/skiddys-app && chmod +x deploy.sh && ./deploy.sh"

rem Cleanup
rmdir /S /Q deploy_temp
del deploy.zip

echo Deployment complete!
