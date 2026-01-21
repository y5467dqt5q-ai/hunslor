import fs from 'fs';
import path from 'path';

// Получаем путь из переменной окружения или используем локальную папку
const getImagesPath = () => {
  if (process.env.IMAGES_PATH) {
    return process.env.IMAGES_PATH;
  }
  
  // Для продакшена (Railway) ищем в public/images
  if (process.env.NODE_ENV === 'production') {
    return path.join(process.cwd(), 'public', 'images');
  }

  // Используем папку pictr на рабочем столе пользователя (только локально)
  const localPath = 'C:\\Users\\Вітання!\\Desktop\\pictr';
  // Если локальной папки нет, пробуем public/images в корне проекта
  if (!fs.existsSync(localPath)) {
    return path.join(process.cwd(), 'public', 'images');
  }
  
  return localPath;
};

const IMAGES_BASE_PATH = getImagesPath();

export interface ProductImportData {
  slug: string;
  folderName: string; // Оригинальное имя папки для поиска изображений
  brand: string;
  model: string;
  categorySlug: string;
  basePrice: number;
  discount: number;
  variants: VariantImportData[];
}

export interface VariantImportData {
  color?: string;
  memory?: string;
  size?: string;
  ram?: string;
  storage?: string;
  priceModifier: number;
  stock: number;
  sku: string;
  variantPath: string; // Путь к подпапке варианта или полное название папки для iPhone 17
  images: string[]; // Список найденных изображений
}

/**
 * Парсит имя папки для извлечения информации о продукте
 * Примеры: "iPhone-17-Pro-Max", "MacBook-Pro-16", "Dyson-V15-Detect"
 */
function parseProductName(folderName: string): { brand: string; model: string } {
  // Определяем бренд по началу названия
  const brandMap: { [key: string]: string } = {
    'iphone': 'Apple',
    'ipad': 'Apple',
    'watch': 'Apple',
    'airpods': 'Apple',
    'dyson': 'Dyson',
    'ray-ban': 'Ray-Ban',
    'meta': 'Meta',
  };

  const lowerName = folderName.toLowerCase();
  let brand = '';
  let model = folderName;

  for (const [key, value] of Object.entries(brandMap)) {
    if (lowerName.startsWith(key)) {
      brand = value;
      model = folderName.replace(new RegExp(`^${key}[-_]?`, 'i'), '');
      break;
    }
  }

  // Если не нашли, пробуем определить по первой части или содержимому
  if (!brand) {
    const parts = folderName.split(/[-_]/);
    const lowerName = folderName.toLowerCase();
    
    // Проверяем содержимое всего названия, а не только первую часть
    if (lowerName.includes('sony') || lowerName.includes('playstation')) {
      brand = 'Sony';
      // Убираем "Sony" из модели
      model = folderName.replace(/sony[-_]?/i, '').replace(/playstation[-_]?/i, '');
    } else if (lowerName.includes('iphone') || lowerName.includes('ipad')) {
      brand = 'Apple';
    } else if (lowerName.includes('dyson')) {
      brand = 'Dyson';
    } else if (lowerName.includes('samsung')) {
      brand = 'Samsung';
    } else if (lowerName.includes('lg')) {
      brand = 'LG';
    } else if (lowerName.includes('meta')) {
      brand = 'Meta';
    } else if (lowerName.includes('ray') || lowerName.includes('ban')) {
      brand = 'Ray-Ban';
    } else if (parts.length > 0) {
      // Используем первую часть как бренд, если она выглядит как название бренда
      const firstPart = parts[0];
      // Проверяем, что первая часть не является общим словом
      const commonWords = ['the', 'a', 'an', 'new', 'old', 'pro', 'max', 'mini', 'slim'];
      if (!commonWords.includes(firstPart.toLowerCase()) && firstPart.length > 1) {
        brand = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
      } else if (parts.length > 1) {
        // Используем вторую часть, если первая - общее слово
        brand = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
      }
    }
  }
  
  // Если все еще не определили, используем первую часть папки (но не "Unknown")
  if (!brand || brand.toLowerCase() === 'unknown') {
    const firstPart = folderName.split(/[-_]/)[0];
    if (firstPart && firstPart.length > 0) {
      brand = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
    } else {
      brand = 'Product'; // Fallback вместо Unknown
    }
  }
  
  // Убираем бренд из модели, если он там есть
  if (model.toLowerCase().includes(brand.toLowerCase())) {
    // Экранируем спецсимволы для RegExp
    const escapedBrand = brand.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    model = model.replace(new RegExp(escapedBrand, 'gi'), '').trim();
    model = model.replace(/^[-_]+|[-_]+$/g, ''); // Убираем дефисы в начале/конце
  }

  return { brand, model: model || folderName };
}

