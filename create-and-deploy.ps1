# Полностью автоматический деплой на Railway
# Этот скрипт создаст GitHub репозиторий и задеплоит на Railway

$ErrorActionPreference = "Continue"

Write-Host "🚀 Полностью автоматический деплой на Railway" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray

Set-Location "C:\hunslor"

# 1. Проверка Railway CLI и авторизации
Write-Host "`n📋 Шаг 1: Проверка Railway..." -ForegroundColor Yellow
try {
    $railwayUser = railway whoami 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Авторизованы в Railway: $railwayUser" -ForegroundColor Green
    } else {
        Write-Host "❌ Не авторизованы в Railway. Выполняем: railway login" -ForegroundColor Red
        railway login
        if ($LASTEXITCODE -ne 0) {
            Write-Host "❌ Ошибка авторизации" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "❌ Railway CLI не установлен. Устанавливаем..." -ForegroundColor Red
    npm install -g @railway/cli
    railway login
}

# 2. Проверка GitHub CLI
Write-Host "`n📋 Шаг 2: Проверка GitHub..." -ForegroundColor Yellow
$useGitHubCLI = $false
try {
    $ghVersion = gh --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        $authStatus = gh auth status 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ GitHub CLI установлен и авторизован" -ForegroundColor Green
            $useGitHubCLI = $true
        } else {
            Write-Host "⚠️  GitHub CLI установлен, но не авторизован" -ForegroundColor Yellow
            Write-Host "Выполняем: gh auth login" -ForegroundColor Cyan
            gh auth login
            if ($LASTEXITCODE -eq 0) {
                $useGitHubCLI = $true
            }
        }
    }
} catch {
    Write-Host "⚠️  GitHub CLI не установлен. Продолжаем без него..." -ForegroundColor Yellow
}

# 3. Проверка Git репозитория
Write-Host "`n📋 Шаг 3: Проверка Git..." -ForegroundColor Yellow
if (-not (Test-Path ".git")) {
    Write-Host "Инициализируем Git..." -ForegroundColor Yellow
    git init
    git branch -M main
}

# 4. Коммит изменений
Write-Host "`n📋 Шаг 4: Коммит изменений..." -ForegroundColor Yellow
$changes = git status --porcelain
if ($changes) {
    git add .
    git commit -m "Ready for Railway deployment - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    Write-Host "✅ Изменения закоммичены" -ForegroundColor Green
}

# 5. Создание GitHub репозитория
Write-Host "`n📋 Шаг 5: Создание GitHub репозитория..." -ForegroundColor Yellow
$repoName = "hunslor"
$remote = git remote get-url origin 2>&1

if ($LASTEXITCODE -ne 0) {
    if ($useGitHubCLI) {
        Write-Host "Создаем репозиторий через GitHub CLI..." -ForegroundColor Cyan
        gh repo create $repoName --public --source=. --remote=origin --push
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Репозиторий создан и код отправлен" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Ошибка создания репозитория через CLI" -ForegroundColor Yellow
            Write-Host "Пожалуйста, создайте репозиторий вручную на GitHub.com" -ForegroundColor Cyan
            Write-Host "Затем выполните:" -ForegroundColor Cyan
            Write-Host "  git remote add origin https://github.com/YOUR_USERNAME/$repoName.git" -ForegroundColor White
            Write-Host "  git push -u origin main" -ForegroundColor White
            exit 0
        }
    } else {
        Write-Host "⚠️  GitHub CLI не доступен." -ForegroundColor Yellow
        Write-Host "Пожалуйста, создайте репозиторий вручную:" -ForegroundColor Cyan
        Write-Host "1. Зайдите на https://github.com/new" -ForegroundColor White
        Write-Host "2. Название: $repoName" -ForegroundColor White
        Write-Host "3. НЕ добавляйте README, .gitignore, лицензию" -ForegroundColor White
        Write-Host "4. Нажмите 'Create repository'" -ForegroundColor White
        Write-Host "5. Затем выполните:" -ForegroundColor Cyan
        Write-Host "   git remote add origin https://github.com/YOUR_USERNAME/$repoName.git" -ForegroundColor Yellow
        Write-Host "   git push -u origin main" -ForegroundColor Yellow
        Write-Host "`nПосле этого запустите скрипт снова: .\create-and-deploy.ps1" -ForegroundColor Cyan
        exit 0
    }
} else {
    Write-Host "✅ Удаленный репозиторий уже настроен: $remote" -ForegroundColor Green
    Write-Host "Отправляем код..." -ForegroundColor Yellow
    git push -u origin main
}

# 6. Railway настройка
Write-Host "`n🚂 Шаг 6: Настройка Railway..." -ForegroundColor Yellow

# Проверка существующего проекта
$projectCheck = railway status 2>&1
if ($LASTEXITCODE -ne 0 -or $projectCheck -match "No linked project") {
    Write-Host "Инициализируем новый проект Railway..." -ForegroundColor Cyan
    Write-Host "Следуйте инструкциям на экране (выберите Create a new project)" -ForegroundColor Yellow
    railway init
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Инициализация прервана" -ForegroundColor Yellow
        exit 0
    }
} else {
    Write-Host "✅ Проект Railway уже инициализирован" -ForegroundColor Green
}

# Добавление PostgreSQL
Write-Host "`nДобавляем PostgreSQL..." -ForegroundColor Cyan
railway add postgresql
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  PostgreSQL может быть уже добавлен" -ForegroundColor Yellow
}

# Добавление переменных окружения
Write-Host "`nДобавляем переменные окружения..." -ForegroundColor Cyan
$jwtSecret = "hunslor-railway-$(Get-Random -Minimum 100000 -Maximum 999999)-$(Get-Random -Minimum 1000 -Maximum 9999)-secret"

railway variables set JWT_SECRET="$jwtSecret"
railway variables set TELEGRAM_BOT_TOKEN="YOUR_TELEGRAM_BOT_TOKEN_HERE"
railway variables set TELEGRAM_ADMIN_ID="8372817782"
railway variables set OPENAI_API_KEY="YOUR_OPENAI_API_KEY_HERE"
railway variables set NODE_ENV="production"

Write-Host "✅ Переменные окружения добавлены" -ForegroundColor Green

# Деплой
Write-Host "`n🚀 Шаг 7: Запуск деплоя..." -ForegroundColor Yellow
railway up

Write-Host "`n✅ Деплой запущен!" -ForegroundColor Green
Write-Host "`nПроверьте статус:" -ForegroundColor Cyan
Write-Host "  railway logs" -ForegroundColor White
Write-Host "  railway status" -ForegroundColor White
Write-Host "`nПолучите URL:" -ForegroundColor Cyan
Write-Host "  railway domain" -ForegroundColor White
Write-Host "`nИли откройте Railway Dashboard: https://railway.app" -ForegroundColor Cyan
