import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import CatalogClient from '@/components/CatalogClient';
import ProductFilters from '@/components/ProductFilters';

interface FilterCategory {
  id: string;
  name: string;
  slug: string;
  order: number;
}

async function getFilterOptions(): Promise<{
  categories: FilterCategory[];
  brands: string[];
  colors: string[];
  memories: string[];
  sizes: string[];
  minPrice: number;
  maxPrice: number;
}> {
  const [allCategories, products] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, order: true },
      orderBy: { order: 'asc' },
    }),
    prisma.product.findMany({
      include: { variants: true, category: true },
    }),
  ]);

  const categoriesWithProducts = new Set(products.map((p) => p.categoryId));
  const categories = allCategories
    .filter((cat) => categoriesWithProducts.has(cat.id))
    .sort((a, b) => {
      if (a.order !== null && b.order !== null) {
        return a.order - b.order;
      }
      if (a.order !== null) return -1;
      if (b.order !== null) return 1;
      return a.name.localeCompare(b.name);
    });

  const brands: string[] = [...new Set(products.map((p) => p.brand).filter((b): b is string => Boolean(b)))].sort();
  
  const colorsRaw: string[] = [];
  const memoriesRaw: string[] = [];
  const sizesRaw: string[] = [];

  products.forEach((p) => {
    p.variants.forEach((v) => {
      if (v.color && typeof v.color === 'string') colorsRaw.push(v.color);
      if (v.memory && typeof v.memory === 'string') memoriesRaw.push(v.memory);
      if (v.storage && typeof v.storage === 'string') memoriesRaw.push(v.storage);
      if (v.size && typeof v.size === 'string') sizesRaw.push(v.size);
    });
  });

  const colors: string[] = [...new Set(colorsRaw)].sort();
  const memories: string[] = [...new Set(memoriesRaw)].sort();
  const sizes: string[] = [...new Set(sizesRaw)].sort();

  const allPrices = products.flatMap((p) => 
    p.variants.map((v) => {
      const price = p.basePrice * (1 - (p.discount || 0) / 100) + (v.priceModifier || 0);
      return price;
    })
  );
  const minPrice = Math.floor(Math.min(...allPrices, 0));
  const maxPrice = Math.ceil(Math.max(...allPrices, 10000));

  return {
    categories,
    brands,
    colors,
    memories,
    sizes,
    minPrice,
    maxPrice,
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const filterOptions = await getFilterOptions();
  const searchQuery = searchParams.search as string | undefined;

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Katalog</h1>
          {searchQuery && (
            <div className="text-text-muted">
              Suchergebnisse fГјr: <span className="text-neon-green font-medium">{searchQuery}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="lg:col-span-1">
            <Suspense fallback={<div className="text-text-muted">Lade Filter...</div>}>
              <ProductFilters options={filterOptions} />
            </Suspense>
          </aside>

          <div className="lg:col-span-3">
            <Suspense fallback={<div className="text-text-muted">Lade Produkte...</div>}>
              <CatalogClient />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}