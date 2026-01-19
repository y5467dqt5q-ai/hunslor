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
  // Определяем, какие варианты показывать в зависимости от категории
  const isIPhone = categorySlug === 'iphone' || productModel.toLowerCase().includes('iphone');
  const isPlayStation = categorySlug === 'game-consoles' || productModel.toLowerCase().includes('playstation');
  
  // Проверяем, нужно ли скрыть выбор памяти/цветов (для часов и ноутбуков)
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
                       categorySlug === 'kopfhörer' ||
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
  
  // Для ноутбуков, часов, TV, наушников, VR, консолей, Smart Home и камер скрываем выбор памяти и цветов
  // Для Dyson скрываем только память, цвета показываем
  const hideMemoryStorage = isWatch || isLaptop || isTV || isHeadphones || isVR || isConsole || isSmartHome || isCamera;
  const hideMemoryOnly = isDyson; // Только память, цвета показываем
  
  // Определяем доступные серии из вариантов
  const availableSeries = Array.from(new Set(variants.map((v: Variant) => v.model))) as ('Pro' | 'Pro Max' | 'Standard' | 'Air')[];
  const series: ('Pro' | 'Pro Max' | 'Standard' | 'Air')[] = isIPhone && availableSeries.length > 0 ? availableSeries : [];
  // Убираем дубликаты цветов (регистронезависимо)
  const colorMap = new Map<string, string>();
  variants.forEach((v: Variant) => {
    if (v.color) {
      const normalized = v.color.toLowerCase().trim();
      if (!colorMap.has(normalized)) {
        colorMap.set(normalized, v.color);
      }
    }
  });
  const colors = Array.from(colorMap.values()) as string[];
  // Для ноутбуков и часов не показываем выбор памяти
  // Берем доступные storage из вариантов, если они есть, иначе используем стандартный набор
  const availableStorages = Array.from(new Set(variants.map((v: Variant) => v.storage).filter((s): s is string => Boolean(s)))) as string[];
  const storages: ('256GB' | '512GB' | '1TB')[] = hideMemoryStorage 
    ? [] 
    : (availableStorages.length > 0 ? availableStorages as ('256GB' | '512GB' | '1TB')[] : ['256GB', '512GB', '1TB']);
  
  // Для PlayStation определяем Edition из вариантов
  const editions = isPlayStation 
    ? Array.from(new Set(variants.map((v: Variant) => {
        const sku = v.sku.toLowerCase();
        if (sku.includes('digital')) return 'Digital Edition';
        if (sku.includes('standard')) return 'Standard';
        return 'Standard';
      })))
    : [];

  // КРИТИЧНО: Определяем начальную серию из productModel, если она указана
  const getInitialSeries = (): 'Pro' | 'Pro Max' | 'Standard' | 'Air' | null => {
    if (!isIPhone || series.length === 0) return null;
    
    // Если в productModel указана серия, используем её
    const productModelLower = productModel.toLowerCase();
    if (productModelLower.includes('pro max')) {
      return 'Pro Max';
    } else if (productModelLower.includes('pro') && !productModelLower.includes('max')) {
      return 'Pro';
    } else if (productModelLower.includes('air')) {
      return 'Air';
    }
    
    // Иначе используем из selectedVariant или первую доступную
    return (selectedVariant?.model || series[0] || null) as 'Pro' | 'Pro Max' | 'Standard' | 'Air' | null;
  };

  const [selectedSeries, setSelectedSeries] = useState<'Pro' | 'Pro Max' | 'Standard' | 'Air' | null>(
    getInitialSeries()
  );
  const [selectedColor, setSelectedColor] = useState<string | null>(selectedVariant?.color || null);
  const [selectedStorage, setSelectedStorage] = useState<'256GB' | '512GB' | '1TB' | null>(
    selectedVariant?.storage || null
  );

  // Инициализируем состояние из selectedVariant и productModel
  useEffect(() => {
    // КРИТИЧНО: Синхронизируем selectedSeries с productModel
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
    
    // Инициализируем цвет и память из selectedVariant только при первой загрузке
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
    console.log('🔍 findMatchingVariant called with:', {
      selectedSeries,
      selectedColor,
      selectedStorage,
      totalVariants: variants.length,
    });

    // Используем все варианты для поиска, не фильтруем заранее
    const allVariants = variants.filter((v: Variant) => v.available);
    
    // ПРИОРИТЕТ 1: Ищем точное совпадение - серия + цвет + память
    if (isIPhone && selectedSeries && selectedColor && selectedStorage) {
      const exactMatch = allVariants.find((v: Variant) => 
        v.model === selectedSeries && 
        v.color === selectedColor && 
        v.storage === selectedStorage
      );
      if (exactMatch) {
        console.log('✅ Found exact match (series+color+storage):', exactMatch.id);
        return exactMatch;
      }
    }

    // ПРИОРИТЕТ 2: Ищем вариант с цветом И памятью (без учета серии)
    // КРИТИЧНО: при изменении памяти сохраняем цвет, при изменении цвета - память
    if (selectedColor && selectedStorage) {
      // Сначала ищем точное совпадение цвета и памяти
      const colorStorageMatch = allVariants.find((v: Variant) => 
        v.color === selectedColor && 
        v.storage === selectedStorage
      );
      if (colorStorageMatch) {
        console.log('✅ Found color+storage match:', colorStorageMatch.id, 'color:', colorStorageMatch.color, 'storage:', colorStorageMatch.storage);
        return colorStorageMatch;
      }
      
      // Если точное совпадение не найдено, ищем вариант с правильной памятью (для правильного priceModifier)
      // ПРИОРИТЕТ: память важнее для цены, чем цвет
      const storageMatch = allVariants.find((v: Variant) => v.storage === selectedStorage);
      if (storageMatch) {
        console.log('✅ Found storage match (fallback), will use selected color:', selectedColor);
        // Вариант с правильной памятью найден, цвет будет заменен в displayVariant
        return storageMatch;
      }
      
      // Если не нашли по памяти, пробуем найти вариант с выбранным цветом
      const colorMatch = allVariants.find((v: Variant) => v.color === selectedColor);
      if (colorMatch) {
        console.log('✅ Found color match (fallback), will use selected storage:', selectedStorage);
        // Вариант с правильным цветом найден, память будет заменена в displayVariant
        return colorMatch;
      }
    }


    // ПРИОРИТЕТ 3: Для iPhone - вариант с серией, цветом и памятью (если память еще не выбрана)
    if (isIPhone && selectedSeries && selectedColor && !selectedStorage) {
      const seriesColorMatch = allVariants.find((v: Variant) => 
        v.model === selectedSeries && 
        v.color === selectedColor
      );
      if (seriesColorMatch) {
        console.log('✅ Found series+color match:', seriesColorMatch.id);
        return seriesColorMatch;
      }
    }

    // ПРИОРИТЕТ 4: Для iPhone - вариант с серией и памятью (если цвет еще не выбран)
    if (isIPhone && selectedSeries && selectedStorage && !selectedColor) {
      const seriesStorageMatch = allVariants.find((v: Variant) => 
        v.model === selectedSeries && 
        v.storage === selectedStorage
      );
      if (seriesStorageMatch) {
        console.log('✅ Found series+storage match:', seriesStorageMatch.id);
        return seriesStorageMatch;
      }
    }

    // ПРИОРИТЕТ 5: Вариант с выбранным цветом (только если память не выбрана)
    // НЕ ищем по памяти отдельно, чтобы не менять цвет при выборе памяти
    if (selectedColor && !selectedStorage) {
      const colorMatch = allVariants.find((v: Variant) => v.color === selectedColor);
      if (colorMatch) {
        console.log('✅ Found color match:', colorMatch.id);
        return colorMatch;
      }
    }

    // ПРИОРИТЕТ 6: Вариант с выбранной памятью (только если цвет НЕ выбран)
    // Если цвет выбран, но вариант с color+storage не найден - НЕ меняем цвет на другой
    if (selectedStorage && !selectedColor) {
      const storageMatch = allVariants.find((v: Variant) => v.storage === selectedStorage);
      if (storageMatch) {
        console.log('✅ Found storage match (no color selected):', storageMatch.id);
        return storageMatch;
      }
    }

    // ПРИОРИТЕТ 7: Для iPhone - вариант с выбранной серией
    if (isIPhone && selectedSeries) {
      const seriesMatch = allVariants.find((v: Variant) => v.model === selectedSeries);
      if (seriesMatch) {
        console.log('✅ Found series match:', seriesMatch.id);
        return seriesMatch;
      }
    }

    // Последний вариант - любой доступный
    const result = allVariants[0] || null;
    if (result) {
      console.log('✅ Found fallback variant:', result.id);
    } else {
      console.warn('❌ No variant found at all');
    }
    return result;
  };

  useEffect(() => {
    // Пропускаем если ничего не выбрано (для iPhone нужна серия, для других - нет)
    if (isIPhone && series.length > 0 && !selectedSeries && !selectedColor && !selectedStorage) {
      return;
    }
    if (!isIPhone && !selectedColor && !selectedStorage) {
      return;
    }

    const variant = findMatchingVariant();
    if (variant) {
      // Для iPhone: если найденный вариант имеет другую серию, создаем "виртуальный" вариант
      // с правильной серией для отображения названия ТОЛЬКО если выбранная серия существует в вариантах
      // ВАЖНО: сохраняем color и storage из реального варианта
      // КРИТИЧНО: Сохраняем priceModifier из варианта
      // Используем variants для доступа к полному priceModifier
      const fullVariant = variants.find((v: Variant) => v.id === variant.id);
      interface VariantWithPriceModifier extends Variant {
        priceModifier?: number;
      }
      const fullVariantTyped = fullVariant as VariantWithPriceModifier | undefined;
      const variantTyped = variant as VariantWithPriceModifier;
      let displayVariant: Variant = {
        ...variant,
        priceModifier: fullVariantTyped?.priceModifier ?? variantTyped.priceModifier ?? 0,
      };
      if (isIPhone && selectedSeries && variant.model !== selectedSeries) {
        // Проверяем, что выбранная серия действительно существует в вариантах
        const seriesExists = variants.some((v: Variant) => v.model === selectedSeries);
        if (seriesExists) {
          // Сохраняем все поля из реального варианта, особенно color, storage и priceModifier
          // КРИТИЧНО: Используем полный вариант из variants для доступа к priceModifier
          const fullVariantForSeries = variants.find((v: Variant) => v.id === variant.id) as VariantWithPriceModifier | undefined;
          displayVariant = { 
            ...variant,
            priceModifier: fullVariantForSeries?.priceModifier ?? variantTyped.priceModifier ?? displayVariant.priceModifier ?? 0,
            model: selectedSeries as 'Pro' | 'Pro Max' | 'Standard' | 'Air'
          };
        }
      }
      
      // КРИТИЧНО: Если выбран цвет И память, но вариант с ними не найден (fallback),
      // заменяем color и storage в displayVariant на выбранные значения
      // Это позволяет выбирать любые цвета при любой памяти
      // НО: если вариант найден с правильным цветом или памятью, не меняем их
      if (selectedColor && selectedStorage) {
        // Если память в варианте не совпадает с выбранной - заменяем на выбранную
        // КРИТИЧНО: Нужно также обновить priceModifier для правильной памяти
        if (displayVariant.storage !== selectedStorage) {
          // Ищем вариант с правильной памятью для получения priceModifier
          // Используем variants (не allVariants), чтобы получить доступ к priceModifier
          const storageVariant = variants.find((v: Variant) => 
            v.available && 
            v.storage === selectedStorage &&
            (v.color === selectedColor || !selectedColor) // Предпочтительно с выбранным цветом
          ) || variants.find((v: Variant) => v.available && v.storage === selectedStorage);
          
          // Получаем priceModifier из варианта с правильной памятью
          // КРИТИЧНО: Используем полный вариант из variants для доступа к priceModifier
          // Сначала ищем вариант с правильной памятью (для получения priceModifier)
          const fullStorageVariant = storageVariant ? variants.find((v: Variant) => v.id === storageVariant.id) as VariantWithPriceModifier | undefined : null;
          const fullVariant = variants.find((v: Variant) => v.id === variant.id) as VariantWithPriceModifier | undefined;
          
          // КРИТИЧНО: Получаем priceModifier из варианта с правильной памятью (1 ТБ)
          // Используем логику: 256GB = 0, 512GB = 200, 1TB = 500
          let priceModifier = 0;
          if (selectedStorage === '1TB') {
            priceModifier = 500;
          } else if (selectedStorage === '512GB') {
            priceModifier = 200;
          } else if (selectedStorage === '256GB') {
            priceModifier = 0;
          } else {
            // Если не определили из selectedStorage, берем из варианта
            priceModifier = fullStorageVariant?.priceModifier ?? fullVariant?.priceModifier ?? variantTyped.priceModifier ?? displayVariant.priceModifier ?? 0;
          }
          
          displayVariant = {
            ...displayVariant,
            storage: selectedStorage,
            priceModifier: priceModifier, // Обновляем priceModifier для правильной памяти
          };
          console.log('✅ Using selected storage in displayVariant:', {
            selectedStorage,
            variantStorage: variant.storage,
            priceModifier: priceModifier,
            storageVariantId: storageVariant?.id,
            fullStorageVariantPriceModifier: fullStorageVariant?.priceModifier,
            calculatedPriceModifier: priceModifier,
          });
        }
        
        // Если цвет в варианте не совпадает с выбранным - заменяем на выбранный
        if (displayVariant.color !== selectedColor) {
          displayVariant = {
            ...displayVariant,
            color: selectedColor,
          };
          console.log('✅ Using selected color in displayVariant:', {
            selectedColor,
            variantColor: variant.color,
          });
        }
      }
      
      // КРИТИЧНО: Синхронизируем состояние выбора с найденным вариантом
      // Но только если это не приведет к изменению явно выбранных параметров
      // Обновляем только если пользователь явно не выбрал другой цвет/память
      
      // КРИТИЧНО: Сохраняем выбранные цвет и память в состоянии
      // Не обновляем selectedColor и selectedStorage из варианта, если они были явно выбраны пользователем
      // Это позволяет выбирать цвета, даже если точный вариант не существует
      
      // Обновляем цвет только если он не был явно выбран пользователем
      // (т.е. если selectedColor был null или совпадает с выбранным цветом)
      // НЕ обновляем, если пользователь выбрал другой цвет
      
      // Обновляем память только если она не была явно выбрана пользователем
      // (т.е. если selectedStorage был null или совпадает с выбранной памятью)
      // НЕ обновляем, если пользователь выбрал другую память
      
      console.log('🔄 Changing variant:', {
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
      
      // Обновляем вариант
      onVariantChange(displayVariant);
    } else {
      console.warn('⚠️ No matching variant found for:', {
        selectedSeries,
        selectedColor,
        selectedStorage,
        availableVariants: allVariants.length,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeries, selectedColor, selectedStorage, isIPhone]);

  const isValueAvailable = (type: 'series' | 'color' | 'storage', value: string) => {
    // Все опции всегда доступны для клика
    // Но проверяем, существует ли вариант с выбранными параметрами
    if (type === 'color' && selectedStorage) {
      // Если память выбрана, проверяем существует ли вариант с этим цветом и памятью
      const exists = variants.some((v: Variant) => 
        v.color === value && 
        v.storage === selectedStorage &&
        v.available
      );
      // Разрешаем выбор, даже если точного варианта нет - используем ближайший
      return true;
    }
    if (type === 'storage' && selectedColor) {
      // Если цвет выбран, проверяем существует ли вариант с этим цветом и памятью
      const exists = variants.some((v: Variant) => 
        v.color === selectedColor && 
        v.storage === value &&
        v.available
      );
      // Разрешаем выбор, даже если точного варианта нет - используем ближайший
      return true;
    }
    // Все опции всегда доступны для клика
    return true;
  };

  const renderSelector = (
    label: string,
    values: string[],
    selected: string | null,
    setSelected: (value: string | null) => void,
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
