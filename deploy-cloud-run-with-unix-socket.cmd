@echo off
echo.
echo ===== Deploying your application to Cloud Run =====
echo.

REM Set your GCP project ID here
set PROJECT_ID=a-final-project-api

REM Set your Cloud SQL instance details
set REGION=us-central1
set INSTANCE_NAME=whackamole-db
set INSTANCE_CONNECTION_NAME=%PROJECT_ID%:%REGION%:%INSTANCE_NAME%

REM Set your database credentials
set DB_NAME=whackamole-db
set DB_USER=postgres

echo PROJECT_ID: %PROJECT_ID%
echo INSTANCE_CONNECTION_NAME: %INSTANCE_CONNECTION_NAME%
echo.

REM Build the Docker image
echo Building the Docker image...
docker build -t gcr.io/%PROJECT_ID%/whackamole-server .

REM Push the Docker image to Google Container Registry
echo.
echo Pushing the Docker image to Google Container Registry...
docker push gcr.io/%PROJECT_ID%/whackamole-server

REM Deploy to Cloud Run
echo.
echo Deploying to Cloud Run...
gcloud run deploy whackamole-server ^
  --image gcr.io/%PROJECT_ID%/whackamole-server ^
  --platform managed ^
  --region %REGION% ^
  --allow-unauthenticated ^
  --add-cloudsql-instances %INSTANCE_CONNECTION_NAME% ^
  --set-env-vars "INSTANCE_CONNECTION_NAME=%INSTANCE_CONNECTION_NAME%,DB_USER=%DB_USER%,DB_NAME=%DB_NAME%,NODE_ENV=production,DB_SOCKET_PATH=/cloudsql"

echo.
echo ===== Deployment completed! =====
echo.
echo === Important Notes ===
echo 1. Make sure your Cloud SQL instance %INSTANCE_NAME% exists in region %REGION%
echo 2. Make sure your Cloud SQL instance has the PostgreSQL database %DB_NAME% created
echo 3. Make sure your service account has proper permissions to connect to Cloud SQL
echo 4. The database password is not included in this script for security reasons. Set it using the --update-secrets flag or in the Cloud Run console.
echo.
