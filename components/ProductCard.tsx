'use client';

import Link from 'next/link';
import Button from './Button';
import ProductImage from './ProductImage';

interface ProductCardProps {
  title: string;
  brand: string;
  price: string;
  imageUrl?: string;
  imageAlt?: string;
  href?: string;
}

export default function ProductCard({
  title,
  brand,
  price,
  imageUrl,
  imageAlt,
  href = '#',
}: ProductCardProps) {
  return (
    <div className="group relative bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card p-0 border border-card-border overflow-hidden hover:border-neon-green/30 hover:shadow-neon-hover transition-all duration-300">
      {/* Контейнер изображения - того же цвета что и карточка */}
      <Link href={href} className="block cursor-pointer" suppressHydrationWarning>
        <div className="w-full h-64 relative overflow-hidden bg-gradient-to-br from-card-bg-start to-card-bg-end">
          <ProductImage
            src={imageUrl}
            alt={imageAlt || title}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </Link>
      
      <div className="p-5">
        <Link href={href} className="block mb-2 cursor-pointer" suppressHydrationWarning>
          <h3 className="text-xl font-semibold mb-1 group-hover:text-neon-green transition-colors duration-250">
            {title}
          </h3>
          <p className="text-text-muted text-sm">{brand}</p>
        </Link>
        
        <div className="flex items-center justify-between gap-4 mt-4">
          <span className="text-2xl font-bold flex-shrink-0">{price}</span>
          <Link href={href} className="cursor-pointer" suppressHydrationWarning>
            <Button variant="secondary" className="flex-shrink-0">
              Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
