@echo off
echo Setting up Git repository and pushing to GitHub...

REM Initialize Git repository
git init

REM Add all files
git add .

REM Create initial commit
git commit -m "Initial commit: Azure Cloud Architecture Designer Tool"

REM Add the remote repository
git remote add origin https://github.com/0x1b2b/cloud-website.git

REM Push to main branch
git branch -M main
git push -u origin main

echo Done! Your code has been pushed to GitHub.
pause 