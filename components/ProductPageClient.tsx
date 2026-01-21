'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store';
import AddToCartButton from '@/components/AddToCartButton';
import FavoriteButton from '@/components/FavoriteButton';

interface Variant {
  id: string;
  model: 'Pro' | 'Pro Max' | 'Standard' | 'Air';
  color: string;
  storage: '256GB' | '512GB' | '1TB';
  price: number;
  priceModifier: number;
  images: string[];
  sku: string;
  available: boolean;
}

interface Product {
  id: string;
  slug: string;
  brand: string;
  model: string;
  basePrice: number;
  discount: number;
  baseDescription: string;
  category: {
    slug: string;
    name: string;
  };
  variants: Variant[];
}

interface ProductPageClientProps {
  product: Product;
}

export default function ProductPageClient({ product }: ProductPageClientProps) {
  const router = useRouter();
  const addToCart = useCartStore((state) => state.addItem);
  
  // Get unique options
  const models = Array.from(new Set(product.variants.map((v) => v.model))).sort();
  const colors = Array.from(new Set(product.variants.map((v) => v.color))).sort();
  const storages = Array.from(new Set(product.variants.map((v) => v.storage))).sort();

  // Initial state based on first variant or defaults
  const [selectedModel, setSelectedModel] = useState<string>(
    models.includes('Pro Max') ? 'Pro Max' : models[0] || 'Standard'
  );
  const [selectedColor, setSelectedColor] = useState<string>(colors[0] || '');
  const [selectedStorage, setSelectedStorage] = useState<string>(storages[0] || '');
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [variantImages, setVariantImages] = useState<string[]>([]);
  const [isLoadingImages, setIsLoadingImages] = useState(false);

  // Find currently selected variant
  const selectedVariant = useMemo(() => {
    return product.variants.find(
      (v) =>
        v.model === selectedModel &&
        v.color === selectedColor &&
        v.storage === selectedStorage
    ) || product.variants[0];
  }, [product.variants, selectedModel, selectedColor, selectedStorage]);

  // Update selected options when variant changes (if needed to ensure consistency)
  useEffect(() => {
    if (selectedVariant) {
      if (selectedVariant.model !== selectedModel) setSelectedModel(selectedVariant.model);
      if (selectedVariant.color !== selectedColor) setSelectedColor(selectedVariant.color);
      if (selectedVariant.storage !== selectedStorage) setSelectedStorage(selectedVariant.storage);
    }
  }, [selectedVariant]); // Be careful with dependencies to avoid loops

  // Fetch images logic
  useEffect(() => {
    const fetchImages = async () => {
      if (!selectedVariant) return;
      
      setIsLoadingImages(true);
      
      try {
        let imageUrl = `/api/products/images?product=${product.slug}`;
        
        // Если у варианта есть ID, используем его
        if (selectedVariant.id) {
          imageUrl += `&variant=${selectedVariant.id}`;
        } else {
          // Если ID нет (виртуальный вариант), передаем параметры
          if (selectedVariant.color) {
            imageUrl += `&color=${encodeURIComponent(selectedVariant.color)}`;
          }
          if (selectedVariant.storage) {
            imageUrl += `&storage=${encodeURIComponent(selectedVariant.storage)}`;
          }
        }
        
        const response = await fetch(imageUrl);

        if (response.ok) {
          const jsonData: unknown = await response.json();
          const data = jsonData as { images?: unknown; mainImage?: unknown };
          
          // STRICT TYPE SAFETY IMPLEMENTATION
          const images: unknown = data.images;

          // 🔒 ЖЁСТКО ТИПИЗИРОВАННАЯ ОБРАБОТКА ИЗОБРАЖЕНИЙ (БЕЗ any) 
          const rawImages: unknown[] = Array.isArray(images) ? images : []; 
          
          // Fallback to mainImage if rawImages is empty
          if (rawImages.length === 0 && typeof data.mainImage === 'string' && data.mainImage.length > 0) {
            rawImages.push(data.mainImage);
          }

          const safeImages: string[] = rawImages.filter ( 
            (img): img is string  => 
              typeof img === 'string' && img.trim().length > 0 
          ); 

          console.log ( 
            '✅ Loaded images for variant:' , 
            selectedVariant.id , 
            'count:' , 
            safeImages.length 
          ); 

          if (safeImages.length > 0 ) { 
            setVariantImages (safeImages); 
            setCurrentImageIndex(0 ); 
          } else  { 
            console.warn('⚠ No images found for variant:', selectedVariant.id ); 
            setVariantImages ([]); 
            setCurrentImageIndex(0 ); 
          }
        } else {
          console.error('❌ Failed to load images, status:', response.status);
          setVariantImages([]);
        }
      } catch (error) {
        console.error('❌ Error loading variant images:', error);
        setVariantImages([]);
      } finally {
        setIsLoadingImages(false);
      }
    };

    fetchImages();
  }, [selectedVariant, product.slug]);

  const currentPrice = selectedVariant?.price || product.basePrice;

  return (
    <div className="container mx-auto px-4 py-8 text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Images */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-transparent rounded-lg overflow-hidden flex items-center justify-center">
            {isLoadingImages ? (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Loading...
              </div>
            ) : variantImages.length > 0 ? (
              <Image
                src={variantImages[currentImageIndex].startsWith('/') || variantImages[currentImageIndex].startsWith('http') ? variantImages[currentImageIndex] : `/api/images/${variantImages[currentImageIndex]}`}
                alt={product.model}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                No Image Available
              </div>
            )}
            
            {/* Navigation Arrows */}
            {variantImages.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev > 0 ? prev - 1 : variantImages.length - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition text-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <button
                  onClick={() => setCurrentImageIndex((prev) => (prev < variantImages.length - 1 ? prev + 1 : 0))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow-md hover:bg-white transition text-black"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </>
            )}
          </div>
          
          {/* Thumbnails */}
          {variantImages.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {variantImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-20 h-20 flex-shrink-0 border-2 rounded-md overflow-hidden ${
                    currentImageIndex === idx ? 'border-neon-green shadow-neon' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={img.startsWith('/') || img.startsWith('http') ? img : `/api/images/${img}`}
                    alt={`Thumbnail ${idx}`}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Product Info */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">
              {product.brand} {product.model}
              {selectedVariant?.model && selectedVariant.model !== 'Standard' && !product.model.includes(selectedVariant.model) 
                ? ` ${selectedVariant.model}` 
                : ''}
            </h1>
            <p className="text-sm text-gray-400 mt-1">SKU: {selectedVariant?.sku}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold text-blue-500">
                €{currentPrice.toLocaleString()}
              </div>
            <FavoriteButton productId={product.id} />
          </div>

          <div className="space-y-4">
            {/* Model Selector */}
            {models.length > 1 && (
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Model</label>
                <div className="flex flex-wrap gap-2">
                  {models.map((model) => (
                    <button
                      key={model}
                      onClick={() => setSelectedModel(model)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                        selectedModel === model
                          ? 'bg-neon-green/10 text-neon-green border border-neon-green shadow-neon'
                          : 'bg-zinc-900 text-gray-300 border border-zinc-700 hover:border-neon-green/50 hover:text-neon-green'
                      }`}
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Color Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Color: {selectedColor}</label>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedColor === color
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green shadow-neon'
                        : 'bg-zinc-900 text-gray-300 border border-zinc-700 hover:border-neon-green/50 hover:text-neon-green'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Storage</label>
              <div className="flex flex-wrap gap-2">
                {storages.map((storage) => (
                  <button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      selectedStorage === storage
                        ? 'bg-neon-green/10 text-neon-green border border-neon-green shadow-neon'
                        : 'bg-zinc-900 text-gray-300 border border-zinc-700 hover:border-neon-green/50 hover:text-neon-green'
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-800">
            <AddToCartButton
              productId={product.id}
              variantId={selectedVariant?.id || product.id}
              title={`${product.brand} ${product.model}${selectedVariant?.model && selectedVariant.model !== 'Standard' && !product.model.includes(selectedVariant.model) ? ` ${selectedVariant.model}` : ''}`}
              price={selectedVariant?.price || product.basePrice}
              image={variantImages[0] || ''}
              variantData={{
                color: selectedColor,
                memory: selectedStorage
              }}
              disabled={!selectedVariant?.available}
            />
            {!selectedVariant?.available && (
              <p className="text-red-400 mt-2 text-sm">Currently unavailable</p>
            )}
          </div>

          <div className="prose max-w-none pt-8 border-t border-gray-800">
            <h3 className="text-lg font-semibold mb-2 text-white">Description</h3>
            <p className="text-gray-300 whitespace-pre-line">
              {product.baseDescription}
              {selectedVariant?.storage ? `\n\nStorage: ${selectedVariant.storage}` : ''}
              {selectedVariant?.color ? `\nColor: ${selectedVariant.color}` : ''}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
