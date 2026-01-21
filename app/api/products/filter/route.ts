import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const colors = searchParams.get('colors')?.split(',') || [];
    const memories = searchParams.get('memories')?.split(',') || [];
    const sizes = searchParams.get('sizes')?.split(',') || [];
    const inStock = searchParams.get('inStock') === 'true';

    // Build where clause
    interface WhereClause {
      category?: { slug: string };
      brand?: string;
    }
    const where: WhereClause = {};

    // Search query (SQLite doesn't support case-insensitive, filter after fetch)
    // We'll filter in JS after fetching

    if (category) {
      where.category = {
        slug: category,
      };
    }

    if (brand) {
      where.brand = brand;
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        variants: {
          where: {
            inStock: inStock ? true : undefined,
          },
        },
        category: true,
      },
      orderBy: [
        // Сначала iPhone (Apple бренд в категории smartphones)
        {
          category: {
            slug: 'asc',
          },
        },
        {
          brand: 'asc',
        },
        {
          model: 'asc',
        },
      ],
    });

    let filteredProducts = products;

    // Filter by search term (case insensitive)
    if (search) {
      const searchLower = search.toLowerCase();
      filteredProducts = filteredProducts.filter(
        (p) =>
          p.brand.toLowerCase().includes(searchLower) ||
          p.model.toLowerCase().includes(searchLower)
      );
    }

    // Filter by price
    if (minPrice) {
      const min = parseFloat(minPrice);
      filteredProducts = filteredProducts.filter((p) => p.basePrice >= min);
    }

    if (maxPrice) {
      const max = parseFloat(maxPrice);
      filteredProducts = filteredProducts.filter((p) => p.basePrice <= max);
    }

    // Filter by variant attributes (if any variants match, keep the product)
    if (colors.length > 0 || memories.length > 0 || sizes.length > 0) {
      filteredProducts = filteredProducts.filter((p) => {
        return p.variants.some((v) => {
          let matches = true;
          if (colors.length > 0 && v.color) {
            matches = matches && colors.includes(v.color);
          }
          if (memories.length > 0 && v.memory) {
            matches = matches && memories.includes(v.memory);
          }
          if (sizes.length > 0 && v.size) {
            matches = matches && sizes.includes(v.size);
          }
          return matches;
        });
      });
    }

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Error filtering products:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
