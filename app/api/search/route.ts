import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q')?.toLowerCase().trim();

    if (!query || query.length < 2) {
      return NextResponse.json([]);
    }

    // Search products (SQLite doesn't support case-insensitive, so we filter in JS)
    const allProducts = await prisma.product.findMany({
      take: 50, // Get more to filter
      select: {
        id: true,
        brand: true,
        model: true,
        slug: true,
        variants: {
          take: 1,
          select: {
            id: true,
            images: true,
          },
        },
      },
    });

    const products = allProducts
      .filter((product) => {
        const searchLower = query.toLowerCase();
        return (
          product.brand.toLowerCase().includes(searchLower) ||
          product.model.toLowerCase().includes(searchLower) ||
          product.slug.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 5);

    // Search categories
    const allCategories = await prisma.category.findMany({
      take: 30,
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    const categories = allCategories
      .filter((category) => {
        const searchLower = query.toLowerCase();
        return (
          category.name.toLowerCase().includes(searchLower) ||
          category.slug.toLowerCase().includes(searchLower)
        );
      })
      .slice(0, 3);

    // Format results - убираем "Unknown" из названий
    const results = [
      ...products.map((product) => {
        const cleanBrand = product.brand && product.brand.toLowerCase() !== 'unknown' ? product.brand : '';
        const cleanModel = product.model || '';
        const title = cleanBrand ? `${cleanBrand} ${cleanModel}`.trim() : cleanModel;
        
        // Получаем изображение из первого варианта
        let imageUrl: string | null = null;
        if (product.variants && product.variants.length > 0) {
          const variant = product.variants[0];
          try {
            if (variant.images) {
              const parsed = JSON.parse(variant.images as string);
              if (parsed.variantPath) {
                // Формируем прямой URL к главному изображению через /api/images
                // Главное изображение обычно называется 00_main.webp
                const variantPath = parsed.variantPath;
                imageUrl = `/api/images/${encodeURIComponent(variantPath)}/00_main.webp`;
              }
            }
          } catch (e) {
            // Игнорируем ошибки парсинга
          }
        }
        
        // Если не нашли через variantPath, используем API для получения изображения
        if (!imageUrl && product.variants && product.variants.length > 0) {
          imageUrl = `/api/products/images?product=${encodeURIComponent(product.slug)}&variant=${product.variants[0].id}`;
        }
        
        return {
          id: product.id,
          type: 'product' as const,
          title,
          slug: product.slug,
          brand: cleanBrand,
          imageUrl,
        };
      }),
      ...categories.map((category) => ({
        id: category.id,
        type: 'category' as const,
        title: category.name,
        slug: category.slug,
      })),
    ];

    return NextResponse.json(results);
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Search failed' },
      { status: 500 }
    );
  }
}
