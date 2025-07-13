# PowerShell script to push changes to GitHub
Write-Host "🚀 Pushing Cloud Architecture Designer updates to GitHub..." -ForegroundColor Green

# Check git status
Write-Host "📊 Checking git status..." -ForegroundColor Yellow
git status

# Add all changes
Write-Host "📁 Adding all changes..." -ForegroundColor Yellow
git add .

# Commit with descriptive message
Write-Host "💾 Committing changes..." -ForegroundColor Yellow
git commit -m "✨ Major UI/UX improvements and bug fixes

🔧 Fixed Issues:
- Dropdown menus now work properly with smart positioning
- Folder functionality in palette now collapses/expands correctly
- Export menu positioning prevents screen overflow
- Component dragging and selection improved
- All initialization functions properly called

🎨 UI Enhancements:
- Smart dropdown positioning (above/below, left/right alignment)
- Enhanced folder animations and interactions
- Improved event handling and conflict resolution
- Better debugging and error handling
- Responsive dropdown positioning on window resize

🐛 Bug Fixes:
- Fixed conflicting event listeners in dropdown initialization
- Resolved folder toggle conflicts between functions
- Fixed missing initialization in DOMContentLoaded
- Improved z-index management for dropdowns
- Enhanced error handling for missing elements

📱 Features:
- Automatic dropdown repositioning on window resize
- Comprehensive debugging functions (testDropdowns, testFolders)
- Enhanced console logging for troubleshooting
- Improved accessibility and user experience"

# Push to GitHub
Write-Host "🚀 Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host "✅ Successfully pushed to GitHub!" -ForegroundColor Green
Write-Host "🌐 View your repository at: https://github.com/0x1b2b/cloud-website.git" -ForegroundColor Cyan 