'use client';

import { useState, useEffect } from 'react';

interface Variant {
  id: string;
  model: 'Pro' | 'Pro Max' | 'Standard' | 'Air';
  color: string;
  storage: '256GB' | '512GB' | '1TB';
  price: number;
  images: string[];
  sku: string;
  available: boolean;
  priceModifier?: number;
}

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariant: Variant | null;
  onVariantChange: (variant: Variant) => void;
  productSlug: string;
  productModel: string;
  categorySlug?: string;
}

export default function VariantSelector({
  variants,
  selectedVariant,
  onVariantChange,
  productSlug,
  productModel,
  categorySlug,
}: VariantSelectorProps) {
  // ╨Ю╨┐╤А╨╡╨┤╨╡╨╗╤П╨╡╨╝, ╨║╨░╨║╨╕╨╡ ╨▓╨░╤А╨╕╨░╨╜╤В╤Л ╨┐╨╛╨║╨░╨╖╤Л╨▓╨░╤В╤М ╨▓ ╨╖╨░╨▓╨╕╤Б╨╕╨╝╨╛╤Б╤В╨╕ ╨╛╤В ╨║╨░╤В╨╡╨│╨╛╤А╨╕╨╕
  const isIPhone = categorySlug === 'iphone' || productModel.toLowerCase().includes('iphone');
  const isPlayStation = categorySlug === 'game-consoles' || productModel.toLowerCase().includes('playstation');
  
  // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝, ╨╜╤Г╨╢╨╜╨╛ ╨╗╨╕ ╤Б╨║╤А╤Л╤В╤М ╨▓╤Л╨▒╨╛╤А ╨┐╨░╨╝╤П╤В╨╕/╤Ж╨▓╨╡╤В╨╛╨▓ (╨┤╨╗╤П ╤З╨░╤Б╨╛╨▓ ╨╕ ╨╜╨╛╤Г╤В╨▒╤Г╨║╨╛╨▓)
  const isWatch = categorySlug === 'smartwatches' || 
                  categorySlug === 'watch' || 
                  categorySlug === 'smartwatch' ||
                  (categorySlug && categorySlug.toLowerCase().includes('watch')) ||
                  (productModel && productModel.toLowerCase().includes('watch'));
  
  const isLaptop = categorySlug === 'laptops' || 
                   categorySlug === 'laptop' ||
                   (categorySlug && categorySlug.toLowerCase().includes('laptop')) ||
                   (productModel && productModel.toLowerCase().includes('laptop'));
  
  const isDyson = categorySlug === 'dyson' ||
                  (productModel && productModel.toLowerCase().includes('dyson'));
  
  const isTV = categorySlug === 'tv' ||
               (productModel && productModel.toLowerCase().includes('tv')) ||
               (productModel && productModel.toLowerCase().includes('samsung') && productModel.toLowerCase().includes('qe'));
  
  const isHeadphones = categorySlug === 'headphones' ||
                       categorySlug === 'kopfh├╢rer' ||
                       (productModel && (productModel.toLowerCase().includes('airpods') || productModel.toLowerCase().includes('headphone')));
  
  const isVR = categorySlug === 'vr-headsets' ||
               categorySlug === 'vr' ||
               (productModel && (productModel.toLowerCase().includes('quest') || productModel.toLowerCase().includes('meta') || productModel.toLowerCase().includes('ray-ban')));
  
  const isConsole = categorySlug === 'game-consoles' ||
                    categorySlug === 'consoles' ||
                    categorySlug === 'console' ||
                    (productModel && (productModel.toLowerCase().includes('playstation') || 
                                     productModel.toLowerCase().includes('xbox') || 
                                     productModel.toLowerCase().includes('nintendo') ||
                                     productModel.toLowerCase().includes('switch')));
  
  const isSmartHome = categorySlug === 'smart-home' ||
                      (productModel && (productModel.toLowerCase().includes('homepod') || 
                                       productModel.toLowerCase().includes('nest') ||
                                       productModel.toLowerCase().includes('hue') ||
                                       productModel.toLowerCase().includes('smart home')));
  
  const isCamera = categorySlug === 'camera' ||
                   categorySlug === 'kamera' ||
                   (productModel && (productModel.toLowerCase().includes('gopro') || 
                                    productModel.toLowerCase().includes('osmo') ||
                                    productModel.toLowerCase().includes('insta360') ||
                                    productModel.toLowerCase().includes('canon') ||
                                    productModel.toLowerCase().includes('sony') ||
                                    productModel.toLowerCase().includes('nikon')));
  
  // ╨Ф╨╗╤П ╨╜╨╛╤Г╤В╨▒╤Г╨║╨╛╨▓, ╤З╨░╤Б╨╛╨▓, TV, ╨╜╨░╤Г╤И╨╜╨╕╨║╨╛╨▓, VR, ╨║╨╛╨╜╤Б╨╛╨╗╨╡╨╣, Smart Home ╨╕ ╨║╨░╨╝╨╡╤А ╤Б╨║╤А╤Л╨▓╨░╨╡╨╝ ╨▓╤Л╨▒╨╛╤А ╨┐╨░╨╝╤П╤В╨╕ ╨╕ ╤Ж╨▓╨╡╤В╨╛╨▓
  // ╨Ф╨╗╤П Dyson ╤Б╨║╤А╤Л╨▓╨░╨╡╨╝ ╤В╨╛╨╗╤М╨║╨╛ ╨┐╨░╨╝╤П╤В╤М, ╤Ж╨▓╨╡╤В╨░ ╨┐╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝
  const hideMemoryStorage = isWatch || isLaptop || isTV || isHeadphones || isVR || isConsole || isSmartHome || isCamera;
  const hideMemoryOnly = isDyson; // ╨в╨╛╨╗╤М╨║╨╛ ╨┐╨░╨╝╤П╤В╤М, ╤Ж╨▓╨╡╤В╨░ ╨┐╨╛╨║╨░╨╖╤Л╨▓╨░╨╡╨╝
  
  // ╨Ю╨┐╤А╨╡╨┤╨╡╨╗╤П╨╡╨╝ ╨┤╨╛╤Б╤В╤Г╨┐╨╜╤Л╨╡ ╤Б╨╡╤А╨╕╨╕ ╨╕╨╖ ╨▓╨░╤А╨╕╨░╨╜╤В╨╛╨▓
  const availableSeries = Array.from(new Set(variants.map((v: Variant) => v.model))) as ('Pro' | 'Pro Max' | 'Standard' | 'Air')[];
  const series: ('Pro' | 'Pro Max' | 'Standard' | 'Air')[] = isIPhone && availableSeries.length > 0 ? availableSeries : [];
  // ╨г╨▒╨╕╤А╨░╨╡╨╝ ╨┤╤Г╨▒╨╗╨╕╨║╨░╤В╤Л ╤Ж╨▓╨╡╤В╨╛╨▓ (╤А╨╡╨│╨╕╤Б╤В╤А╨╛╨╜╨╡╨╖╨░╨▓╨╕╤Б╨╕╨╝╨╛)
  const colorMap = new Map<string, string>();
  variants.forEach((v: Variant) => {
    if (v.color) {
      const normalized = v.color.toLowerCase().trim();
      if (!colorMap.has(normalized)) {
        colorMap.set(normalized, v.color);
      }
    }
  });
  const colors = Array.from(colorMap.values());
  // Для ноутбуков и часов не показываем выбор памяти
  // Берем доступные storage из вариантов, если они есть, иначе используем стандартный набор
  const availableStorages = Array.from(new Set(variants.map((v: Variant) => v.storage).filter((s) => typeof s === 'string'))) as ('256GB' | '512GB' | '1TB')[];
  const storages: ('256GB' | '512GB' | '1TB')[] = hideMemoryStorage 
    ? [] 
    : (availableStorages.length > 0 ? availableStorages as ('256GB' | '512GB' | '1TB')[] : ['256GB', '512GB', '1TB']);
  
  // ╨Ф╨╗╤П PlayStation ╨╛╨┐╤А╨╡╨┤╨╡╨╗╤П╨╡╨╝ Edition ╨╕╨╖ ╨▓╨░╤А╨╕╨░╨╜╤В╨╛╨▓
  const editions = isPlayStation 
    ? Array.from(new Set(variants.map((v: Variant) => {
        const sku = v.sku.toLowerCase();
        if (sku.includes('digital')) return 'Digital Edition';
        if (sku.includes('standard')) return 'Standard';
        return 'Standard';
      })))
    : [];

  // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨Ю╨┐╤А╨╡╨┤╨╡╨╗╤П╨╡╨╝ ╨╜╨░╤З╨░╨╗╤М╨╜╤Г╤О ╤Б╨╡╤А╨╕╤О ╨╕╨╖ productModel, ╨╡╤Б╨╗╨╕ ╨╛╨╜╨░ ╤Г╨║╨░╨╖╨░╨╜╨░
  const getInitialSeries = (): 'Pro' | 'Pro Max' | 'Standard' | 'Air' | null => {
    if (!isIPhone || series.length === 0) return null;
    
    // ╨Х╤Б╨╗╨╕ ╨▓ productModel ╤Г╨║╨░╨╖╨░╨╜╨░ ╤Б╨╡╤А╨╕╤П, ╨╕╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨╡╤С
    const productModelLower = productModel.toLowerCase();
    if (productModelLower.includes('pro max')) {
      return 'Pro Max';
    } else if (productModelLower.includes('pro') && !productModelLower.includes('max')) {
      return 'Pro';
    } else if (productModelLower.includes('air')) {
      return 'Air';
    }
    
    // ╨Ш╨╜╨░╤З╨╡ ╨╕╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨╕╨╖ selectedVariant ╨╕╨╗╨╕ ╨┐╨╡╤А╨▓╤Г╤О ╨┤╨╛╤Б╤В╤Г╨┐╨╜╤Г╤О
    return (selectedVariant?.model || series[0] || null) as 'Pro' | 'Pro Max' | 'Standard' | 'Air' | null;
  };

  const [selectedSeries, setSelectedSeries] = useState<'Pro' | 'Pro Max' | 'Standard' | 'Air' | null>(
    getInitialSeries()
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(selectedVariant?.color || null);
  const [selectedStorage, setSelectedStorage] = useState<'256GB' | '512GB' | '1TB' | null>(
    selectedVariant?.storage || null
  );

  // ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╤Г╨╡╨╝ ╤Б╨╛╤Б╤В╨╛╤П╨╜╨╕╨╡ ╨╕╨╖ selectedVariant ╨╕ productModel
  useEffect(() => {
    // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨б╨╕╨╜╤Е╤А╨╛╨╜╨╕╨╖╨╕╤А╤Г╨╡╨╝ selectedSeries ╤Б productModel
    if (isIPhone && series.length > 0) {
      const productModelLower = productModel.toLowerCase();
      let expectedSeries: 'Pro' | 'Pro Max' | 'Standard' | 'Air' | null = null;
      
      if (productModelLower.includes('pro max')) {
        expectedSeries = 'Pro Max';
      } else if (productModelLower.includes('pro') && !productModelLower.includes('max') && !productModelLower.includes('air')) {
        expectedSeries = 'Pro';
      } else if (productModelLower.includes('air')) {
        expectedSeries = 'Air';
      } else if (productModelLower.includes('iphone 17') && !productModelLower.includes('pro') && !productModelLower.includes('air')) {
        expectedSeries = 'Standard';
      }
      
      if (expectedSeries && expectedSeries !== selectedSeries && series.includes(expectedSeries)) {
        setSelectedSeries(expectedSeries);
      }
    }
    
    // ╨Ш╨╜╨╕╤Ж╨╕╨░╨╗╨╕╨╖╨╕╤А╤Г╨╡╨╝ ╤Ж╨▓╨╡╤В ╨╕ ╨┐╨░╨╝╤П╤В╤М ╨╕╨╖ selectedVariant ╤В╨╛╨╗╤М╨║╨╛ ╨┐╤А╨╕ ╨┐╨╡╤А╨▓╨╛╨╣ ╨╖╨░╨│╤А╤Г╨╖╨║╨╡
    if (selectedVariant) {
      if (!selectedColor && selectedVariant.color) {
        setSelectedColor(selectedVariant.color);
      }
      if (!selectedStorage && selectedVariant.storage) {
        setSelectedStorage(selectedVariant.storage);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVariant?.id, productModel]);

  const findMatchingVariant = () => {
    console.log('ЁЯФН findMatchingVariant called with:', {
      selectedSeries,
      selectedColor,
      selectedStorage,
      totalVariants: variants.length,
    });

    // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨▓╤Б╨╡ ╨▓╨░╤А╨╕╨░╨╜╤В╤Л ╨┤╨╗╤П ╨┐╨╛╨╕╤Б╨║╨░, ╨╜╨╡ ╤Д╨╕╨╗╤М╤В╤А╤Г╨╡╨╝ ╨╖╨░╤А╨░╨╜╨╡╨╡
    const allVariants = variants.filter((v: Variant) => v.available);
    
    // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в 1: ╨Ш╤Й╨╡╨╝ ╤В╨╛╤З╨╜╨╛╨╡ ╤Б╨╛╨▓╨┐╨░╨┤╨╡╨╜╨╕╨╡ - ╤Б╨╡╤А╨╕╤П + ╤Ж╨▓╨╡╤В + ╨┐╨░╨╝╤П╤В╤М
    if (isIPhone && selectedSeries && selectedColor && selectedStorage) {
      const exactMatch = allVariants.find((v: Variant) => 
        v.model === selectedSeries && 
        v.color === selectedColor && 
        v.storage === selectedStorage
      );
      if (exactMatch) {
        console.log('тЬЕ Found exact match (series+color+storage):', exactMatch.id);
        return exactMatch;
      }
    }

    // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в 2: ╨Ш╤Й╨╡╨╝ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╤Ж╨▓╨╡╤В╨╛╨╝ ╨Ш ╨┐╨░╨╝╤П╤В╤М╤О (╨▒╨╡╨╖ ╤Г╤З╨╡╤В╨░ ╤Б╨╡╤А╨╕╨╕)
    // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨┐╤А╨╕ ╨╕╨╖╨╝╨╡╨╜╨╡╨╜╨╕╨╕ ╨┐╨░╨╝╤П╤В╨╕ ╤Б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╤Ж╨▓╨╡╤В, ╨┐╤А╨╕ ╨╕╨╖╨╝╨╡╨╜╨╡╨╜╨╕╨╕ ╤Ж╨▓╨╡╤В╨░ - ╨┐╨░╨╝╤П╤В╤М
    if (selectedColor && selectedStorage) {
      // ╨б╨╜╨░╤З╨░╨╗╨░ ╨╕╤Й╨╡╨╝ ╤В╨╛╤З╨╜╨╛╨╡ ╤Б╨╛╨▓╨┐╨░╨┤╨╡╨╜╨╕╨╡ ╤Ж╨▓╨╡╤В╨░ ╨╕ ╨┐╨░╨╝╤П╤В╨╕
      const colorStorageMatch = allVariants.find((v: Variant) => 
        v.color === selectedColor && 
        v.storage === selectedStorage
      );
      if (colorStorageMatch) {
        console.log('тЬЕ Found color+storage match:', colorStorageMatch.id, 'color:', colorStorageMatch.color, 'storage:', colorStorageMatch.storage);
        return colorStorageMatch;
      }
      
      // ╨Х╤Б╨╗╨╕ ╤В╨╛╤З╨╜╨╛╨╡ ╤Б╨╛╨▓╨┐╨░╨┤╨╡╨╜╨╕╨╡ ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜╨╛, ╨╕╤Й╨╡╨╝ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О (╨┤╨╗╤П ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨│╨╛ priceModifier)
      // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в: ╨┐╨░╨╝╤П╤В╤М ╨▓╨░╨╢╨╜╨╡╨╡ ╨┤╨╗╤П ╤Ж╨╡╨╜╤Л, ╤З╨╡╨╝ ╤Ж╨▓╨╡╤В
      const storageMatch = allVariants.find((v: Variant) => v.storage === selectedStorage);
      if (storageMatch) {
        console.log('тЬЕ Found storage match (fallback), will use selected color:', selectedColor);
        // ╨Т╨░╤А╨╕╨░╨╜╤В ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О ╨╜╨░╨╣╨┤╨╡╨╜, ╤Ж╨▓╨╡╤В ╨▒╤Г╨┤╨╡╤В ╨╖╨░╨╝╨╡╨╜╨╡╨╜ ╨▓ displayVariant
        return storageMatch;
      }
      
      // ╨Х╤Б╨╗╨╕ ╨╜╨╡ ╨╜╨░╤И╨╗╨╕ ╨┐╨╛ ╨┐╨░╨╝╤П╤В╨╕, ╨┐╤А╨╛╨▒╤Г╨╡╨╝ ╨╜╨░╨╣╤В╨╕ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝
      const colorMatch = allVariants.find((v: Variant) => v.color === selectedColor);
      if (colorMatch) {
        console.log('тЬЕ Found color match (fallback), will use selected storage:', selectedStorage);
        // ╨Т╨░╤А╨╕╨░╨╜╤В ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╤Л╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝ ╨╜╨░╨╣╨┤╨╡╨╜, ╨┐╨░╨╝╤П╤В╤М ╨▒╤Г╨┤╨╡╤В ╨╖╨░╨╝╨╡╨╜╨╡╨╜╨░ ╨▓ displayVariant
        return colorMatch;
      }
    }


    // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в 3: ╨Ф╨╗╤П iPhone - ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╤Б╨╡╤А╨╕╨╡╨╣, ╤Ж╨▓╨╡╤В╨╛╨╝ ╨╕ ╨┐╨░╨╝╤П╤В╤М╤О (╨╡╤Б╨╗╨╕ ╨┐╨░╨╝╤П╤В╤М ╨╡╤Й╨╡ ╨╜╨╡ ╨▓╤Л╨▒╤А╨░╨╜╨░)
    if (isIPhone && selectedSeries && selectedColor && !selectedStorage) {
      const seriesColorMatch = allVariants.find((v: Variant) => 
        v.model === selectedSeries && 
        v.color === selectedColor
      );
      if (seriesColorMatch) {
        console.log('тЬЕ Found series+color match:', seriesColorMatch.id);
        return seriesColorMatch;
      }
    }

    // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в 4: ╨Ф╨╗╤П iPhone - ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╤Б╨╡╤А╨╕╨╡╨╣ ╨╕ ╨┐╨░╨╝╤П╤В╤М╤О (╨╡╤Б╨╗╨╕ ╤Ж╨▓╨╡╤В ╨╡╤Й╨╡ ╨╜╨╡ ╨▓╤Л╨▒╤А╨░╨╜)
    if (isIPhone && selectedSeries && selectedStorage && !selectedColor) {
      const seriesStorageMatch = allVariants.find((v: Variant) => 
        v.model === selectedSeries && 
        v.storage === selectedStorage
      );
      if (seriesStorageMatch) {
        console.log('тЬЕ Found series+storage match:', seriesStorageMatch.id);
        return seriesStorageMatch;
      }
    }

    // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в 5: ╨Т╨░╤А╨╕╨░╨╜╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝ (╤В╨╛╨╗╤М╨║╨╛ ╨╡╤Б╨╗╨╕ ╨┐╨░╨╝╤П╤В╤М ╨╜╨╡ ╨▓╤Л╨▒╤А╨░╨╜╨░)
    // ╨Э╨Х ╨╕╤Й╨╡╨╝ ╨┐╨╛ ╨┐╨░╨╝╤П╤В╨╕ ╨╛╤В╨┤╨╡╨╗╤М╨╜╨╛, ╤З╤В╨╛╨▒╤Л ╨╜╨╡ ╨╝╨╡╨╜╤П╤В╤М ╤Ж╨▓╨╡╤В ╨┐╤А╨╕ ╨▓╤Л╨▒╨╛╤А╨╡ ╨┐╨░╨╝╤П╤В╨╕
    if (selectedColor && !selectedStorage) {
      const colorMatch = allVariants.find((v: Variant) => v.color === selectedColor);
      if (colorMatch) {
        console.log('тЬЕ Found color match:', colorMatch.id);
        return colorMatch;
      }
    }

    // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в 6: ╨Т╨░╤А╨╕╨░╨╜╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О (╤В╨╛╨╗╤М╨║╨╛ ╨╡╤Б╨╗╨╕ ╤Ж╨▓╨╡╤В ╨Э╨Х ╨▓╤Л╨▒╤А╨░╨╜)
    // ╨Х╤Б╨╗╨╕ ╤Ж╨▓╨╡╤В ╨▓╤Л╨▒╤А╨░╨╜, ╨╜╨╛ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б color+storage ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜ - ╨Э╨Х ╨╝╨╡╨╜╤П╨╡╨╝ ╤Ж╨▓╨╡╤В ╨╜╨░ ╨┤╤А╤Г╨│╨╛╨╣
    if (selectedStorage && !selectedColor) {
      const storageMatch = allVariants.find((v: Variant) => v.storage === selectedStorage);
      if (storageMatch) {
        console.log('тЬЕ Found storage match (no color selected):', storageMatch.id);
        return storageMatch;
      }
    }

    // ╨Я╨а╨Ш╨Ю╨а╨Ш╨в╨Х╨в 7: ╨Ф╨╗╤П iPhone - ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╨╛╨╣ ╤Б╨╡╤А╨╕╨╡╨╣
    if (isIPhone && selectedSeries) {
      const seriesMatch = allVariants.find((v: Variant) => v.model === selectedSeries);
      if (seriesMatch) {
        console.log('тЬЕ Found series match:', seriesMatch.id);
        return seriesMatch;
      }
    }

    // ╨Я╨╛╤Б╨╗╨╡╨┤╨╜╨╕╨╣ ╨▓╨░╤А╨╕╨░╨╜╤В - ╨╗╤О╨▒╨╛╨╣ ╨┤╨╛╤Б╤В╤Г╨┐╨╜╤Л╨╣
    const result = allVariants[0] || null;
    if (result) {
      console.log('тЬЕ Found fallback variant:', result.id);
    } else {
      console.warn('тЭМ No variant found at all');
    }
    return result;
  };

  useEffect(() => {
    // ╨Я╤А╨╛╨┐╤Г╤Б╨║╨░╨╡╨╝ ╨╡╤Б╨╗╨╕ ╨╜╨╕╤З╨╡╨│╨╛ ╨╜╨╡ ╨▓╤Л╨▒╤А╨░╨╜╨╛ (╨┤╨╗╤П iPhone ╨╜╤Г╨╢╨╜╨░ ╤Б╨╡╤А╨╕╤П, ╨┤╨╗╤П ╨┤╤А╤Г╨│╨╕╤Е - ╨╜╨╡╤В)
    if (isIPhone && series.length > 0 && !selectedSeries && !selectedColor && !selectedStorage) {
      return;
    }
    if (!isIPhone && !selectedColor && !selectedStorage) {
      return;
    }

    const variant = findMatchingVariant();
    if (variant) {
      // ╨Ф╨╗╤П iPhone: ╨╡╤Б╨╗╨╕ ╨╜╨░╨╣╨┤╨╡╨╜╨╜╤Л╨╣ ╨▓╨░╤А╨╕╨░╨╜╤В ╨╕╨╝╨╡╨╡╤В ╨┤╤А╤Г╨│╤Г╤О ╤Б╨╡╤А╨╕╤О, ╤Б╨╛╨╖╨┤╨░╨╡╨╝ "╨▓╨╕╤А╤В╤Г╨░╨╗╤М╨╜╤Л╨╣" ╨▓╨░╤А╨╕╨░╨╜╤В
      // ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╤Б╨╡╤А╨╕╨╡╨╣ ╨┤╨╗╤П ╨╛╤В╨╛╨▒╤А╨░╨╢╨╡╨╜╨╕╤П ╨╜╨░╨╖╨▓╨░╨╜╨╕╤П ╨в╨Ю╨Ы╨м╨Ъ╨Ю ╨╡╤Б╨╗╨╕ ╨▓╤Л╨▒╤А╨░╨╜╨╜╨░╤П ╤Б╨╡╤А╨╕╤П ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В ╨▓ ╨▓╨░╤А╨╕╨░╨╜╤В╨░╤Е
      // ╨Т╨Р╨Ц╨Э╨Ю: ╤Б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ color ╨╕ storage ╨╕╨╖ ╤А╨╡╨░╨╗╤М╨╜╨╛╨│╨╛ ╨▓╨░╤А╨╕╨░╨╜╤В╨░
      // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ priceModifier ╨╕╨╖ ╨▓╨░╤А╨╕╨░╨╜╤В╨░
      // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ variants ╨┤╨╗╤П ╨┤╨╛╤Б╤В╤Г╨┐╨░ ╨║ ╨┐╨╛╨╗╨╜╨╛╨╝╤Г priceModifier
      const fullVariant = variants.find((v: Variant) => v.id === variant.id);
      
      let displayVariant: Variant = {
        ...variant,
        priceModifier: fullVariant?.priceModifier ?? variant.priceModifier ?? 0,
      };
      if (isIPhone && selectedSeries && variant.model !== selectedSeries) {
        // ╨Я╤А╨╛╨▓╨╡╤А╤П╨╡╨╝, ╤З╤В╨╛ ╨▓╤Л╨▒╤А╨░╨╜╨╜╨░╤П ╤Б╨╡╤А╨╕╤П ╨┤╨╡╨╣╤Б╤В╨▓╨╕╤В╨╡╨╗╤М╨╜╨╛ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В ╨▓ ╨▓╨░╤А╨╕╨░╨╜╤В╨░╤Е
        const seriesExists = variants.some((v: Variant) => v.model === selectedSeries);
        if (seriesExists) {
          // ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╨▓╤Б╨╡ ╨┐╨╛╨╗╤П ╨╕╨╖ ╤А╨╡╨░╨╗╤М╨╜╨╛╨│╨╛ ╨▓╨░╤А╨╕╨░╨╜╤В╨░, ╨╛╤Б╨╛╨▒╨╡╨╜╨╜╨╛ color, storage ╨╕ priceModifier
          // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨┐╨╛╨╗╨╜╤Л╨╣ ╨▓╨░╤А╨╕╨░╨╜╤В ╨╕╨╖ variants ╨┤╨╗╤П ╨┤╨╛╤Б╤В╤Г╨┐╨░ ╨║ priceModifier
          const fullVariantForSeries = variants.find((v: Variant) => v.id === variant.id);
          displayVariant = { 
            ...variant,
            priceModifier: fullVariantForSeries?.priceModifier ?? variant.priceModifier ?? displayVariant.priceModifier ?? 0,
            model: selectedSeries as 'Pro' | 'Pro Max' | 'Standard' | 'Air'
          };
        }
      }
      
      // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨Х╤Б╨╗╨╕ ╨▓╤Л╨▒╤А╨░╨╜ ╤Ж╨▓╨╡╤В ╨Ш ╨┐╨░╨╝╤П╤В╤М, ╨╜╨╛ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╨╜╨╕╨╝╨╕ ╨╜╨╡ ╨╜╨░╨╣╨┤╨╡╨╜ (fallback),
      // ╨╖╨░╨╝╨╡╨╜╤П╨╡╨╝ color ╨╕ storage ╨▓ displayVariant ╨╜╨░ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╡ ╨╖╨╜╨░╤З╨╡╨╜╨╕╤П
      // ╨н╤В╨╛ ╨┐╨╛╨╖╨▓╨╛╨╗╤П╨╡╤В ╨▓╤Л╨▒╨╕╤А╨░╤В╤М ╨╗╤О╨▒╤Л╨╡ ╤Ж╨▓╨╡╤В╨░ ╨┐╤А╨╕ ╨╗╤О╨▒╨╛╨╣ ╨┐╨░╨╝╤П╤В╨╕
      // ╨Э╨Ю: ╨╡╤Б╨╗╨╕ ╨▓╨░╤А╨╕╨░╨╜╤В ╨╜╨░╨╣╨┤╨╡╨╜ ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╤Л╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝ ╨╕╨╗╨╕ ╨┐╨░╨╝╤П╤В╤М╤О, ╨╜╨╡ ╨╝╨╡╨╜╤П╨╡╨╝ ╨╕╤Е
      if (selectedColor && selectedStorage) {
        // ╨Х╤Б╨╗╨╕ ╨┐╨░╨╝╤П╤В╤М ╨▓ ╨▓╨░╤А╨╕╨░╨╜╤В╨╡ ╨╜╨╡ ╤Б╨╛╨▓╨┐╨░╨┤╨░╨╡╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╨╛╨╣ - ╨╖╨░╨╝╨╡╨╜╤П╨╡╨╝ ╨╜╨░ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Г╤О
        // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨Э╤Г╨╢╨╜╨╛ ╤В╨░╨║╨╢╨╡ ╨╛╨▒╨╜╨╛╨▓╨╕╤В╤М priceModifier ╨┤╨╗╤П ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╨╕
        if (displayVariant.storage !== selectedStorage) {
          // ╨Ш╤Й╨╡╨╝ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О ╨┤╨╗╤П ╨┐╨╛╨╗╤Г╤З╨╡╨╜╨╕╤П priceModifier
          // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ variants (╨╜╨╡ allVariants), ╤З╤В╨╛╨▒╤Л ╨┐╨╛╨╗╤Г╤З╨╕╤В╤М ╨┤╨╛╤Б╤В╤Г╨┐ ╨║ priceModifier
          const storageVariant = variants.find((v: Variant) => 
            v.available && 
            v.storage === selectedStorage &&
            (v.color === selectedColor || !selectedColor) // ╨Я╤А╨╡╨┤╨┐╨╛╤З╤В╨╕╤В╨╡╨╗╤М╨╜╨╛ ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝
          ) || variants.find((v: Variant) => v.available && v.storage === selectedStorage);
          
          // ╨Я╨╛╨╗╤Г╤З╨░╨╡╨╝ priceModifier ╨╕╨╖ ╨▓╨░╤А╨╕╨░╨╜╤В╨░ ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О
          // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨┐╨╛╨╗╨╜╤Л╨╣ ╨▓╨░╤А╨╕╨░╨╜╤В ╨╕╨╖ variants ╨┤╨╗╤П ╨┤╨╛╤Б╤В╤Г╨┐╨░ ╨║ priceModifier
          // ╨б╨╜╨░╤З╨░╨╗╨░ ╨╕╤Й╨╡╨╝ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О (╨┤╨╗╤П ╨┐╨╛╨╗╤Г╤З╨╡╨╜╨╕╤П priceModifier)
          const fullStorageVariant = storageVariant ? variants.find((v: Variant) => v.id === storageVariant.id) : null;
          const fullVariant = variants.find((v: Variant) => v.id === variant.id);
          
          // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨Я╨╛╨╗╤Г╤З╨░╨╡╨╝ priceModifier ╨╕╨╖ ╨▓╨░╤А╨╕╨░╨╜╤В╨░ ╤Б ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О (1 ╨в╨С)
          // ╨Ш╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨╗╨╛╨│╨╕╨║╤Г: 256GB = 0, 512GB = 200, 1TB = 500
          let priceModifier = 0;
          if (selectedStorage === '1TB') {
            priceModifier = 500;
          } else if (selectedStorage === '512GB') {
            priceModifier = 200;
          } else if (selectedStorage === '256GB') {
            priceModifier = 0;
          } else {
            // ╨Х╤Б╨╗╨╕ ╨╜╨╡ ╨╛╨┐╤А╨╡╨┤╨╡╨╗╨╕╨╗╨╕ ╨╕╨╖ selectedStorage, ╨▒╨╡╤А╨╡╨╝ ╨╕╨╖ ╨▓╨░╤А╨╕╨░╨╜╤В╨░
            priceModifier = fullStorageVariant?.priceModifier ?? fullVariant?.priceModifier ?? variant.priceModifier ?? displayVariant.priceModifier ?? 0;
          }
          
          displayVariant = {
            ...displayVariant,
            storage: selectedStorage,
            priceModifier: priceModifier, // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ priceModifier ╨┤╨╗╤П ╨┐╤А╨░╨▓╨╕╨╗╤М╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╨╕
          };
          console.log('тЬЕ Using selected storage in displayVariant:', {
            selectedStorage,
            variantStorage: variant.storage,
            priceModifier: priceModifier,
            storageVariantId: storageVariant?.id,
            fullStorageVariantPriceModifier: fullStorageVariant?.priceModifier,
            calculatedPriceModifier: priceModifier,
          });
        }
        
        // ╨Х╤Б╨╗╨╕ ╤Ж╨▓╨╡╤В ╨▓ ╨▓╨░╤А╨╕╨░╨╜╤В╨╡ ╨╜╨╡ ╤Б╨╛╨▓╨┐╨░╨┤╨░╨╡╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝ - ╨╖╨░╨╝╨╡╨╜╤П╨╡╨╝ ╨╜╨░ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╣
        if (displayVariant.color !== selectedColor) {
          displayVariant = {
            ...displayVariant,
            color: selectedColor,
          };
          console.log('тЬЕ Using selected color in displayVariant:', {
            selectedColor,
            variantColor: variant.color,
          });
        }
      }
      
      // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨б╨╕╨╜╤Е╤А╨╛╨╜╨╕╨╖╨╕╤А╤Г╨╡╨╝ ╤Б╨╛╤Б╤В╨╛╤П╨╜╨╕╨╡ ╨▓╤Л╨▒╨╛╤А╨░ ╤Б ╨╜╨░╨╣╨┤╨╡╨╜╨╜╤Л╨╝ ╨▓╨░╤А╨╕╨░╨╜╤В╨╛╨╝
      // ╨Э╨╛ ╤В╨╛╨╗╤М╨║╨╛ ╨╡╤Б╨╗╨╕ ╤Н╤В╨╛ ╨╜╨╡ ╨┐╤А╨╕╨▓╨╡╨┤╨╡╤В ╨║ ╨╕╨╖╨╝╨╡╨╜╨╡╨╜╨╕╤О ╤П╨▓╨╜╨╛ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╤Е ╨┐╨░╤А╨░╨╝╨╡╤В╤А╨╛╨▓
      // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╤В╨╛╨╗╤М╨║╨╛ ╨╡╤Б╨╗╨╕ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╤П╨▓╨╜╨╛ ╨╜╨╡ ╨▓╤Л╨▒╤А╨░╨╗ ╨┤╤А╤Г╨│╨╛╨╣ ╤Ж╨▓╨╡╤В/╨┐╨░╨╝╤П╤В╤М
      
      // ╨Ъ╨а╨Ш╨в╨Ш╨з╨Э╨Ю: ╨б╨╛╤Е╤А╨░╨╜╤П╨╡╨╝ ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╡ ╤Ж╨▓╨╡╤В ╨╕ ╨┐╨░╨╝╤П╤В╤М ╨▓ ╤Б╨╛╤Б╤В╨╛╤П╨╜╨╕╨╕
      // ╨Э╨╡ ╨╛╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ selectedColor ╨╕ selectedStorage ╨╕╨╖ ╨▓╨░╤А╨╕╨░╨╜╤В╨░, ╨╡╤Б╨╗╨╕ ╨╛╨╜╨╕ ╨▒╤Л╨╗╨╕ ╤П╨▓╨╜╨╛ ╨▓╤Л╨▒╤А╨░╨╜╤Л ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╨╡╨╝
      // ╨н╤В╨╛ ╨┐╨╛╨╖╨▓╨╛╨╗╤П╨╡╤В ╨▓╤Л╨▒╨╕╤А╨░╤В╤М ╤Ж╨▓╨╡╤В╨░, ╨┤╨░╨╢╨╡ ╨╡╤Б╨╗╨╕ ╤В╨╛╤З╨╜╤Л╨╣ ╨▓╨░╤А╨╕╨░╨╜╤В ╨╜╨╡ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В
      
      // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╤Ж╨▓╨╡╤В ╤В╨╛╨╗╤М╨║╨╛ ╨╡╤Б╨╗╨╕ ╨╛╨╜ ╨╜╨╡ ╨▒╤Л╨╗ ╤П╨▓╨╜╨╛ ╨▓╤Л╨▒╤А╨░╨╜ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╨╡╨╝
      // (╤В.╨╡. ╨╡╤Б╨╗╨╕ selectedColor ╨▒╤Л╨╗ null ╨╕╨╗╨╕ ╤Б╨╛╨▓╨┐╨░╨┤╨░╨╡╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝)
      // ╨Э╨Х ╨╛╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝, ╨╡╤Б╨╗╨╕ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨▓╤Л╨▒╤А╨░╨╗ ╨┤╤А╤Г╨│╨╛╨╣ ╤Ж╨▓╨╡╤В
      
      // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨┐╨░╨╝╤П╤В╤М ╤В╨╛╨╗╤М╨║╨╛ ╨╡╤Б╨╗╨╕ ╨╛╨╜╨░ ╨╜╨╡ ╨▒╤Л╨╗╨░ ╤П╨▓╨╜╨╛ ╨▓╤Л╨▒╤А╨░╨╜╨░ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╨╡╨╝
      // (╤В.╨╡. ╨╡╤Б╨╗╨╕ selectedStorage ╨▒╤Л╨╗ null ╨╕╨╗╨╕ ╤Б╨╛╨▓╨┐╨░╨┤╨░╨╡╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╨╛╨╣ ╨┐╨░╨╝╤П╤В╤М╤О)
      // ╨Э╨Х ╨╛╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝, ╨╡╤Б╨╗╨╕ ╨┐╨╛╨╗╤М╨╖╨╛╨▓╨░╤В╨╡╨╗╤М ╨▓╤Л╨▒╤А╨░╨╗ ╨┤╤А╤Г╨│╤Г╤О ╨┐╨░╨╝╤П╤В╤М
      
      console.log('ЁЯФД Changing variant:', {
        from: selectedVariant?.id,
        to: variant.id,
        actualModel: variant.model,
        displayModel: displayVariant.model,
        color: variant.color,
        storage: variant.storage,
        price: variant.price,
        selectedSeries,
        selectedColor,
        selectedStorage,
      });
      
      // ╨Ю╨▒╨╜╨╛╨▓╨╗╤П╨╡╨╝ ╨▓╨░╤А╨╕╨░╨╜╤В
      onVariantChange(displayVariant);
    } else {
      console.warn('тЪая╕П No matching variant found for:', {
        selectedSeries,
        selectedColor,
        selectedStorage,
        availableVariants: allVariants.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeries, selectedColor, selectedStorage, isIPhone]);

  const isValueAvailable = (type: 'series' | 'color' | 'storage', value: string) => {
    // ╨Т╤Б╨╡ ╨╛╨┐╤Ж╨╕╨╕ ╨▓╤Б╨╡╨│╨┤╨░ ╨┤╨╛╤Б╤В╤Г╨┐╨╜╤Л ╨┤╨╗╤П ╨║╨╗╨╕╨║╨░
    // ╨Э╨╛ ╨┐╤А╨╛╨▓╨╡╤А╤П╨╡╨╝, ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В ╨╗╨╕ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╨▓╤Л╨▒╤А╨░╨╜╨╜╤Л╨╝╨╕ ╨┐╨░╤А╨░╨╝╨╡╤В╤А╨░╨╝╨╕
    if (type === 'color' && selectedStorage) {
      // ╨Х╤Б╨╗╨╕ ╨┐╨░╨╝╤П╤В╤М ╨▓╤Л╨▒╤А╨░╨╜╨░, ╨┐╤А╨╛╨▓╨╡╤А╤П╨╡╨╝ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В ╨╗╨╕ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╤Н╤В╨╕╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝ ╨╕ ╨┐╨░╨╝╤П╤В╤М╤О
      const exists = variants.some((v: Variant) => 
        v.color === value && 
        v.storage === selectedStorage &&
        v.available
      );
      // ╨а╨░╨╖╤А╨╡╤И╨░╨╡╨╝ ╨▓╤Л╨▒╨╛╤А, ╨┤╨░╨╢╨╡ ╨╡╤Б╨╗╨╕ ╤В╨╛╤З╨╜╨╛╨│╨╛ ╨▓╨░╤А╨╕╨░╨╜╤В╨░ ╨╜╨╡╤В - ╨╕╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨▒╨╗╨╕╨╢╨░╨╣╤И╨╕╨╣
      return true;
    }
    if (type === 'storage' && selectedColor) {
      // ╨Х╤Б╨╗╨╕ ╤Ж╨▓╨╡╤В ╨▓╤Л╨▒╤А╨░╨╜, ╨┐╤А╨╛╨▓╨╡╤А╤П╨╡╨╝ ╤Б╤Г╤Й╨╡╤Б╤В╨▓╤Г╨╡╤В ╨╗╨╕ ╨▓╨░╤А╨╕╨░╨╜╤В ╤Б ╤Н╤В╨╕╨╝ ╤Ж╨▓╨╡╤В╨╛╨╝ ╨╕ ╨┐╨░╨╝╤П╤В╤М╤О
      const exists = variants.some((v: Variant) => 
        v.color === selectedColor && 
        v.storage === value &&
        v.available
      );
      // ╨а╨░╨╖╤А╨╡╤И╨░╨╡╨╝ ╨▓╤Л╨▒╨╛╤А, ╨┤╨░╨╢╨╡ ╨╡╤Б╨╗╨╕ ╤В╨╛╤З╨╜╨╛╨│╨╛ ╨▓╨░╤А╨╕╨░╨╜╤В╨░ ╨╜╨╡╤В - ╨╕╤Б╨┐╨╛╨╗╤М╨╖╤Г╨╡╨╝ ╨▒╨╗╨╕╨╢╨░╨╣╤И╨╕╨╣
      return true;
    }
    // ╨Т╤Б╨╡ ╨╛╨┐╤Ж╨╕╨╕ ╨▓╤Б╨╡╨│╨┤╨░ ╨┤╨╛╤Б╤В╤Г╨┐╨╜╤Л ╨┤╨╗╤П ╨║╨╗╨╕╨║╨░
    return true;
  };

  const renderSelector = <T extends string>(
    label: string,
    values: T[],
    selected: T | null,
    setSelected: (value: T | null) => void,
    type: 'series' | 'color' | 'storage'
  ) => {
    if (values.length === 0) return null;

    return (
      <div>
        <label className="block text-sm font-medium mb-2">{label}</label>
        <div className="flex flex-wrap gap-2">
          {values.map((value: string) => {
            const isAvailable = isValueAvailable(type, value);
            const isSelected = selected === value;

            return (
              <button
                key={value}
                onClick={() => {
                  setSelected(value);
                }}
                className={`px-4 py-2 rounded-button border transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-neon'
                    : 'border-card-border text-foreground hover:border-neon-green/50 hover:bg-neon-green/5'
                }`}
              >
                {value}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {series.length > 0 && renderSelector('Serie', series, selectedSeries, setSelectedSeries, 'series')}
      {!hideMemoryStorage && colors.length > 0 && renderSelector('Farbe', colors, selectedColor, setSelectedColor, 'color')}
      {!hideMemoryOnly && storages.length > 0 && renderSelector('Speicher', storages, selectedStorage, setSelectedStorage, 'storage')}
    </div>
  );
}


