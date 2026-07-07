@echo off
:: ==================================================
:: LifeLink - Deploying Backend to Google Cloud Run (Windows)
:: ==================================================

setlocal

:: Configuration variables (Adjust these before running)
set PROJECT_ID=your-gcp-project-id
set REGION=us-central1
set SERVICE_NAME=lifelink-backend
set REPO_NAME=lifelink-repo

echo ==================================================
echo Checking configurations...
echo Target GCP Project ID: %PROJECT_ID%
echo Target Location:      %REGION%
echo Target Service Name:   %SERVICE_NAME%
echo ==================================================

:: Check if gcloud is installed
where gcloud >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: 'gcloud' CLI is not recognized or not on your PATH.
    echo Please install the Google Cloud SDK first: https://cloud.google.com/sdk/docs/install
    pause
    exit /b 1
)

:: 1. Enable Google Cloud APIs
echo Enabling Google Cloud APIs (Cloud Run, Cloud Build, Artifact Registry)...
call gcloud services enable artifactregistry.googleapis.com run.googleapis.com --project="%PROJECT_ID%"

:: 2. Create Repository if it doesn't exist
echo Checking Docker Artifact Registry repository...
call gcloud artifacts repositories describe "%REPO_NAME%" --location="%REGION%" --project="%PROJECT_ID%" >nul 2>nul
if %errorlevel% neq 0 (
    echo Creating Artifact Registry repository...
    call gcloud artifacts repositories create "%REPO_NAME%" --repository-format=docker --location="%REGION%" --description="Docker repository for LifeLink backend" --project="%PROJECT_ID%"
)

:: 3. Build & push image using Google Cloud Build
echo Building and pushing container image via Google Cloud Build...
set IMAGE_URI=%REGION%-docker.pkg.dev/%PROJECT_ID%/%REPO_NAME%/backend:latest
call gcloud builds submit --tag "%IMAGE_URI%" --project="%PROJECT_ID%"

:: 4. Deploy to Cloud Run
echo Deploying container to Google Cloud Run...
call gcloud run deploy "%SERVICE_NAME%" --image="%IMAGE_URI%" --region="%REGION%" --allow-unauthenticated --set-env-vars="NODE_ENV=production" --project="%PROJECT_ID%"

echo ==================================================
echo Deployment finished successfully!
echo Your live backend service URL can be retrieved above.
echo ==================================================
pause
endlocal
