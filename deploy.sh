#!/bin/bash
cd /Users/brunocuri/whop-app
git init
git add .
git commit -m "Update title to 'GENERATE HUNDREDS OF VIDEOS IN ONE CLICK'"
git branch -M main
git remote add origin https://github.com/bcuri/ClipBoys.git
git push -u origin main --force
