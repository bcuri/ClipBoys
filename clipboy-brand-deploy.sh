#!/bin/bash
cd /Users/brunocuri/whop-app
rm -rf .git
git init
git add .
git commit -m "Implement ClipBoy branding: neon green colors, Bungee/Inter fonts, brand voice - v9.0"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
echo "ClipBoy brand implementation deployment complete!"
