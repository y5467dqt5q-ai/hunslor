import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const ids = searchParams.get('ids');

    if (ids) {
      // Get products by IDs
      const productIds = ids.split(',').filter(Boolean);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
        },
        include: {
          variants: true,
        },
      });

      return NextResponse.json(products);
    }

    // Get all products
    const products = await prisma.product.findMany({
      include: {
        variants: true,
        category: true,
      },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
