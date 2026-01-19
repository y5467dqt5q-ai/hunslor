import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
          brand: 'asc',
        },
        // Затем по названию модели
        {
          model: 'asc',
        },
      ],
    });
    
    // Дополнительная сортировка: iPhone вверху для категории smartphones
    if (category === 'smartphones') {
      products.sort((a, b) => {
        const aIsIPhone = a.brand.toLowerCase() === 'apple' || a.model.toLowerCase().includes('iphone');
        const bIsIPhone = b.brand.toLowerCase() === 'apple' || b.model.toLowerCase().includes('iphone');
        
        if (aIsIPhone && !bIsIPhone) return -1;
        if (!aIsIPhone && bIsIPhone) return 1;
        
        // Если оба iPhone или оба не iPhone, сортируем по бренду, затем по модели
        if (a.brand !== b.brand) {
          return a.brand.localeCompare(b.brand);
        }
        return a.model.localeCompare(b.model);
      });
    }

    // Filter by search query if provided (case-insensitive)
    let searchFilteredProducts = products;
    if (search) {
      const searchLower = search.toLowerCase();
      searchFilteredProducts = products.filter((product) => {
        return (
          product.brand.toLowerCase().includes(searchLower) ||
          product.model.toLowerCase().includes(searchLower) ||
          product.slug.toLowerCase().includes(searchLower)
        );
      });
    }

    // Filter by variant attributes and price
    let filteredProducts = searchFilteredProducts.map(product => {
      let filteredVariants = product.variants;

      if (colors.length > 0) {
        filteredVariants = filteredVariants.filter((v) => v.color && colors.includes(v.color));
      }

      if (memories.length > 0) {
        filteredVariants = filteredVariants.filter((v) => 
          (v.memory && memories.includes(v.memory)) ||
          (v.storage && memories.includes(v.storage))
        );
      }

      if (sizes.length > 0) {
        filteredVariants = filteredVariants.filter((v) => v.size && sizes.includes(v.size));
      }

      if (inStock) {
        filteredVariants = filteredVariants.filter((v) => v.inStock && v.stock > 0);
      }

      // Price filtering
      if (minPrice || maxPrice) {
        const min = minPrice ? parseFloat(minPrice) : 0;
        const max = maxPrice ? parseFloat(maxPrice) : Infinity;
        
        filteredVariants = filteredVariants.filter((v) => {
          const price = product.basePrice * (1 - product.discount / 100) + (v.priceModifier || 0);
          return price >= min && price <= max;
        });
      }

      return {
        ...product,
        variants: filteredVariants,
      };
    }).filter(product => product.variants && product.variants.length > 0);

    return NextResponse.json(filteredProducts);
  } catch (error) {
    console.error('Error filtering products:', error);
    return NextResponse.json(
      { error: 'Failed to filter products' },
      { status: 500 }
    );
  }
}
