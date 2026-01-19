#!/bin/bash
# Скрипт для автоматической настройки Railway
# Для Linux/Mac или Git Bash на Windows

echo "🚀 Начинаем настройку Railway..."

# Проверка Railway CLI
echo ""
echo "📋 Проверка Railway CLI..."
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI не установлен. Устанавливаем..."
    npm install -g @railway/cli
    echo "✅ Railway CLI установлен. Пожалуйста, выполните: railway login"
    exit 1
fi
echo "✅ Railway CLI установлен: $(railway --version)"

# Проверка Git
echo ""
echo "📋 Проверка Git репозитория..."
if [ ! -d .git ]; then
    echo "❌ Git не инициализирован. Инициализируем..."
    git init
    git add .
    git commit -m "Initial commit - Railway ready"
    echo "✅ Git инициализирован"
else
    echo "✅ Git репозиторий найден"
fi

# Проверка изменений
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "📋 Обнаружены незакоммиченные изменения. Коммитим..."
    git add .
    git commit -m "Update for Railway deployment"
    echo "✅ Изменения закоммичены"
fi

# Проверка удаленного репозитория
echo ""
echo "📋 Проверка удаленного репозитория..."
if ! git remote get-url origin &> /dev/null; then
    echo "⚠️  Удаленный репозиторий не настроен."
    echo "Пожалуйста, добавьте удаленный репозиторий:"
    echo "git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git"
    echo "git push -u origin main"
    exit 1
fi
echo "✅ Удаленный репозиторий: $(git remote get-url origin)"

# Push в GitHub
echo ""
echo "📤 Отправка кода в GitHub..."
git push origin main
if [ $? -ne 0 ]; then
    echo "❌ Ошибка при отправке в GitHub"
    exit 1
fi
echo "✅ Код отправлен в GitHub"

# Railway команды
echo ""
echo "🚂 Настройка Railway..."
echo ""
echo "Выполните следующие команды:"
echo "1. railway login"
echo "2. railway init"
echo "3. railway add"
echo "4. railway up"
echo ""
echo "✅ Готово!"
