import { NextRequest, NextResponse } from 'next/server';
import { setOrderStatus } from '@/lib/order-status';

/**
 * Тестовый endpoint для проверки работы кнопок
 * Использование: POST /api/telegram/test-callback?action=push&orderId=order_123456
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action'); // push, code, или error
    const orderId = searchParams.get('orderId');

    if (!action || !orderId) {
      return NextResponse.json(
        { error: 'Missing action or orderId' },
        { status: 400 }
      );
    }

    const statusMap: Record<string, 'push' | 'code' | 'error'> = {
      'push': 'push',
      'code': 'code',
      'error': 'error'
    };

    const status = statusMap[action];
    if (!status) {
      return NextResponse.json(
        { error: 'Invalid action. Use: push, code, or error' },
        { status: 400 }
      );
    }

    setOrderStatus(orderId, status);
    console.log(`[TEST] Order status updated: ${orderId} -> ${status}`);

    return NextResponse.json({
      success: true,
      message: `Status updated to ${status}`,
      orderId,
      status
    });
  } catch (error) {
    console.error('Test callback error:', error);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
