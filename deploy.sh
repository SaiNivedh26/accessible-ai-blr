#!/bin/bash

echo "Preparing Sign Language Extension Landing Page for deployment..."

# Check if git is initialized
if [ ! -d .git ]; then
  echo "Initializing git repository..."
  git init
  git add .
  git commit -m "Initial commit"
fi

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
  echo "Installing Vercel CLI..."
  npm install -g vercel
fi

echo "Building the application..."
npm run build

echo "Deploying to Vercel..."
vercel deploy --prod

echo "Deployment complete! Your sign language extension landing page is now live."