/**
 * Определяет категорию по названию продукта
 */
function determineCategory(folderName: string): string {
  const lowerName = folderName.toLowerCase();
  
  if (lowerName.includes('iphone')) return 'iphone';
  if (lowerName.includes('ipad')) return 'ipad';
  if (lowerName.includes('macbook') || lowerName.includes('mac')) return 'mac';
  if (lowerName.includes('watch')) return 'watch';
  if (lowerName.includes('airpods')) return 'airpods';
  if (lowerName.includes('dyson')) {
    if (lowerName.includes('hair') || lowerName.includes('supersonic')) return 'dyson-hair';
    return 'dyson-home';
  }
  if (lowerName.includes('tv') || lowerName.includes('television')) return 'tvs';
  if (lowerName.includes('laptop') || lowerName.includes('notebook')) return 'laptops';
  if (lowerName.includes('headphone') || lowerName.includes('earbud')) return 'headphones';
  if (lowerName.includes('vr') || lowerName.includes('oculus')) return 'vr-headsets';
  if (lowerName.includes('console') || lowerName.includes('playstation') || lowerName.includes('xbox')) return 'game-consoles';
  if (lowerName.includes('ray-ban') || lowerName.includes('meta')) return 'ray-ban-meta';
  
  return 'smartphones'; // По умолчанию
}

/**
 * Парсит название подпапки для извлечения варианта
 * Примеры: "Orange-256GB", "Silver-512GB", "16-inch"
 */
