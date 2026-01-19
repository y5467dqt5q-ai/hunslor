
# Script to deploy to Railway
# Run this in PowerShell

Write-Host "🚀 Starting Railway Deployment..." -ForegroundColor Green

# 1. Check if Railway CLI is installed
if (-not (Get-Command "railway" -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing Railway CLI..." -ForegroundColor Yellow
    npm install -g @railway/cli
}

# 2. Login
Write-Host "🔑 Please login to Railway in the browser window that opens..." -ForegroundColor Cyan
railway login

# 3. Initialize Project
Write-Host "mw Creating/Linking Railway Project..." -ForegroundColor Cyan
# This will prompt to create a new project or link existing
railway init

# 4. Add PostgreSQL Database
Write-Host "🗄️ Adding PostgreSQL Database..." -ForegroundColor Cyan
railway add postgresql

# 5. Set Environment Variables
Write-Host "⚙️ Setting Environment Variables..." -ForegroundColor Cyan
# Replace with actual values or prompt user
$TelegramToken = Read-Host "Enter Telegram Bot Token"
$TelegramAdmin = Read-Host "Enter Telegram Admin ID"
$OpenAIKey = Read-Host "Enter OpenAI API Key"

railway variables set TELEGRAM_BOT_TOKEN=$TelegramToken
railway variables set TELEGRAM_ADMIN_ID=$TelegramAdmin
railway variables set OPENAI_API_KEY=$OpenAIKey
railway variables set NODE_ENV="production"
railway variables set NIXPACKS_PLAN="nodejs_20"

# 6. Deploy
Write-Host "🚀 Deploying..." -ForegroundColor Green
railway up --detach

Write-Host "✅ Deployment initiated! Check the URL provided above." -ForegroundColor Green
