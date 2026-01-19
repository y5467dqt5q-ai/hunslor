# Автоматическая настройка Railway через API
# Требуется RAILWAY_API_TOKEN
# Получите токен: https://railway.app/account/tokens

$PROJECT_ID = "a6111262-b4c7-468f-97e6-099305db819c"
$RAILWAY_API_TOKEN = $env:RAILWAY_API_TOKEN

if (-not $RAILWAY_API_TOKEN) {
    Write-Host "❌ RAILWAY_API_TOKEN не установлен!" -ForegroundColor Red
    Write-Host "Получите токен: https://railway.app/account/tokens" -ForegroundColor Yellow
    Write-Host "Затем установите: `$env:RAILWAY_API_TOKEN = 'ваш-токен'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $RAILWAY_API_TOKEN"
    "Content-Type" = "application/json"
}

Write-Host "🚀 Настройка Railway проекта..." -ForegroundColor Green

# Переменные окружения
$variables = @{
    "JWT_SECRET" = "hunslor-railway-secret-key-production-2024-$(Get-Random -Minimum 100000 -Maximum 999999)-min-32-chars"
    "TELEGRAM_BOT_TOKEN" = "YOUR_TELEGRAM_BOT_TOKEN_HERE"
    "TELEGRAM_ADMIN_ID" = "YOUR_TELEGRAM_ADMIN_ID_HERE"
    "OPENAI_API_KEY" = "YOUR_OPENAI_API_KEY_HERE"
    "NODE_ENV" = "production"
}

Write-Host "`n📋 Добавление переменных окружения..." -ForegroundColor Yellow

foreach ($key in $variables.Keys) {
    $value = $variables[$key]
    $body = @{
        name = $key
        value = $value
    } | ConvertTo-Json
    
    try {
        $response = Invoke-RestMethod -Uri "https://api.railway.app/v1/projects/$PROJECT_ID/variables" `
            -Method POST `
            -Headers $headers `
            -Body $body
        
        Write-Host "✅ $key установлен" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  Ошибка установки $key : $_" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Настройка завершена!" -ForegroundColor Green
Write-Host "`nПроверьте Railway Dashboard: https://railway.app/project/$PROJECT_ID" -ForegroundColor Cyan
