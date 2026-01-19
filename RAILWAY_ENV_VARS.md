# Railway Environment Variables

## Обязательные переменные окружения для Railway:

### Database
- `DATABASE_URL` - PostgreSQL connection string (автоматически создается Railway)

### Authentication
- `JWT_SECRET` - Секретный ключ для JWT токенов (любая случайная строка, минимум 32 символа)

### Telegram Bot
- `TELEGRAM_BOT_TOKEN` - Токен Telegram бота (от @BotFather)
- `TELEGRAM_ADMIN_ID` - ID администратора в Telegram (число, например: 8372817782)

### OpenAI
- `OPENAI_API_KEY` - API ключ OpenAI для AI чата (начинается с `sk-proj-...`)

### Images (ВАЖНО для Railway)
- `IMAGES_PATH` - Путь к папке с изображениями на сервере Railway (например: `/app/images/pictr`)
  - **ВАЖНО:** На Railway нужно загрузить все изображения в правильную структуру папок
  - Если не указан, код будет использовать локальные пути Windows (не будет работать на Railway)
  - Рекомендуется создать volume или использовать внешнее хранилище для изображений
- `CATEGORY_ICONS_PATH` - Путь к папке с иконками категорий на сервере Railway (например: `/app/images/category-icons`)
  - **ВАЖНО:** Аналогично `IMAGES_PATH`, нужно загрузить иконки на сервер

## Как добавить в Railway:

1. Откройте проект в Railway Dashboard
2. Перейдите в раздел "Variables"
3. Добавьте каждую переменную:
   - Name: название переменной (например, `JWT_SECRET`)
   - Value: значение переменной
4. Нажмите "Add" для каждой переменной
5. Railway автоматически перезапустит сервис после добавления переменных

## Важно:

- `DATABASE_URL` создается автоматически при создании PostgreSQL сервиса
- Все остальные переменные нужно добавить вручную
- После добавления переменных Railway автоматически пересоберет проект
