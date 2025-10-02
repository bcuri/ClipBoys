#!/bin/bash
cd /Users/brunocuri/whop-app

# Remove any existing git repository
rm -rf .git

# Initialize fresh git repository
git init
git add .
git commit -m "DEBUG: Red title with emojis and inline styles - v4.0"

# Set up remote and force push
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force

echo "DEBUG title deployment complete!"
