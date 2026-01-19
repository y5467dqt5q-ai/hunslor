'use client';

import { useFavoriteStore } from '@/lib/store';
import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';

interface Product {
  id: string;
  brand: string;
  model: string;
  slug: string;
  basePrice: number;
  discount: number;
  variants: {
    id: string;
    images: string;
  }[];
}

export default function FavoritesPage() {
  const { favorites, isFavorite } = useFavoriteStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (favorites.length === 0) {
        setProducts([]);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/products?ids=${favorites.join(',')}`);
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [favorites]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Favoriten</h1>
          <div className="text-center py-16">
            <div className="text-text-muted">Lade Favoriten...</div>
          </div>
        </div>
      </div>
    );
  }

  if (favorites.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Favoriten</h1>
          <div className="text-center py-16">
            <p className="text-text-muted text-lg mb-6">Sie haben noch keine Favoriten</p>
            <a href="/catalog" className="text-neon-green hover:text-neon-green-dark transition-colors duration-250">
              Zum Katalog
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8">Favoriten</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => {
            const prices = product.variants.map(v => {
              const basePrice = product.basePrice * (1 - product.discount / 100);
              return basePrice;
            });
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            const priceDisplay = minPrice === maxPrice 
              ? `${minPrice.toFixed(0)} €`
              : `${minPrice.toFixed(0)} - ${maxPrice.toFixed(0)} €`;

            const firstVariant = product.variants[0];
            const images = firstVariant?.images ? JSON.parse(firstVariant.images) : [];
            const imageUrl = images.length > 0 ? `/api/images/${images[0]}` : undefined;

            return (
              <ProductCard
                key={product.id}
                title={`${product.brand} ${product.model}`}
                brand={product.brand}
                price={priceDisplay}
                imageUrl={imageUrl}
                href={`/products/${product.slug}`}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
