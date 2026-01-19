import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [categories, products] = await Promise.all([
      prisma.category.findMany({
        where: { parentId: null },
        select: { id: true, name: true, slug: true },
        orderBy: { order: 'asc' },
      }),
      prisma.product.findMany({
        include: { variants: true },
      }),
    ]);

    // Extract unique values
    const brands = [...new Set(products.map(p => p.brand))].sort();
    const colors = [...new Set(products.flatMap(p => p.variants.map(v => v.color).filter(Boolean)))].sort();
    const memories = [...new Set(products.flatMap(p => 
      p.variants.flatMap(v => [v.memory, v.storage].filter(Boolean))
    ))].sort();
    const sizes = [...new Set(products.flatMap(p => p.variants.map(v => v.size).filter(Boolean)))].sort();

    // Calculate price range
    const allPrices = products.flatMap(p => 
      p.variants.map(v => {
        const price = p.basePrice * (1 - p.discount / 100) + (v.priceModifier || 0);
        return price;
      })
    );
    const minPrice = Math.floor(Math.min(...allPrices, 0));
    const maxPrice = Math.ceil(Math.max(...allPrices, 10000));

    return NextResponse.json({
      categories,
      brands,
      colors,
      memories,
      sizes,
      minPrice,
      maxPrice,
    });
  } catch (error) {
    console.error('Error fetching filter options:', error);
    return NextResponse.json(
      { error: 'Failed to fetch filter options' },
      { status: 500 }
    );
  }
}
