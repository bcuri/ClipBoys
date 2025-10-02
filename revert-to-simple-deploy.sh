#!/bin/bash
cd /Users/brunocuri/whop-app
rm -rf .git
git init
git add .
git commit -m "Revert: Back to simple YouTube URL input v2.6"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
echo "Revert deployment complete!"
