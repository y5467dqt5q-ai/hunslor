'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from './ProductCard';

interface Product {
  id: string;
  brand: string;
  model: string;
  slug: string;
  basePrice: number;
  discount: number;
  variants: {
    id: string;
    priceModifier: number;
    images: string;
    inStock: boolean;
  }[];
}

// Компонент для продукта с асинхронной загрузкой изображения
function ProductCardWithImage({ product }: { product: Product }) {
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  
  useEffect(() => {
    if (product.slug && product.variants.length > 0) {
      // Пробуем загрузить изображение для первого варианта
      const firstVariantId = product.variants[0]?.id;
      const imageApiUrl = firstVariantId 
        ? `/api/products/images?product=${encodeURIComponent(product.slug)}&variant=${firstVariantId}`
        : `/api/products/images?product=${encodeURIComponent(product.slug)}`;
      
      fetch(imageApiUrl)
        .then(res => res.json())
        .then(data => {
          if (data.mainImage) {
            setImageUrl(data.mainImage);
          } else if (data.images && data.images.length > 0) {
            setImageUrl(data.images[0]);
          }
        })
        .catch(() => {
          // Игнорируем ошибку
        });
    }
  }, [product.slug, product.variants]);
  
  const prices = product.variants.map((v: Product['variants'][0]) => {
    const basePrice = product.basePrice * (1 - product.discount / 100);
    return basePrice + (v.priceModifier || 0);
  });
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const priceDisplay = minPrice === maxPrice 
    ? `${minPrice.toFixed(0)} €`
    : `${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)} €`;

  // Убираем "Unknown" из названия
  const cleanBrand = product.brand && product.brand.toLowerCase() !== 'unknown' ? product.brand : '';
  let cleanModel = product.model || '';
  
  // Убираем дублирование бренда в названии модели (чтобы избежать "Apple Apple AirPods")
  if (cleanBrand && cleanModel.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
    cleanModel = cleanModel.substring(cleanBrand.length).trim();
  }
  
  const title = cleanBrand ? `${cleanBrand} ${cleanModel}`.trim() : cleanModel;

  return (
    <ProductCard
      key={product.id}
      title={title}
      brand={cleanBrand || ''}
      price={priceDisplay}
      imageUrl={imageUrl}
      href={`/products/${product.slug}`}
    />
  );
}

export default function CatalogClient() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        searchParams.forEach((value, key) => {
          if (value) {
            params.append(key, value);
          }
        });

        const response = await fetch(`/api/products/filter?${params.toString()}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.error('Invalid response format:', data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted">Lade Produkte...</div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-text-muted text-lg">Keine Produkte gefunden</div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCardWithImage key={product.id} product={product} />
      ))}
    </div>
  );
}
