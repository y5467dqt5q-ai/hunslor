import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function getUserId(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

// Обновление статуса заказа в базе данных
export async function POST(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const { orderId } = params;
    const body = await request.json();
    const { status } = body;

    // Валидные статусы для обновления
    const validStatuses = ['completed', 'processing', 'shipped', 'delivered', 'cancelled', 'error'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Ungültiger Status' },
        { status: 400 }
      );
    }

    // Обновляем заказ только если он принадлежит пользователю
    const order = await prisma.order.updateMany({
      where: {
        id: orderId,
        userId: userId,
      },
      data: {
        status: status,
      },
    });

    if (order.count === 0) {
      return NextResponse.json(
        { error: 'Bestellung nicht gefunden' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Status' },
      { status: 500 }
    );
  }
}
