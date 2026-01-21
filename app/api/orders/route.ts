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

interface OrderItem {
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  variantData?: Record<string, unknown>;
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { items, shippingAddress, paymentMethod } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Keine Artikel im Warenkorb' },
        { status: 400 }
      );
    }

    // Calculate total
    let total = 0;
    for (const item of items) {
      total += item.price * item.quantity;
    }

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'pending',
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod: paymentMethod || 'card',
        items: {
          create: items.map((item: OrderItem) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
            variantData: JSON.stringify(item.variantData || {}),
          })),
        },
      },
      include: {
        items: true,
      },
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json(
      { error: 'Fehler beim Erstellen der Bestellung' },
      { status: 500 }
    );
  }
}
