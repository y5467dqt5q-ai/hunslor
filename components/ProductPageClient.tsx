'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store';
import ProductImage from './ProductImage';
import VariantSelector from './VariantSelector';
import Button from './Button';
import FavoriteButton from './FavoriteButton';

interface ProductVariant {
  id: string;
  model: 'Pro' | 'Pro Max' | 'Standard' | 'Air';
  color: string;
  storage: '256GB' | '512GB' | '1TB';
  price: number;
  priceModifier?: number; // Добавлено для правильного расчета цены
  images: string[];
  sku: string;
  available: boolean;
}

interface Product {
  id: string;
  brand: string;
  model: string;
  slug: string;
  baseDescription: string;
  basePrice: number;
  discount: number;
  category: {
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
}

interface ProductPageClientProps {
  product: Product;
}

interface ImagesApiResponse {
  images?: string[];
  mainImage?: string;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const addItem = useCartStore((state) => state.addItem);

  // Инициализация: выбираем первый доступный вариант
  useEffect(() => {
    if (product.variants.length > 0 && !selectedVariant) {
      const firstAvailable = product.variants.find((v: ProductVariant) => v.available) || product.variants[0];
      if (firstAvailable) {
        setSelectedVariant(firstAvailable);
      }
    }
  }, [product.variants, selectedVariant]);

  // Загружаем изображения для выбранного варианта
  useEffect(() => {
    const loadImages = async () => {
      if (!selectedVariant) {
        setVariantImages([]);
        return;
      }

      // Всегда загружаем через API, чтобы получить актуальные изображения
      // КРИТИЧНО: Передаем color и storage, если они отличаются от варианта в БД
      try {
        // Добавляем случайное число и timestamp для полного обхода кеша
        const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        let imageUrl = `/api/products/images?product=${encodeURIComponent(product.slug)}&variant=${selectedVariant.id}&_cb=${cacheBuster}`;
        
        // Если цвет или память были изменены (виртуальный вариант), передаем их в API
        // Это гарантирует, что загрузятся изображения для выбранного цвета и памяти
        if (selectedVariant.color) {
          imageUrl += `&color=${encodeURIComponent(selectedVariant.color)}`;
        }
        if (selectedVariant.storage) {
          imageUrl += `&storage=${encodeURIComponent(selectedVariant.storage)}`;
        }
        
        const response = await fetch(imageUrl, { 
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
          },
        });

        if (response.ok) {
          const jsonData: unknown = await response.json();
          const data = jsonData as ImagesApiResponse;
          
          const images: string[] = (() => {
            if (data.images && Array.isArray(data.images) && data.images.length > 0) {
              const imagesArray: unknown[] = data.images;
              const filtered: string[] = imagesArray.filter((item: unknown): item is string => {
                return typeof item === 'string' && item.length > 0;
              });
              return filtered;
            }
            if (data.mainImage && typeof data.mainImage === 'string' && data.mainImage.length > 0) {
              return [data.mainImage] as string[];
            }
            return [] as string[];
          })();
          
          console.log('✅ Loaded images for variant:', selectedVariant.id, 'images:', images.length);
          if (images.length > 0) {
            const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
            const imagesWithCacheBuster: string[] = images.map((img: string): string => {
              if (typeof img !== 'string' || img.length === 0) {
                return '';
              }
              return img.includes('?') ? `${img}&_cb=${cacheBuster}` : `${img}?_cb=${cacheBuster}`;
            }).filter((url: string): url is string => url.length > 0);
            setVariantImages(imagesWithCacheBuster);
            setCurrentImageIndex(0);
          } else {
            console.warn('⚠️ No images found for variant:', selectedVariant.id);
            setVariantImages([]);
            setCurrentImageIndex(0);
          }
        } else {
          console.error('❌ Failed to load images, status:', response.status);
          setVariantImages([]);
        }
      } catch (error) {
        console.error('❌ Error loading variant images:', error);
        setVariantImages([]);
      }
    };

    loadImages();
  }, [selectedVariant?.id, selectedVariant?.model, selectedVariant?.color, selectedVariant?.storage, product.slug]);

  // Цена из selectedVariant с учетом priceModifier и скидки
  const basePriceWithDiscount = product.basePrice * (1 - product.discount / 100);
  const priceModifier = selectedVariant?.priceModifier || 0;
  const price = basePriceWithDiscount + priceModifier;

  // Название из selectedVariant - убираем дублирование моделей и "Unknown"
  const cleanBrand = product.brand && product.brand.toLowerCase() !== 'unknown' ? product.brand : '';
  
