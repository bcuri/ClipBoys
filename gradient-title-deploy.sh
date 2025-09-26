#!/bin/bash
cd /Users/brunocuri/whop-app
rm -rf .git
git init
git add .
git commit -m "Update title to 'GENERATE HUNDREDS OF CLIPS' with gradient colors - v8.0"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
echo "Gradient title deployment complete!"
