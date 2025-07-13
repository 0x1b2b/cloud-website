Write-Host "Setting up Git repository and pushing to GitHub..." -ForegroundColor Green

# Initialize Git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Azure Cloud Architecture Designer Tool"

# Add the remote repository
git remote add origin https://github.com/0x1b2b/cloud-website.git

# Push to main branch
git branch -M main
git push -u origin main

Write-Host "Done! Your code has been pushed to GitHub." -ForegroundColor Green
Read-Host "Press Enter to continue" 