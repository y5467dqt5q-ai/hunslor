# Настройка Telegram бота

## Текущая реализация

Система работает через **polling** обновлений от Telegram API, что означает, что webhook НЕ требуется для работы.

### Как это работает:

1. **Клиент отправляет заказ** → данные отправляются в Telegram админу с кнопками
2. **Клиент начинает polling** → каждую секунду проверяет:
   - Обновления от Telegram через `/api/telegram/poll-updates`
   - Статус заказа через `/api/orders/[orderId]/status`
3. **Админ нажимает кнопку** → Telegram отправляет callback
4. **Polling обнаруживает callback** → обновляет статус заказа
5. **Клиент видит изменение статуса** → показывает соответствующую страницу

### Endpoints:

- `POST /api/telegram/send-order` - отправка заказа в Telegram
- `GET /api/telegram/poll-updates?offset=0` - получение обновлений от Telegram (polling)
- `GET /api/orders/[orderId]/status` - получение статуса заказа
- `POST /api/orders/[orderId]/status` - обновление статуса заказа

### Для продакшена (опционально):

Если хотите использовать webhook вместо polling:

1. Настройте webhook:
   ```
   POST https://api.telegram.org/botYOUR_TELEGRAM_BOT_TOKEN/setWebhook
   Body: {"url": "https://yourdomain.com/api/telegram/webhook"}
   ```

2. Webhook endpoint уже готов: `/api/telegram/webhook`

### Отладка:

Все действия логируются в консоль:
- `[Payment Page]` - логи с клиента
- `[Polling]` - логи polling обновлений
- `[Webhook]` - логи webhook (если используется)
- `[Status API]` - логи API статуса
- `[OrderStatus]` - логи хранилища статусов

### Проверка работы:

1. Откройте консоль браузера (F12)
2. Оформите заказ
3. Смотрите логи - должны быть сообщения о polling и проверке статуса
4. Нажмите кнопку в Telegram
5. В логах должно появиться сообщение о обработке callback
6. Страница клиента должна обновиться
