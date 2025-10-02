#!/bin/bash
cd /Users/brunocuri/whop-app
rm -rf .git
git init
git add .
git commit -m "Update title to 'Turn 5 clips into hundreds' and subtext to 'upload your videos to get started' - v7.0"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
echo "Title update deployment complete!"
