# 🚀 Автоматическая настройка Railway

## Вариант 1: Через Railway API (автоматически)

1. Получите API токен:
   - Зайдите на https://railway.app/account/tokens
   - Создайте новый токен
   - Скопируйте токен

2. Установите токен в PowerShell:
   ```powershell
   $env:RAILWAY_API_TOKEN = "ваш-токен-здесь"
   ```

3. Запустите скрипт:
   ```powershell
   cd C:\hunslor
   .\setup-railway-api.ps1
   ```

## Вариант 2: Через Railway Dashboard (вручную)

1. Откройте проект: https://railway.app/project/a6111262-b4c7-468f-97e6-099305db819c

2. Добавьте переменные окружения (Settings → Variables):
   ```
   JWT_SECRET=hunslor-railway-secret-key-production-2024-min-32-chars
   TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN_HERE
   TELEGRAM_ADMIN_ID=YOUR_TELEGRAM_ADMIN_ID_HERE
   OPENAI_API_KEY=YOUR_OPENAI_API_KEY_HERE
   NODE_ENV=production
   ```

3. Добавьте PostgreSQL:
   - Нажмите "+ New" → "Database" → "Add PostgreSQL"
   - `DATABASE_URL` добавится автоматически

4. Подключите GitHub (если еще не подключен):
   - "+ New" → "GitHub Repo" → выберите `y5467dqt5q-ai/hunslor`

## Вариант 3: Через Railway CLI

1. Установите Railway CLI:
   ```powershell
   npm install -g @railway/cli
   ```

2. Авторизуйтесь:
   ```powershell
   railway login
   ```

3. Подключите проект:
   ```powershell
   cd C:\hunslor
   railway link a6111262-b4c7-468f-97e6-099305db819c
   ```

4. Установите переменные:
   ```powershell
   railway variables set JWT_SECRET="hunslor-railway-secret-key-production-2024-min-32-chars"
   railway variables set TELEGRAM_BOT_TOKEN="8395474547:AAHM9sBQalUeNgvTyahr-6pdlaCaPW_0054"
   railway variables set TELEGRAM_ADMIN_ID="8372817782"
   railway variables set OPENAI_API_KEY="sk-proj-****************"
   railway variables set NODE_ENV="production"
   ```

5. Добавьте PostgreSQL:
   ```powershell
   railway add postgresql
   ```

6. Запустите деплой:
   ```powershell
   railway up
   ```

## ✅ После настройки

Railway автоматически:
- Соберет приложение
- Применит миграции БД
- Запустит сервер

Проверьте статус: https://railway.app/project/a6111262-b4c7-468f-97e6-099305db819c
