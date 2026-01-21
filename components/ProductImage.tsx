'use client';

import { useState, useEffect } from 'react';

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
}

export default function ProductImage({
  src,
  alt,
  className = '',
  fill = true,
  sizes,
}: ProductImageProps) {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  
  // Генерируем cache buster только на клиенте после монтирования
  const [cacheBuster] = useState(() => {
    if (typeof window !== 'undefined') {
      return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
    return '';
  });
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Если это API endpoint для получения JSON, загружаем изображение
  const isApiJsonEndpoint = src?.startsWith('/api/products/images');
  
  useEffect(() => {
    if (isApiJsonEndpoint && src) {
      fetch(src)
        .then(res => res.json())
        .then((data: unknown) => {
          // Type guard for API response
          const response = data as { mainImage?: unknown; images?: unknown };
          
          if (typeof response.mainImage === 'string') {
            setImageUrl(response.mainImage);
          } else if (Array.isArray(response.images) && response.images.length > 0 && typeof response.images[0] === 'string') {
            setImageUrl(response.images[0]);
          }
        })
        .catch(() => setError(true));
    } else if (src) {
      setImageUrl(src);
    }
  }, [src, isApiJsonEndpoint]);

  // Если нет src или произошла ошибка - показываем прозрачный placeholder
  if (!src || error) {
    return (
      <div className={`w-full h-full bg-[#1a1a1a] flex items-center justify-center ${className}`}>
        {/* Прозрачный placeholder - невидимый, но занимает место */}
        <div className="w-full h-full opacity-0" aria-hidden="true" />
      </div>
    );
  }
  
  // Если это API endpoint и изображение еще загружается
  if (isApiJsonEndpoint && !imageUrl) {
    return (
      <div className={`w-full h-full bg-[#1a1a1a] flex items-center justify-center ${className}`}>
        <div className="w-full h-full opacity-0" aria-hidden="true" />
      </div>
    );
  }
  
  // Если это API endpoint и изображение загружено
  if (isApiJsonEndpoint && imageUrl) {
    // КРИТИЧНО: Добавляем уникальный cache buster к каждому изображению только на клиенте
    const imageUrlWithCache = mounted && cacheBuster
      ? (imageUrl.includes('?') 
          ? `${imageUrl}&_cb=${cacheBuster}`
          : `${imageUrl}?_cb=${cacheBuster}`)
      : imageUrl;
    
    return (
      <div className={`relative w-full h-full bg-[#1a1a1a] ${className}`} suppressHydrationWarning>
        <img
          key={`${imageUrl}_${mounted ? cacheBuster : 'server'}`}
          src={imageUrlWithCache}
          alt={alt}
          className="object-contain p-4 w-full h-full"
          onError={() => setError(true)}
          onLoad={() => setLoading(false)}
          style={{ objectFit: 'contain' }}
        />
        {loading && mounted && (
          <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse" />
        )}
      </div>
    );
  }

  // Если src начинается с /api/images или /api/category-icons, используем обычный img тег
  if (src?.startsWith('/api/images') || src?.startsWith('/api/category-icons')) {
    // Для category-icons не показываем loading, так как изображения маленькие
    const isCategoryIcon = src?.startsWith('/api/category-icons');
    // КРИТИЧНО: Добавляем уникальный cache buster только на клиенте
    const imageSrcWithCache = !isCategoryIcon && mounted && cacheBuster && src
      ? (src.includes('?') 
          ? `${src}&_cb=${cacheBuster}` 
          : `${src}?_cb=${cacheBuster}`)
      : src;
    
    return (
      <div className={`relative w-full h-full bg-gradient-to-br from-card-bg-start to-card-bg-end ${className}`} suppressHydrationWarning>
        <img
          src={imageSrcWithCache}
          alt={alt}
          className="object-contain w-full h-full"
          onError={(e) => {
            console.error('❌ Image load error:', src, e);
            setError(true);
            setLoading(false);
          }}
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
          style={{ objectFit: 'contain' }}
        />
        {loading && !isCategoryIcon && mounted && (
          <div className="absolute inset-0 bg-gradient-to-br from-card-bg-start to-card-bg-end animate-pulse" />
        )}
        {error && mounted && (
          <div className="absolute inset-0 bg-gradient-to-br from-card-bg-start to-card-bg-end flex items-center justify-center text-text-muted text-xs">
            📦
          </div>
        )}
      </div>
    );
  }
  
  // Если src начинается с /category-icons (статические файлы из public), используем обычный img для избежания проблем гидратации
  if (src?.startsWith('/category-icons')) {
    return (
      <div className={`relative w-full h-full bg-gradient-to-br from-card-bg-start to-card-bg-end ${className}`} suppressHydrationWarning>
        <img
          src={src}
          alt={alt}
          className="object-contain w-full h-full"
          onError={() => {
            console.error('❌ Image load error:', src);
            setError(true);
            setLoading(false);
          }}
          onLoad={() => {
            setLoading(false);
            setError(false);
          }}
          style={{ objectFit: 'contain', width: '100%', height: '100%' }}
          suppressHydrationWarning
        />
        {/* Всегда рендерим одинаковую структуру для избежания проблем гидратации */}
        <div className="absolute inset-0 bg-gradient-to-br from-card-bg-start to-card-bg-end animate-pulse" style={{ display: loading && mounted ? 'block' : 'none' }} />
        <div className="absolute inset-0 bg-gradient-to-br from-card-bg-start to-card-bg-end flex items-center justify-center text-text-muted text-xs" style={{ display: error && mounted ? 'flex' : 'none' }}>
          📦
        </div>
      </div>
    );
  }

  // Для всех остальных случаев используем обычный img, чтобы избежать проблем гидратации
  return (
    <div className={`relative w-full h-full bg-[#1a1a1a] ${className}`} suppressHydrationWarning>
      <img
        src={src}
        alt={alt}
        className="object-contain p-4 w-full h-full"
        onError={() => {
          setError(true);
          setLoading(false);
        }}
        onLoad={() => {
          setLoading(false);
          setError(false);
        }}
        style={{
          objectFit: 'contain',
          width: '100%',
          height: '100%',
        }}
      />
      {loading && mounted && (
        <div className="absolute inset-0 bg-[#1a1a1a] animate-pulse" />
      )}
    </div>
  );
}
