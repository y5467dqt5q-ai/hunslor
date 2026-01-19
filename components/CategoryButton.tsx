'use client';

import Link from 'next/link';
import ProductImage from './ProductImage';

interface CategoryButtonProps {
  href: string;
  folderName: string;
  displayName: string;
  imageFileName?: string;
}

export default function CategoryButton({ href, folderName, displayName, imageFileName }: CategoryButtonProps) {
  // Сначала пробуем использовать статический путь из public/category-icons, если указан imageFileName
  // Если нет, используем API endpoint для поиска в папке пользователя
  const iconUrl = imageFileName 
    ? `/category-icons/${imageFileName}`
    : `/api/category-icons/${folderName}`;
  
  return (
    <Link 
      href={href} 
      className="group relative bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-button border border-card-border overflow-hidden hover:border-neon-green/50 transition-all duration-300 hover:shadow-neon-hover flex flex-col items-center justify-center px-4 py-3 min-w-[100px]"
      suppressHydrationWarning
    >
      <div className="w-20 h-20 mb-1.5 group-hover:scale-110 transition-transform duration-300 relative flex items-center justify-center bg-gradient-to-br from-card-bg-start to-card-bg-end" suppressHydrationWarning>
        <ProductImage
          src={iconUrl}
          alt={displayName}
          className="w-full h-full object-contain"
          fill={true}
        />
      </div>
      <span className="text-xs font-semibold group-hover:text-neon-green transition-colors duration-250 text-center" suppressHydrationWarning>
        {displayName}
      </span>
    </Link>
  );
}
