import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

async function getUserIdFromToken(request: NextRequest): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }
    const { items, shippingAddress, paymentMethod } = await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Warenkorb ist leer' }, { status: 400 });
    }
    const subtotal = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
    const shipping = subtotal >= 50 ? 0 : 5;
    const total = subtotal + shipping;
    
    // Create order first
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod: paymentMethod || 'card',
        status: 'pending',
      },
    });
    
    // Create order items separately
    await prisma.orderItem.createMany({
      data: items.map((item: {
        productId: string;
        variantId?: string | null;
        variantData?: any;
        quantity: number;
        price: number;
      }) => {
        const orderItem: {
          orderId: string;
          productId: string;
          variantId?: string;
          variantData?: string;
          quantity: number;
          price: number;
        } = {
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        };
        if (item.variantId) {
          orderItem.variantId = item.variantId;
        }
        if (item.variantData) {
          orderItem.variantData = JSON.stringify(item.variantData);
        }
        return orderItem;
      }),
    });
    
    // Fetch order with items and products
    const orderWithItems = await prisma.order.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });
    
    return NextResponse.json({ order: orderWithItems });
  } catch (error) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'Fehler beim Erstellen der Bestellung' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Nicht autorisiert' }, { status: 401 });
    }
    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json({ error: 'Fehler beim Abrufen der Bestellungen' }, { status: 500 });
  }
}