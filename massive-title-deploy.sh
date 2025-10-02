#!/bin/bash
cd /Users/brunocuri/whop-app

# Remove any existing git repository
rm -rf .git

# Initialize fresh git repository
git init
git add .
git commit -m "MASSIVE TITLE v3.0: 8xl font-black + accessibility fixes + cache bust"

# Set up remote and force push
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force

echo "MASSIVE TITLE deployment complete!"