  // Определяем, является ли товар iPhone (для добавления storage в название)
  const isIPhone = product.category.slug === 'iphone' || 
                   product.category.slug === 'smartphones' && 
                   (product.model.toLowerCase().includes('iphone') || product.brand.toLowerCase() === 'apple');
  
  const displayName = selectedVariant
    ? (() => {
        // Убираем все упоминания Pro Max, Pro, Air, Standard из модели
        let cleanModel = product.model || '';
        cleanModel = cleanModel.replace(/\s*Pro Max\s*/gi, '')
                               .replace(/\s*Pro\s*/gi, '')
                               .replace(/\s*Air\s*/gi, '')
                               .replace(/\s*Standard\s*/gi, '')
                               .trim();
        
        // Добавляем правильную серию из selectedVariant
        let modelPart = '';
        if (selectedVariant.model === 'Pro Max') {
          modelPart = 'Pro Max';
        } else if (selectedVariant.model === 'Pro') {
          modelPart = 'Pro';
        } else if (selectedVariant.model === 'Air') {
          modelPart = 'Air';
        }
        // Если Standard - не добавляем ничего, оставляем просто модель
        
        // Для не-iPhone товаров: проверяем, есть ли цвет уже в названии модели
        let modelColor = '';
        if (!isIPhone && cleanModel.includes('(') && cleanModel.includes(')')) {
          // Извлекаем цвет из скобок в названии модели
          const colorMatch = cleanModel.match(/\(([^)]+)\)/);
          if (colorMatch) {
            modelColor = colorMatch[1].trim();
          }
        }
        
        // КРИТИЧНО: Добавляем storage только для iPhone
        const storagePart = (isIPhone && selectedVariant.storage) ? ` ${selectedVariant.storage}` : '';
        
        // КРИТИЧНО: Для не-iPhone товаров не добавляем цвет, если он уже есть в названии модели
        // Для iPhone всегда добавляем цвет из selectedVariant
        let colorPart = '';
        if (isIPhone && selectedVariant.color) {
          colorPart = ` (${selectedVariant.color})`;
        } else if (!isIPhone && selectedVariant.color) {
          // Для не-iPhone: добавляем цвет только если его нет в названии модели
          // Если цвет уже есть в названии, не добавляем его повторно
          if (!modelColor || modelColor.toLowerCase() !== selectedVariant.color.toLowerCase()) {
            colorPart = ` (${selectedVariant.color})`;
          }
          // Если цвет уже есть в названии модели, colorPart остается пустым
          // но цвет останется в cleanModel, так как мы его не удаляем
        }
        
        // Убираем дублирование бренда в названии модели (для всех товаров)
        if (cleanBrand && cleanModel.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
          cleanModel = cleanModel.substring(cleanBrand.length).trim();
        }
        
        if (modelPart) {
          return cleanBrand 
            ? `${cleanBrand} ${cleanModel} ${modelPart}${storagePart}${colorPart}`.trim()
            : `${cleanModel} ${modelPart}${storagePart}${colorPart}`.trim();
        } else {
          return cleanBrand 
            ? `${cleanBrand} ${cleanModel}${storagePart}${colorPart}`.trim()
            : `${cleanModel}${storagePart}${colorPart}`.trim();
        }
      })()
    : (() => {
        // Для случая без selectedVariant также убираем дублирование бренда
        let modelWithoutBrand = product.model || '';
        if (cleanBrand && modelWithoutBrand.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
          modelWithoutBrand = modelWithoutBrand.substring(cleanBrand.length).trim();
        }
        return cleanBrand ? `${cleanBrand} ${modelWithoutBrand}`.trim() : modelWithoutBrand;
      })();

  // Главное изображение - всегда первое из массива или по индексу
  const mainImage = (Array.isArray(variantImages) && variantImages.length > 0)
    ? variantImages[currentImageIndex >= 0 && currentImageIndex < variantImages.length ? currentImageIndex : 0]
    : '';

  const handleAddToCart = () => {
    if (!selectedVariant) return;

    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      title: displayName,
      price: price,
      image: mainImage,
      quantity: 1,
      variantData: {
        model: selectedVariant.model,
        color: selectedVariant.color,
        storage: selectedVariant.storage,
      },
    });
  };

  if (!selectedVariant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Lade Produkt...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-6 text-sm text-text-muted">
          <a href="/" className="hover:text-neon-green transition-colors duration-250">Startseite</a>
          <span className="mx-2">/</span>
          <a href="/catalog" className="hover:text-neon-green transition-colors duration-250">Katalog</a>
          <span className="mx-2">/</span>
          <a href={`/catalog?category=${product.category.slug}`} className="hover:text-neon-green transition-colors duration-250">
            {product.category.name}
          </a>
          <span className="mx-2">/</span>
          <span className="text-foreground">{displayName}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="bg-[#1a1a1a] rounded-card border border-card-border overflow-hidden aspect-square">
              <ProductImage
                key={`main-${mainImage}`} // КРИТИЧНО: Ключ на основе URL для принудительного обновления при изменении
                src={mainImage}
                alt={displayName}
                className="w-full h-full"
              />
            </div>
            
            {Array.isArray(variantImages) && variantImages.length > 0 && (
              <div className="grid grid-cols-4 gap-2">
                {variantImages.map((img: string, idx: number): JSX.Element => {
                  return (
                    <button
                      key={`thumb-${idx}-${img}`}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`aspect-square rounded-button border overflow-hidden transition-all duration-200 ${
                        currentImageIndex === idx
                          ? 'border-neon-green shadow-neon'
                          : 'border-card-border hover:border-neon-green/50'
                      }`}
                    >
                      <ProductImage
                        key={`gallery-${idx}-${img}`}
                        src={img}
                        alt={`${displayName} - View ${idx + 1}`}
                        className="w-full h-full"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-2">
                <h1 className="text-4xl font-bold">{displayName}</h1>
                <FavoriteButton productId={product.id} />
              </div>
              <p className="text-text-muted">{product.category.name}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-neon-green">
                  {price.toFixed(2)} €
                </span>
              </div>
            </div>

            {product.variants.length > 0 && (
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onVariantChange={setSelectedVariant}
                productSlug={product.slug}
                productModel={product.model}
                categorySlug={product.category.slug}
              />
            )}

            <div className="pt-4">
              <Button
                variant="primary"
                className="w-full py-4 text-lg"
                onClick={handleAddToCart}
                disabled={!selectedVariant.available}
              >
                {selectedVariant.available
                  ? 'In den Warenkorb'
                  : 'Nicht verfügbar'}
              </Button>
            </div>

            <div className="text-sm">
              {selectedVariant.available ? (
                <span className="text-neon-green">✓ Auf Lager</span>
              ) : (
                <span className="text-red-400">✗ Nicht verfügbar</span>
              )}
            </div>

            {/* Additional Information Blocks - только для не-iPhone товаров */}
            {!isIPhone && (
              <div className="pt-6 space-y-4 border-t border-card-border">
                {/* Гарантия и поддержка */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🛡️</span>
                      <h4 className="font-semibold text-white">2 Jahre Garantie</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      Offizielle Herstellergarantie inklusive
                    </p>
                  </div>

                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">🚚</span>
                      <h4 className="font-semibold text-white">Kostenloser Versand</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      Ab 50€ Bestellwert versandkostenfrei
                    </p>
                  </div>
                </div>

                {/* Оплата и возврат */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">💳</span>
                      <h4 className="font-semibold text-white">Sichere Zahlung</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      SSL-verschlüsselt, alle Zahlungsmethoden
                    </p>
                  </div>

                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">↩️</span>
                      <h4 className="font-semibold text-white">14 Tage Rückgabe</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      Kostenlose Rücksendung innerhalb von 14 Tagen
                    </p>
                  </div>
                </div>

                {/* Дополнительная информация */}
                <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span>📦</span>
                    Lieferung & Verfügbarkeit
                  </h4>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green">✓</span>
                      <span>Sofort verfügbar - Versand innerhalb von 1-2 Werktagen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green">✓</span>
                      <span>Originalverpackt vom Hersteller</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green">✓</span>
                      <span>Kostenloser Versand innerhalb Deutschlands</span>
                    </div>
                  </div>
                </div>

                {/* Контактная информация */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-neon-green/20 rounded-button p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span>💬</span>
                    Fragen zum Produkt?
                  </h4>
                  <p className="text-sm text-white/70 mb-3">
                    Unser Support-Team hilft Ihnen gerne weiter
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/60">📧 support@hunslor.de</span>
                    <span className="text-white/60">📞 +49 152 567 889 30</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Product Description Section */}
        {product.baseDescription && (
          <div className="mt-12 pt-8 border-t border-card-border">
            <div 
              className="product-description prose prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: product.baseDescription }}
              style={{
                color: '#e5e5e5',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
