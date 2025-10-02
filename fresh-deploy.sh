#!/bin/bash
cd /Users/brunocuri/whop-app

# Remove any existing git repository
rm -rf .git

# Initialize fresh git repository
git init
git add .
git commit -m "Fresh deployment with updated title: GENERATE HUNDREDS OF VIDEOS IN ONE CLICK"

# Set up remote and force push
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force

echo "Deployment complete!"
