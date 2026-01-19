# Скрипт для автоматического деплоя на Railway
# Запустите этот скрипт после авторизации в Railway CLI

Write-Host "🚀 Начинаем деплой на Railway..." -ForegroundColor Green

# Проверка Railway CLI
Write-Host "`n📋 Проверка Railway CLI..." -ForegroundColor Yellow
$railwayVersion = railway --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Railway CLI не установлен. Устанавливаем..." -ForegroundColor Red
    npm install -g @railway/cli
    Write-Host "✅ Railway CLI установлен. Пожалуйста, выполните: railway login" -ForegroundColor Green
    exit 1
}
Write-Host "✅ Railway CLI установлен: $railwayVersion" -ForegroundColor Green

# Проверка Git
Write-Host "`n📋 Проверка Git репозитория..." -ForegroundColor Yellow
$gitStatus = git status 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git не инициализирован. Инициализируем..." -ForegroundColor Red
    git init
    git add .
    git commit -m "Initial commit - Railway ready"
    Write-Host "✅ Git инициализирован" -ForegroundColor Green
} else {
    Write-Host "✅ Git репозиторий найден" -ForegroundColor Green
}

# Проверка изменений
$changes = git status --porcelain
if ($changes) {
    Write-Host "`n📋 Обнаружены незакоммиченные изменения. Коммитим..." -ForegroundColor Yellow
    git add .
    git commit -m "Update for Railway deployment"
    Write-Host "✅ Изменения закоммичены" -ForegroundColor Green
}

# Проверка удаленного репозитория
$remote = git remote get-url origin 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "`n⚠️  Удаленный репозиторий не настроен." -ForegroundColor Yellow
    Write-Host "Пожалуйста, добавьте удаленный репозиторий:" -ForegroundColor Yellow
    Write-Host "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git" -ForegroundColor Cyan
    Write-Host "git push -u origin main" -ForegroundColor Cyan
    exit 1
}
Write-Host "✅ Удаленный репозиторий: $remote" -ForegroundColor Green

# Push в GitHub
Write-Host "`n📤 Отправка кода в GitHub..." -ForegroundColor Yellow
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Ошибка при отправке в GitHub" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Код отправлен в GitHub" -ForegroundColor Green

# Railway команды
Write-Host "`n🚂 Настройка Railway..." -ForegroundColor Yellow
Write-Host "`nВыполните следующие команды вручную:" -ForegroundColor Cyan
Write-Host "1. railway login" -ForegroundColor White
Write-Host "2. railway init" -ForegroundColor White
Write-Host "3. railway add" -ForegroundColor White
Write-Host "4. railway up" -ForegroundColor White

Write-Host "`n✅ Готово! Следуйте инструкциям выше." -ForegroundColor Green
