#!/bin/bash
# ==================================================
# LifeLink - Deploying Backend to Google Cloud Run
# ==================================================

# Exit immediately if a command exits with a non-zero status
set -e

# Configuration variables (Adjust these before running)
PROJECT_ID="your-gcp-project-id"
REGION="us-central1"
SERVICE_NAME="lifelink-backend"
REPO_NAME="lifelink-repo"

echo "=================================================="
echo "Checking configurations..."
echo "Target GCP Project ID: $PROJECT_ID"
echo "Target Location:      $REGION"
echo "Target Service Name:   $SERVICE_NAME"
echo "=================================================="

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null
then
    echo "ERROR: 'gcloud' CLI is not installed or not in PATH."
    echo "Please install the Google Cloud SDK first: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 1. Enable Google Cloud APIs
echo "Enabling Google Cloud APIs (Cloud Run, Cloud Build, Artifact Registry)..."
gcloud services enable artifactregistry.googleapis.com run.googleapis.com --project="$PROJECT_ID"

# 2. Create Artifact Registry repository if it doesn't exist
echo "Checking Docker Artifact Registry repository..."
gcloud artifacts repositories describe "$REPO_NAME" --location="$REGION" --project="$PROJECT_ID" &> /dev/null || \
gcloud artifacts repositories create "$REPO_NAME" \
    --repository-format=docker \
    --location="$REGION" \
    --description="Docker repository for LifeLink backend" \
    --project="$PROJECT_ID"

# 3. Build & push image using Google Cloud Build (No local Docker daemon required)
echo "Building and pushing container image via Google Cloud Build..."
IMAGE_URI="$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/backend:latest"
gcloud builds submit --tag "$IMAGE_URI" --project="$PROJECT_ID"

# 4. Deploy container to Cloud Run
echo "Deploying container to Google Cloud Run..."
gcloud run deploy "$SERVICE_NAME" \
    --image="$IMAGE_URI" \
    --region="$REGION" \
    --allow-unauthenticated \
    --set-env-vars="NODE_ENV=production" \
    --project="$PROJECT_ID"

echo "=================================================="
echo "Deployment finished successfully!"
echo "Your live backend service URL can be retrieved above."
echo "=================================================="
