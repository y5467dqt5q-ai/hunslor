import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ProductPageClient from '@/components/ProductPageClient';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: {
    slug: string;
  };
}

export default async function ProductPage({ params }: PageProps) {
  const product = await prisma.product.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      variants: {
        orderBy: [
          { color: 'asc' },
          { memory: 'asc' },
          { size: 'asc' },
        ],
      },
    },
  });

  if (!product) {
    notFound();
  }

  // Определяем, является ли товар iPhone
  const isIPhone = product.category.slug === 'iphone' || product.model.toLowerCase().includes('iphone');
  
  // Преобразуем варианты из БД в новую структуру
  const transformedVariants = product.variants.map((variant) => {
    // Определяем model из product.model и SKU для iPhone
    const productModelLower = product.model.toLowerCase();
    const skuLower = variant.sku.toLowerCase();
    let model: 'Pro' | 'Pro Max' | 'Standard' | 'Air' = 'Standard';
    
    if (isIPhone) {
      // КРИТИЧНО: Сначала проверяем product.model, потом SKU
      const isProMax = 
        productModelLower.includes('pro max') ||
        skuLower.includes('promax') || 
        skuLower.includes('pro max') || 
        skuLower.includes('pro-max') ||
        skuLower.includes('-pm-') ||  // IP17PM-BL-256
        skuLower.startsWith('ip17pm') ||  // IP17PM...
        skuLower.match(/ip\d+pm/i);  // IP17PM, IP18PM и т.д.
      
      const isPro = 
        (productModelLower.includes('pro') && !productModelLower.includes('max') && !productModelLower.includes('air')) ||
        ((skuLower.includes('pro') && !isProMax) || 
        skuLower.match(/ip\d+p[^-]/i) || 
        skuLower.match(/ip\d+p$/i) ||
        skuLower.includes('-p-') ||  // IP17P-BL-256
        skuLower.match(/ip17p-/i) ||  // IP17P-XX-256
        (skuLower.includes('iphone') && skuLower.includes('17') && skuLower.includes('pro') && !skuLower.includes('max')));  // Дополнительная проверка
      
      const isAir = 
        productModelLower.includes('air') ||
        skuLower.includes('air') || 
        skuLower.includes('-air-') ||
        skuLower.match(/ip\d+air/i) ||
        skuLower.match(/ip17air/i);  // IP17AIR-XX-256GB
      
      if (isProMax) {
        model = 'Pro Max';
      } else if (isPro) {
        model = 'Pro';
      } else if (isAir) {
        model = 'Air';
      } else {
        // Если нет специфических маркеров, это обычный iPhone 17 (Standard)
        model = 'Standard';
      }
    } else {
      // Для не-iPhone товаров model не используется, но оставляем для совместимости
      model = 'Standard';
    }

    // Определяем storage из memory или storage
    let storage: '256GB' | '512GB' | '1TB' = '256GB';
    const storageValue = variant.memory || variant.storage || '';
    if (storageValue.includes('1TB') || storageValue.includes('1 TB')) {
      storage = '1TB';
    } else if (storageValue.includes('512') || storageValue.includes('512GB')) {
      storage = '512GB';
    } else if (storageValue.includes('256') || storageValue.includes('256GB')) {
      storage = '256GB';
    }

    // Вычисляем цену
    const basePrice = product.basePrice * (1 - product.discount / 100);
    const price = basePrice + (variant.priceModifier || 0);

    // Парсим images из JSON строки или загружаем через API
    let images: string[] = [];
    try {
      if (variant.images) {
        const parsed: unknown = JSON.parse(variant.images);
        if (Array.isArray(parsed)) {
          images = parsed.filter((item: unknown): item is string => {
            return typeof item === 'string' && item.length > 0;
          });
        } else if (typeof parsed === 'string' && parsed.length > 0) {
          images = [parsed];
        }
      }
    } catch (e) {
      // Если не JSON, пробуем как строку
      if (typeof variant.images === 'string' && variant.images.length > 0) {
        images = [variant.images];
      }
    }

    // Если изображений нет, формируем URL для загрузки через API
    if (images.length === 0) {
      // Изображения будут загружены через API в компоненте
      images = [];
    }

    return {
      id: variant.id,
      model,
      color: variant.color || '',
      storage,
      price,
      priceModifier: variant.priceModifier || 0, // Добавляем priceModifier для правильного расчета цены
      images,
      sku: variant.sku,
      available: variant.inStock || false,
    };
  });

  return (
    <ProductPageClient
      product={{
        ...product,
        variants: transformedVariants,
      }}
    />
  );
}
