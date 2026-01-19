# 🚀 БЫСТРАЯ НАСТРОЙКА RAILWAY

## ✅ Все исправлено и готово!

### Автоматическая настройка через API:

1. **Получите Railway API токен:**
   - Зайдите на https://railway.app/account/tokens
   - Создайте новый токен
   - Скопируйте его

2. **Отредактируйте `setup-railway-api.ps1`:**
   - Откройте файл
   - Замените `YOUR_TELEGRAM_BOT_TOKEN_HERE` на: `8395474547:AAHM9sBQalUeNgvTyahr-6pdlaCaPW_0054`
   - Замените `YOUR_TELEGRAM_ADMIN_ID_HERE` на: `8372817782`
   - Замените `YOUR_OPENAI_API_KEY_HERE` на ваш OpenAI ключ

3. **Запустите скрипт:**
   ```powershell
   $env:RAILWAY_API_TOKEN = "ваш-токен-из-railway"
   cd C:\hunslor
   .\setup-railway-api.ps1
   ```

### Или настройте вручную через Dashboard:

1. Откройте: https://railway.app/project/a6111262-b4c7-468f-97e6-099305db819c

2. **Добавьте переменные** (Settings → Variables):
   - `JWT_SECRET` = `hunslor-railway-secret-key-production-2024-min-32-chars`
   - `TELEGRAM_BOT_TOKEN` = `8395474547:AAHM9sBQalUeNgvTyahr-6pdlaCaPW_0054`
   - `TELEGRAM_ADMIN_ID` = `8372817782`
   - `OPENAI_API_KEY` = ваш ключ
   - `NODE_ENV` = `production`

3. **Добавьте PostgreSQL:**
   - "+ New" → "Database" → "Add PostgreSQL"

4. **Подключите GitHub** (если еще не подключен):
   - "+ New" → "GitHub Repo" → `y5467dqt5q-ai/hunslor`

## ✅ Готово!

Railway автоматически задеплоит приложение.
