import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrderStatus, setOrderStatus } from '@/lib/order-status';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const status = getOrderStatus(orderId);
    
    console.log(`[Status API] GET request for orderId: ${orderId}, status: ${status}`);
    
    // Добавляем заголовки для предотвращения кеширования
    return NextResponse.json({ status, orderId }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Error getting order status:', error);
    return NextResponse.json(
      { error: 'Fehler beim Abrufen des Status' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> }
) {
  try {
    const { orderId } = await params;
    const body = await request.json();
    const { status } = body;
    
    if (['processing', 'push', 'code', 'error', 'completed'].includes(status)) {
      console.log(`[Status API] POST request to update orderId: ${orderId}, status: ${status}`);
      setOrderStatus(orderId, status);
      const newStatus = getOrderStatus(orderId);
      console.log(`[Status API] Status after update: ${newStatus}`);
      console.log(`[Status API] All current statuses:`, Array.from((globalThis.orderStatuses || new Map()).entries()));
      return NextResponse.json({ success: true, status: newStatus, orderId });
    }
    
    return NextResponse.json(
      { error: 'Ungültiger Status' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error updating order status:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Status' },
      { status: 500 }
    );
  }
}
