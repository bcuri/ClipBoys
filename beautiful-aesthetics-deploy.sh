#!/bin/bash
cd /Users/brunocuri/whop-app

# Remove any existing git repository
rm -rf .git

# Initialize fresh git repository
git init
git add .
git commit -m "BEAUTIFUL AESTHETICS v5.0: Animations, gradients, hover effects + development guide"

# Set up remote and force push
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force

echo "Beautiful aesthetics deployment complete!"
