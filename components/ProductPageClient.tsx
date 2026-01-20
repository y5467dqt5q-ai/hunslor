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
  priceModifier?: number; // Р”РѕР±Р°РІР»РµРЅРѕ РґР»СЏ РїСЂР°РІРёР»СЊРЅРѕРіРѕ СЂР°СЃС‡РµС‚Р° С†РµРЅС‹
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

  // РРЅРёС†РёР°Р»РёР·Р°С†РёСЏ: РІС‹Р±РёСЂР°РµРј РїРµСЂРІС‹Р№ РґРѕСЃС‚СѓРїРЅС‹Р№ РІР°СЂРёР°РЅС‚
  useEffect(() => {
    if (product.variants.length > 0 && !selectedVariant) {
      const firstAvailable = product.variants.find((v: ProductVariant) => v.available) || product.variants[0];
      if (firstAvailable) {
        setSelectedVariant(firstAvailable);
      }
    }
  }, [product.variants, selectedVariant]);

  // Р—Р°РіСЂСѓР¶Р°РµРј РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РґР»СЏ РІС‹Р±СЂР°РЅРЅРѕРіРѕ РІР°СЂРёР°РЅС‚Р°
  useEffect(() => {
    const loadImages = async () => {
      if (!selectedVariant) {
        setVariantImages([]);
        return;
      }

      // Р’СЃРµРіРґР° Р·Р°РіСЂСѓР¶Р°РµРј С‡РµСЂРµР· API, С‡С‚РѕР±С‹ РїРѕР»СѓС‡РёС‚СЊ Р°РєС‚СѓР°Р»СЊРЅС‹Рµ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ
      // РљР РРўРР§РќРћ: РџРµСЂРµРґР°РµРј color Рё storage, РµСЃР»Рё РѕРЅРё РѕС‚Р»РёС‡Р°СЋС‚СЃСЏ РѕС‚ РІР°СЂРёР°РЅС‚Р° РІ Р‘Р”
      try {
        // Р”РѕР±Р°РІР»СЏРµРј СЃР»СѓС‡Р°Р№РЅРѕРµ С‡РёСЃР»Рѕ Рё timestamp РґР»СЏ РїРѕР»РЅРѕРіРѕ РѕР±С…РѕРґР° РєРµС€Р°
        const cacheBuster = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
        let imageUrl = `/api/products/images?product=${encodeURIComponent(product.slug)}&variant=${selectedVariant.id}&_cb=${cacheBuster}`;
        
        // Р•СЃР»Рё С†РІРµС‚ РёР»Рё РїР°РјСЏС‚СЊ Р±С‹Р»Рё РёР·РјРµРЅРµРЅС‹ (РІРёСЂС‚СѓР°Р»СЊРЅС‹Р№ РІР°СЂРёР°РЅС‚), РїРµСЂРµРґР°РµРј РёС… РІ API
        // Р­С‚Рѕ РіР°СЂР°РЅС‚РёСЂСѓРµС‚, С‡С‚Рѕ Р·Р°РіСЂСѓР·СЏС‚СЃСЏ РёР·РѕР±СЂР°Р¶РµРЅРёСЏ РґР»СЏ РІС‹Р±СЂР°РЅРЅРѕРіРѕ С†РІРµС‚Р° Рё РїР°РјСЏС‚Рё
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
          const data = jsonData as { images?: unknown; mainImage?: unknown };
          
          // STRICT TYPE SAFETY IMPLEMENTATION
          const images: unknown = data.images;

          // рџ”’ Р–РЃРЎРўРљРћ РўРРџРР—РР РћР’РђРќРќРђРЇ РћР‘Р РђР‘РћРўРљРђ РР—РћР‘Р РђР–Р•РќРР™ (Р‘Р•Р— any) 
 
          const rawImages: unknown[] = Array.isArray (images) ? images : []; 
          
          // Fallback to mainImage if rawImages is empty
          if (rawImages.length === 0 && typeof data.mainImage === 'string' && data.mainImage.length > 0) {
            rawImages.push(data.mainImage);
          }
 
          const safeImages: string[] = rawImages.filter ( 
            (img): img is string  => 
              typeof img === 'string' && img.trim().length > 0 
          ); 
 
          console.log ( 
            'вњ… Loaded images for variant:' , 
            selectedVariant.id , 
            'count:' , 
            safeImages.length 
          ); 
 
          if (safeImages.length > 0 ) { 
            const cacheBuster: string = `${Date.now()}_${Math .random() 
              .toString(36 ) 
              .substring(7 )}`; 
 
            const imagesWithCacheBuster: string[] = safeImages.map ( 
              (img: string): string  => 
                img.includes('?' ) 
                  ? `${img}&_cb=${cacheBuster} ` 
                  : `${img}?_cb=${cacheBuster} ` 
            ); 
 
            setVariantImages (imagesWithCacheBuster); 
            setCurrentImageIndex(0 ); 
          } else  { 
            console.warn('вљ  No images found for variant:', selectedVariant.id ); 
            setVariantImages ([]); 
            setCurrentImageIndex(0 ); 
          }
        } else {
          console.error('вќЊ Failed to load images, status:', response.status);
          setVariantImages([]);
        }
      } catch (error) {
        console.error('вќЊ Error loading variant images:', error);
        setVariantImages([]);
      }
    };

    loadImages();
  }, [selectedVariant?.id, selectedVariant?.model, selectedVariant?.color, selectedVariant?.storage, product.slug]);

  // Р¦РµРЅР° РёР· selectedVariant СЃ СѓС‡РµС‚РѕРј priceModifier Рё СЃРєРёРґРєРё
  const basePriceWithDiscount = product.basePrice * (1 - product.discount / 100);
  const priceModifier = selectedVariant?.priceModifier || 0;
  const price = basePriceWithDiscount + priceModifier;

  // РќР°Р·РІР°РЅРёРµ РёР· selectedVariant - СѓР±РёСЂР°РµРј РґСѓР±Р»РёСЂРѕРІР°РЅРёРµ РјРѕРґРµР»РµР№ Рё "Unknown"
  const cleanBrand = product.brand && product.brand.toLowerCase() !== 'unknown' ? product.brand : '';
  
  // РћРїСЂРµРґРµР»СЏРµРј, СЏРІР»СЏРµС‚СЃСЏ Р»Рё С‚РѕРІР°СЂ iPhone (РґР»СЏ РґРѕР±Р°РІР»РµРЅРёСЏ storage РІ РЅР°Р·РІР°РЅРёРµ)
  const isIPhone = product.category.slug === 'iphone' || 
                   product.category.slug === 'smartphones' && 
                   (product.model.toLowerCase().includes('iphone') || product.brand.toLowerCase() === 'apple');
  
  const displayName = selectedVariant
    ? (() => {
        // РЈР±РёСЂР°РµРј РІСЃРµ СѓРїРѕРјРёРЅР°РЅРёСЏ Pro Max, Pro, Air, Standard РёР· РјРѕРґРµР»Рё
        let cleanModel = product.model || '';
        cleanModel = cleanModel.replace(/\s*Pro Max\s*/gi, '')
                               .replace(/\s*Pro\s*/gi, '')
                               .replace(/\s*Air\s*/gi, '')
                               .replace(/\s*Standard\s*/gi, '')
                               .trim();
        
        // Р”РѕР±Р°РІР»СЏРµРј РїСЂР°РІРёР»СЊРЅСѓСЋ СЃРµСЂРёСЋ РёР· selectedVariant
        let modelPart = '';
        if (selectedVariant.model === 'Pro Max') {
          modelPart = 'Pro Max';
        } else if (selectedVariant.model === 'Pro') {
          modelPart = 'Pro';
        } else if (selectedVariant.model === 'Air') {
          modelPart = 'Air';
        }
        // Р•СЃР»Рё Standard - РЅРµ РґРѕР±Р°РІР»СЏРµРј РЅРёС‡РµРіРѕ, РѕСЃС‚Р°РІР»СЏРµРј РїСЂРѕСЃС‚Рѕ РјРѕРґРµР»СЊ
        
        // Р”Р»СЏ РЅРµ-iPhone С‚РѕРІР°СЂРѕРІ: РїСЂРѕРІРµСЂСЏРµРј, РµСЃС‚СЊ Р»Рё С†РІРµС‚ СѓР¶Рµ РІ РЅР°Р·РІР°РЅРёРё РјРѕРґРµР»Рё
        let modelColor = '';
        if (!isIPhone && cleanModel.includes('(') && cleanModel.includes(')')) {
          // РР·РІР»РµРєР°РµРј С†РІРµС‚ РёР· СЃРєРѕР±РѕРє РІ РЅР°Р·РІР°РЅРёРё РјРѕРґРµР»Рё
          const colorMatch = cleanModel.match(/\(([^)]+)\)/);
          if (colorMatch) {
            modelColor = colorMatch[1].trim();
          }
        }
        
        // РљР РРўРР§РќРћ: Р”РѕР±Р°РІР»СЏРµРј storage С‚РѕР»СЊРєРѕ РґР»СЏ iPhone
        const storagePart = (isIPhone && selectedVariant.storage) ? ` ${selectedVariant.storage}` : '';
        
        // РљР РРўРР§РќРћ: Р”Р»СЏ РЅРµ-iPhone С‚РѕРІР°СЂРѕРІ РЅРµ РґРѕР±Р°РІР»СЏРµРј С†РІРµС‚, РµСЃР»Рё РѕРЅ СѓР¶Рµ РµСЃС‚СЊ РІ РЅР°Р·РІР°РЅРёРё РјРѕРґРµР»Рё
        // Р”Р»СЏ iPhone РІСЃРµРіРґР° РґРѕР±Р°РІР»СЏРµРј С†РІРµС‚ РёР· selectedVariant
        let colorPart = '';
        if (isIPhone && selectedVariant.color) {
          colorPart = ` (${selectedVariant.color})`;
        } else if (!isIPhone && selectedVariant.color) {
          // Р”Р»СЏ РЅРµ-iPhone: РґРѕР±Р°РІР»СЏРµРј С†РІРµС‚ С‚РѕР»СЊРєРѕ РµСЃР»Рё РµРіРѕ РЅРµС‚ РІ РЅР°Р·РІР°РЅРёРё РјРѕРґРµР»Рё
          // Р•СЃР»Рё С†РІРµС‚ СѓР¶Рµ РµСЃС‚СЊ РІ РЅР°Р·РІР°РЅРёРё, РЅРµ РґРѕР±Р°РІР»СЏРµРј РµРіРѕ РїРѕРІС‚РѕСЂРЅРѕ
          if (!modelColor || modelColor.toLowerCase() !== selectedVariant.color.toLowerCase()) {
            colorPart = ` (${selectedVariant.color})`;
          }
          // Р•СЃР»Рё С†РІРµС‚ СѓР¶Рµ РµСЃС‚СЊ РІ РЅР°Р·РІР°РЅРёРё РјРѕРґРµР»Рё, colorPart РѕСЃС‚Р°РµС‚СЃСЏ РїСѓСЃС‚С‹Рј
          // РЅРѕ С†РІРµС‚ РѕСЃС‚Р°РЅРµС‚СЃСЏ РІ cleanModel, С‚Р°Рє РєР°Рє РјС‹ РµРіРѕ РЅРµ СѓРґР°Р»СЏРµРј
        }
        
        // РЈР±РёСЂР°РµРј РґСѓР±Р»РёСЂРѕРІР°РЅРёРµ Р±СЂРµРЅРґР° РІ РЅР°Р·РІР°РЅРёРё РјРѕРґРµР»Рё (РґР»СЏ РІСЃРµС… С‚РѕРІР°СЂРѕРІ)
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
        // Р”Р»СЏ СЃР»СѓС‡Р°СЏ Р±РµР· selectedVariant С‚Р°РєР¶Рµ СѓР±РёСЂР°РµРј РґСѓР±Р»РёСЂРѕРІР°РЅРёРµ Р±СЂРµРЅРґР°
        let modelWithoutBrand = product.model || '';
        if (cleanBrand && modelWithoutBrand.toLowerCase().startsWith(cleanBrand.toLowerCase())) {
          modelWithoutBrand = modelWithoutBrand.substring(cleanBrand.length).trim();
        }
        return cleanBrand ? `${cleanBrand} ${modelWithoutBrand}`.trim() : modelWithoutBrand;
      })();

  // Р“Р»Р°РІРЅРѕРµ РёР·РѕР±СЂР°Р¶РµРЅРёРµ - РІСЃРµРіРґР° РїРµСЂРІРѕРµ РёР· РјР°СЃСЃРёРІР° РёР»Рё РїРѕ РёРЅРґРµРєСЃСѓ
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
                key={`main-${mainImage}`} // РљР РРўРР§РќРћ: РљР»СЋС‡ РЅР° РѕСЃРЅРѕРІРµ URL РґР»СЏ РїСЂРёРЅСѓРґРёС‚РµР»СЊРЅРѕРіРѕ РѕР±РЅРѕРІР»РµРЅРёСЏ РїСЂРё РёР·РјРµРЅРµРЅРёРё
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
                  {price.toFixed(2)} в‚¬
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
                  : 'Nicht verfГјgbar'}
              </Button>
            </div>

            <div className="text-sm">
              {selectedVariant.available ? (
                <span className="text-neon-green">вњ“ Auf Lager</span>
              ) : (
                <span className="text-red-400">вњ— Nicht verfГјgbar</span>
              )}
            </div>

            {/* Additional Information Blocks - С‚РѕР»СЊРєРѕ РґР»СЏ РЅРµ-iPhone С‚РѕРІР°СЂРѕРІ */}
            {!isIPhone && (
              <div className="pt-6 space-y-4 border-t border-card-border">
                {/* Р“Р°СЂР°РЅС‚РёСЏ Рё РїРѕРґРґРµСЂР¶РєР° */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">рџ›ЎпёЏ</span>
                      <h4 className="font-semibold text-white">2 Jahre Garantie</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      Offizielle Herstellergarantie inklusive
                    </p>
                  </div>

                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">рџљљ</span>
                      <h4 className="font-semibold text-white">Kostenloser Versand</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      Ab 50в‚¬ Bestellwert versandkostenfrei
                    </p>
                  </div>
                </div>

                {/* РћРїР»Р°С‚Р° Рё РІРѕР·РІСЂР°С‚ */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">рџ’і</span>
                      <h4 className="font-semibold text-white">Sichere Zahlung</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      SSL-verschlГјsselt, alle Zahlungsmethoden
                    </p>
                  </div>

                  <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">в†©пёЏ</span>
                      <h4 className="font-semibold text-white">14 Tage RГјckgabe</h4>
                    </div>
                    <p className="text-sm text-white/60">
                      Kostenlose RГјcksendung innerhalb von 14 Tagen
                    </p>
                  </div>
                </div>

                {/* Р”РѕРїРѕР»РЅРёС‚РµР»СЊРЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ */}
                <div className="bg-[#1a1a1a] border border-card-border rounded-button p-4">
                  <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                    <span>рџ“¦</span>
                    Lieferung & VerfГјgbarkeit
                  </h4>
                  <div className="space-y-2 text-sm text-white/70">
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green">вњ“</span>
                      <span>Sofort verfГјgbar - Versand innerhalb von 1-2 Werktagen</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green">вњ“</span>
                      <span>Originalverpackt vom Hersteller</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-neon-green">вњ“</span>
                      <span>Kostenloser Versand innerhalb Deutschlands</span>
                    </div>
                  </div>
                </div>

                {/* РљРѕРЅС‚Р°РєС‚РЅР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ */}
                <div className="bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] border border-neon-green/20 rounded-button p-4">
                  <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                    <span>рџ’¬</span>
                    Fragen zum Produkt?
                  </h4>
                  <p className="text-sm text-white/70 mb-3">
                    Unser Support-Team hilft Ihnen gerne weiter
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-white/60">рџ“§ support@hunslor.de</span>
                    <span className="text-white/60">рџ“ћ +49 152 567 889 30</span>
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