function parseVariantName(variantFolderName: string): {
  color?: string;
  memory?: string;
  size?: string;
  ram?: string;
  storage?: string;
} {
  const result: {
    color?: string;
    memory?: string;
    size?: string;
    ram?: string;
    storage?: string;
  } = {};

  const lowerName = variantFolderName.toLowerCase();
  const parts = variantFolderName.split(/[-_]/);

  // Цвета
  const colors = ['orange', 'silver', 'blue', 'black', 'white', 'red', 'gold', 'space', 'gray', 'grey', 'titanium', 'natural'];
  for (const color of colors) {
    if (lowerName.includes(color)) {
      result.color = color.charAt(0).toUpperCase() + color.slice(1);
      break;
    }
  }

  // Память / Storage
  const memoryMatch = lowerName.match(/(\d+)(gb|tb)/i);
  if (memoryMatch) {
    const value = memoryMatch[1] + memoryMatch[2].toUpperCase();
    if (lowerName.includes('ram') || lowerName.includes('memory')) {
      result.ram = value;
    } else {
      result.memory = value;
      result.storage = value;
    }
  }

  // Размер (для экранов, ноутбуков)
  const sizeMatch = lowerName.match(/(\d+)(["']|inch|in)/i);
  if (sizeMatch) {
    result.size = sizeMatch[1] + '"';
  }

  return result;
}

/**
 * Получить все изображения из папки
 */
function getImagesFromFolder(folderPath: string): string[] {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  return files
    .filter(file => file.isFile())
    .map(file => path.basename(file.name))
    .filter(fileName => {
      const ext = path.extname(fileName).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();
}

/**
 * Группировать папки iPhone 17/17 Air/17 Pro/17 Pro Max в один продукт
 */
function groupIPhoneProducts(folders: string[]): Map<string, string[]> {
  const groups = new Map<string, string[]>();
  
  for (const folderName of folders) {
    const lowerName = folderName.toLowerCase();
    
    // Пропускаем MacBook
    if (lowerName.includes('macbook')) {
      continue;
    }
    
    // Определяем базовое имя продукта для группировки iPhone
    if (lowerName.includes('iphone') && lowerName.includes('17')) {
      let baseProductName = '';
      
      if (lowerName.includes('pro max')) {
        baseProductName = 'Apple iPhone 17 Pro Max';
      } else if (lowerName.includes('pro') && !lowerName.includes('max')) {
        baseProductName = 'Apple iPhone 17 Pro';
      } else if (lowerName.includes('air')) {
        baseProductName = 'Apple iPhone 17 Air';
      } else if (lowerName.includes('17') && !lowerName.includes('pro') && !lowerName.includes('air')) {
        baseProductName = 'Apple iPhone 17';
      }
      
      if (baseProductName) {
        if (!groups.has(baseProductName)) {
          groups.set(baseProductName, []);
        }
        groups.get(baseProductName)!.push(folderName);
      }
    }
  }
  
  return groups;
}

/**
 * Парсит название папки iPhone для извлечения варианта (память и цвет)
 * Примеры: "Apple iPhone 17 256GB (Black)" -> { memory: "256GB", color: "Black" }
 */
function parseIPhoneFolderName(folderName: string): { memory?: string; color?: string } {
  const result: { memory?: string; color?: string } = {};
  
  // Извлекаем память (256GB, 512GB, 1TB, 2TB)
  const memoryMatch = folderName.match(/(\d+)\s*(GB|TB)/i);
  if (memoryMatch) {
    result.memory = memoryMatch[1] + memoryMatch[2].toUpperCase();
  }
  
  // Извлекаем цвет из скобок (Black), (Deep Blue), и т.д.
  const colorMatch = folderName.match(/\(([^)]+)\)/);
  if (colorMatch) {
    let color = colorMatch[1].trim();
    
    // Нормализуем цвет: Deep Blue, Blue -> Blue; Titanium Blue -> Blue; и т.д.
    const lowerColor = color.toLowerCase();
    if (lowerColor.includes('blue')) {
      color = 'Blue';
    } else if (lowerColor.includes('orange')) {
      color = 'Orange';
    } else if (lowerColor.includes('silver') || lowerColor.includes('white')) {
      color = 'Silver';
    } else if (lowerColor.includes('black') || lowerColor.includes('space')) {
      color = 'Black';
    } else if (lowerColor.includes('red')) {
      color = 'Red';
    } else if (lowerColor.includes('gold')) {
      color = 'Gold';
    } else if (lowerColor.includes('titanium')) {
      color = 'Titanium';
    } else if (lowerColor.includes('natural')) {
      color = 'Natural';
    } else {
      // Если цвет не распознан, делаем первую букву заглавной
      color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    }
    
    result.color = color;
  }
  
  return result;
}

function calculatePriceModifier(storage?: string, memory?: string): number {
  const val = storage || memory;
  if (!val) return 0;
  const s = val.toLowerCase();
  if (s.includes('2tb')) return 600;
  if (s.includes('1tb')) return 400;
  if (s.includes('512gb')) return 200;
  if (s.includes('256gb')) return 100;
  return 0;
}

/**
 * Импортировать все продукты из папки
 */
export function importProductsFromFolder(): ProductImportData[] {
  if (!fs.existsSync(IMAGES_BASE_PATH)) {
    console.warn(`⚠️ Images folder not found: ${IMAGES_BASE_PATH}`);
    console.warn(`Current working directory: ${process.cwd()}`);
    return [];
  }

  console.log(`✅ Scanning images folder: ${IMAGES_BASE_PATH}`);
  const folders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  console.log(`📂 Found ${folders.length} product folders:`, folders);

  const products: ProductImportData[] = [];
  const usedSkus = new Set<string>();

  const getUniqueSku = (baseSku: string) => {
    let sku = baseSku;
    let counter = 1;
    // Add randomness to ensure uniqueness across different products/runs if needed
    // But mostly to handle duplicates within the import batch
    while (usedSkus.has(sku)) {
      sku = `${baseSku}-${counter}`;
      counter++;
    }
    usedSkus.add(sku);
    return sku;
  };

  // Группируем iPhone 17 модели
  const iphoneGroups = groupIPhoneProducts(folders);
  
  // Обрабатываем сгруппированные iPhone продукты
  for (const [baseProductName, folderNames] of iphoneGroups.entries()) {
    const variants: VariantImportData[] = [];
    let firstFolder: string | null = null;
    
    // Определяем модель из базового имени
    let modelType: 'Pro Max' | 'Pro' | 'Standard' | 'Air' = 'Standard';
    let basePrice = 799; // Default for Standard

    if (baseProductName.includes('Pro Max')) {
      modelType = 'Pro Max';
      basePrice = 1199; // 256GB base
    } else if (baseProductName.includes('Pro')) {
      modelType = 'Pro';
      basePrice = 999; // 128GB base
    } else if (baseProductName.includes('Air')) {
      modelType = 'Air';
      basePrice = 899; // Estimate
    }
    
    // Создаем slug из базового имени
    const productSlug = baseProductName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    for (const folderName of folderNames) {
      if (!firstFolder) firstFolder = folderName;
      
      const productFolder = path.join(IMAGES_BASE_PATH, folderName);
      const variantInfo = parseIPhoneFolderName(folderName);
      
      // Получаем изображения из папки
      const images = getImagesFromFolder(productFolder);
      
      if (images.length > 0) {
        // Генерируем SKU
        const memoryPart = variantInfo.memory || '128GB';
        const colorPart = variantInfo.color || 'Standard';
        
        // Use product slug in SKU to ensure uniqueness across products
        const shortSlug = productSlug.replace('apple-', '').replace('iphone-', '').toUpperCase().slice(0, 10);
        const colorCode = colorPart.replace(/\s+/g, '').toUpperCase().slice(0, 3);
        const rawSku = `${shortSlug}-${colorCode}-${memoryPart}`.replace(/[^A-Z0-9-]/g, '-');
        
        const sku = getUniqueSku(rawSku);
        
        // Calculate price modifier
        // For Pro Max, base is 256GB. For others, 128GB.
        let priceModifier = 0;
        const mem = (variantInfo.memory || '').toLowerCase();
        
        if (modelType === 'Pro Max') {
            // Base 256GB
            if (mem.includes('512gb')) priceModifier = 200;
            if (mem.includes('1tb')) priceModifier = 400;
            // 256GB is 0
        } else {
            // Base 128GB
            if (mem.includes('256gb')) priceModifier = 130;
            if (mem.includes('512gb')) priceModifier = 330;
            if (mem.includes('1tb')) priceModifier = 530;
        }

        variants.push({
          color: variantInfo.color || undefined,
          memory: variantInfo.memory || undefined,
          storage: variantInfo.memory || undefined, // memory и storage одинаковые для iPhone
          priceModifier,
          stock: 10,
          sku,
          variantPath: folderName, // Сохраняем полное название папки для поиска изображений
          images: images, // Сохраняем найденные изображения
        });
      }
    }
    
    if (variants.length > 0 && firstFolder) {
      products.push({
        slug: productSlug,
        folderName: firstFolder, // Используем первую папку как пример для поиска изображений
        brand: 'Apple',
        model: baseProductName.replace('Apple ', ''),
        categorySlug: 'iphone',
        basePrice,
        discount: 0, // No discount by default
        variants,
      });
    }
  }

  // Обрабатываем остальные продукты (не iPhone 17)
  const processedFolders = new Set(Array.from(iphoneGroups.values()).flat());
  
  for (const folderName of folders) {
    // Пропускаем уже обработанные iPhone и MacBook
    if (processedFolders.has(folderName) || folderName.toLowerCase().includes('macbook')) {
      continue;
    }
    
    const productFolder = path.join(IMAGES_BASE_PATH, folderName);
    const { brand, model } = parseProductName(folderName);
    const categorySlug = determineCategory(folderName, brand);
    
    // Получаем варианты из подпапок
    const variantFolders = fs.readdirSync(productFolder, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name);

    const variants: VariantImportData[] = [];

    // Если есть подпапки - это варианты
    if (variantFolders.length > 0) {
      for (const variantFolder of variantFolders) {
        const variantInfo = parseVariantName(variantFolder);
        const variantPath = path.join(productFolder, variantFolder);
        const images = getImagesFromFolder(variantPath);
        
        // Генерируем SKU
        const rawSku = `${folderName}-${variantFolder}`.toUpperCase().replace(/[^A-Z0-9]/g, '-');
        const sku = getUniqueSku(rawSku);

        const priceModifier = calculatePriceModifier(variantInfo.storage, variantInfo.memory);
        
        variants.push({
          ...variantInfo,
          priceModifier,
          stock: 10,
          sku,
          variantPath: variantFolder,
          images: images, // Сохраняем найденные изображения
        });
      }
    } else {
      // Если нет подпапок, создаем один вариант по умолчанию
      const images = getImagesFromFolder(productFolder);
      if (images.length > 0) {
        const rawSku = folderName.toUpperCase().replace(/[^A-Z0-9]/g, '-');
        const sku = getUniqueSku(rawSku);

        variants.push({
          priceModifier: 0,
          stock: 10,
          sku,
          variantPath: '',
          images: images, // Сохраняем найденные изображения
        });
      }
    }

    if (variants.length > 0) {
      // Определяем базовую цену (можно настроить позже)
      const basePrice = 999; // По умолчанию

      products.push({
        slug: folderName.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        folderName: folderName,
        brand,
        model,
        categorySlug,
        basePrice,
        discount: 20,
        variants,
      });
    }
  }

  return products;
}
