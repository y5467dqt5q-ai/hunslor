import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import CatalogClient from '@/components/CatalogClient';
import ProductFilters from '@/components/ProductFilters';

async function getFilterOptions() {
  const [allCategories, products] = await Promise.all([
    prisma.category.findMany({
      select: { id: true, name: true, slug: true, order: true },
      orderBy: { order: 'asc' },
    }),
    prisma.product.findMany({
      include: { variants: true, category: true },
    }),
  ]);

  // Получаем только те категории, в которых есть товары
  const categoriesWithProducts = new Set(products.map((p) => p.categoryId));
  const categories = allCategories
    .filter((cat) => categoriesWithProducts.has(cat.id))
    .sort((a, b) => {
      // Сортируем по order, если есть, иначе по названию
      if (a.order !== null && b.order !== null) {
        return a.order - b.order;
      }
      if (a.order !== null) return -1;
      if (b.order !== null) return 1;
      return a.name.localeCompare(b.name);
    });

  const brands = [...new Set(products.map(p => p.brand))].sort();
  const colors = [...new Set(products.flatMap(p => p.variants.map(v => v.color).filter(Boolean)))].sort();
  const memories = [...new Set(products.flatMap(p => 
    p.variants.flatMap(v => [v.memory, v.storage].filter(Boolean))
  ))].sort();
  const sizes = [...new Set(products.flatMap(p => p.variants.map(v => v.size).filter(Boolean)))].sort();

  const allPrices = products.flatMap(p => 
    p.variants.map(v => {
      const price = p.basePrice * (1 - p.discount / 100) + (v.priceModifier || 0);
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
              Suchergebnisse für: <span className="text-neon-green font-medium">{searchQuery}</span>
            </div>
          )}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar with filters */}
          <aside className="lg:col-span-1">
            <Suspense fallback={<div className="text-text-muted">Lade Filter...</div>}>
              <ProductFilters options={filterOptions} />
            </Suspense>
          </aside>

          {/* Products grid */}
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
