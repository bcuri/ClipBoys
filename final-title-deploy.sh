#!/bin/bash
cd /Users/brunocuri/whop-app

# Remove any existing git repository
rm -rf .git

# Initialize fresh git repository
git init
git add .
git commit -m "FINAL TITLE FIX v6.0: Inline styles with fontSize 64px + WebkitTextFillColor"

# Set up remote and force push
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force

echo "Final title fix deployed to GitHub!"
