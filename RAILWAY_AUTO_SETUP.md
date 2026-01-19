# 🚀 Автоматическая настройка Railway

## Вариант 1: Через Railway Dashboard (РЕКОМЕНДУЕТСЯ)

### Шаг 1: Откройте проект
https://railway.app/project/a6111262-b4c7-468f-97e6-099305db819c

### Шаг 2: Добавьте переменные окружения
1. Перейдите в **Settings** → **Variables**
2. Добавьте следующие переменные:

```
JWT_SECRET=hunslor-railway-secret-key-production-2024-min-32-chars
TELEGRAM_BOT_TOKEN=8395474547:AAHM9sBQalUeNgvTyahr-6pdlaCaPW_0054
TELEGRAM_ADMIN_ID=8372817782
OPENAI_API_KEY=sk-proj-****************
NODE_ENV=production
```

### Шаг 3: Добавьте PostgreSQL
1. Нажмите **"+ New"**
2. Выберите **"Database"**
3. Выберите **"Add PostgreSQL"**
4. `DATABASE_URL` добавится автоматически

### Шаг 4: Подключите GitHub (если еще не подключен)
1. Нажмите **"+ New"**
2. Выберите **"GitHub Repo"**
3. Выберите репозиторий: `y5467dqt5q-ai/hunslor`
4. Выберите ветку: `main`

## Вариант 2: Через Railway CLI

Если у вас установлен Railway CLI:

```powershell
# 1. Авторизация
railway login

# 2. Подключение к проекту
railway link a6111262-b4c7-468f-97e6-099305db819c

# 3. Установка переменных
railway variables set JWT_SECRET="hunslor-railway-secret-key-production-2024-min-32-chars"
railway variables set TELEGRAM_BOT_TOKEN="8395474547:AAHM9sBQalUeNgvTyahr-6pdlaCaPW_0054"
railway variables set TELEGRAM_ADMIN_ID="8372817782"
railway variables set OPENAI_API_KEY="sk-proj-****************"
railway variables set NODE_ENV="production"

# 4. Добавление PostgreSQL
railway add postgresql
```

## Вариант 3: Через API (если есть Node.js)

```bash
node setup-railway-api.js
```

## ✅ После настройки

Railway автоматически:
- ✅ Соберет приложение
- ✅ Применит миграции БД (`prisma db push`)
- ✅ Запустит сервер

Проверьте статус деплоя в Dashboard!
