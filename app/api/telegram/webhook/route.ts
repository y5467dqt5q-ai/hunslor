import { NextRequest, NextResponse } from 'next/server';
import { setOrderStatus } from '@/lib/order-status';

export const dynamic = 'force-dynamic';

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_ADMIN_ID = process.env.TELEGRAM_ADMIN_ID || '';

interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

interface CallbackQuery {
  id: string;
  from: TelegramUser;
  message?: unknown;
  data: string;
}

interface TelegramUpdate {
  update_id: number;
  callback_query?: CallbackQuery;
  message?: unknown;
}

// Webhook endpoint для получения обновлений от Telegram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as TelegramUpdate;
    
    console.log('Telegram webhook received:', JSON.stringify(body, null, 2));
    
    // Обрабатываем callback_query от inline кнопок
    if (body.callback_query) {
      const callbackQuery = body.callback_query;
      const { data, from } = callbackQuery;
      
      // Проверяем, что запрос от админа
      if (from.id.toString() !== TELEGRAM_ADMIN_ID) {
        console.log('Callback from non-admin user:', from.id);
        return NextResponse.json({ ok: true });
      }
      
      // Парсим callback_data: push_order123456, code_order123456, error_order123456
      // Формат: action_orderId (где orderId начинается с "order")
      const underscoreIndex = data.indexOf('_');
      if (underscoreIndex === -1) {
        console.error('Invalid callback data format:', data);
        return NextResponse.json({ ok: false, error: 'Invalid format' }, { status: 400 });
      }
      
      const action = data.substring(0, underscoreIndex); // push, code, или error
      const orderId = data.substring(underscoreIndex + 1); // order123456...
      
      console.log('Processing callback:', { action, orderId, data });
      
      if (!orderId || !action) {
        console.error('Invalid callback data:', { action, orderId, data });
        return NextResponse.json({ ok: false, error: 'Invalid callback data' }, { status: 400 });
      }
      
      // Обновляем статус заказа
      const statusMap: Record<string, 'push' | 'code' | 'error'> = {
        'push': 'push',
        'code': 'code',
        'error': 'error'
      };
      
      const status = statusMap[action];
      if (status && orderId) {
        console.log(`[Webhook] Setting status: ${orderId} -> ${status}`);
        setOrderStatus(orderId, status);
        
        // Проверяем, что статус действительно обновился
        const { getOrderStatus } = await import('@/lib/order-status');
        const verifyStatus = getOrderStatus(orderId);
        console.log(`[Webhook] ✅ Verified status for ${orderId}: ${verifyStatus}`);
        
        if (verifyStatus !== status) {
          console.error(`[Webhook] ❌ Status mismatch! Expected ${status}, got ${verifyStatus}`);
        }
      } else {
        console.error('[Webhook] Invalid action:', { action, orderId, status });
      }
      
      // Отвечаем на callback, чтобы убрать "часики" в Telegram
      const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
      await fetch(telegramUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQuery.id,
          text: action === 'push' ? 'Push отправлен' : action === 'code' ? 'Ожидание кода' : 'Ошибка обработана',
        }),
      });
      
      return NextResponse.json({ ok: true, action, orderId, status });
    }
    
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 500 });
  }
}

// GET для проверки webhook
export async function GET() {
  return NextResponse.json({ message: 'Telegram webhook endpoint', status: 'ok' });
}
