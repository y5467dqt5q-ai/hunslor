import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

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

const createOrderSchema = z.object({
  items: z.array(z.object({
    productId: z.string(),
    variantId: z.string(),
    quantity: z.number().int().positive(),
    price: z.number(),
    variantData: z.record(z.string(), z.unknown()),
  })),
  shippingAddress: z.object({
    name: z.string(),
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string().default('Deutschland'),
  }),
  paymentMethod: z.string(),
});

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
    const { items, shippingAddress, paymentMethod } = createOrderSchema.parse(body);

    // Calculate total
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // Create order
    const order = await prisma.order.create({
      data: {
        userId,
        status: 'pending',
        total,
        shippingAddress: JSON.stringify(shippingAddress),
        paymentMethod,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            variantData: JSON.stringify(item.variantData),
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Ung+-ltige Eingabe', details: error.issues },
        { status: 400 }
      );
    }

    console.error('Order creation error:', error);
    return NextResponse.json(
      { error: 'Bestellung fehlgeschlagen' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { error: 'Nicht autorisiert' },
        { status: 401 }
      );
    }

    // ж▀ж-жмT├T╟ж-жжж- T┬ж-жмT╠жжж- T├T┴жмжжT╚ж-ж- ж-T─ж-T└ж-жмжжж-ж-T╦жж жмж-жжж-жмT╦ (ж-жж pending, ж-жж cancelled, ж-жж error)
    // жуT┴жмжжT╚ж-T╦жж T┴T┬ж-T┬T├T┴T╦: completed, shipped, delivered, processing
    const orders = await prisma.order.findMany({
      where: { 
        userId,
        status: {
          notIn: ['pending', 'cancelled', 'error']
        }
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen der Bestellungen' },
      { status: 500 }
    );
  }
}
