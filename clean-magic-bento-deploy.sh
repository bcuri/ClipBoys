#!/bin/bash
cd /Users/brunocuri/whop-app
rm -rf .git
git init
git add .
git commit -m "Clean: Remove How it Works, Magic Bento on entire container v2.9"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
echo "Clean Magic Bento deployment complete!"
