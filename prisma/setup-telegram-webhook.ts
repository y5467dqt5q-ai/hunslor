/**
 * Скрипт для настройки Telegram webhook
 * Запустите этот скрипт один раз для настройки webhook
 * 
 * Замените YOUR_DOMAIN на ваш домен (например: https://yourdomain.com)
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_TELEGRAM_BOT_TOKEN';
const WEBHOOK_URL = 'YOUR_DOMAIN/api/telegram/webhook'; // Замените YOUR_DOMAIN на ваш домен

async function setupWebhook() {
  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['callback_query', 'message'],
      }),
    });

    const data = await response.json();
    
    if (data.ok) {
      console.log('✅ Webhook успешно настроен!');
      console.log('Webhook URL:', WEBHOOK_URL);
    } else {
      console.error('❌ Ошибка настройки webhook:', data);
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

// Для локальной разработки можно использовать ngrok или подобный сервис
// ngrok http 3000
// Затем использовать полученный URL: https://xxxx.ngrok.io/api/telegram/webhook

setupWebhook();
