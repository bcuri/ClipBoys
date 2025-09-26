#!/bin/bash
cd /Users/brunocuri/whop-app
rm -rf .git
git init
git add .
git commit -m "Fix gradient title with inline styles to bypass Whop CSS conflicts - v8.1"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
echo "Inline gradient deployment complete!"
