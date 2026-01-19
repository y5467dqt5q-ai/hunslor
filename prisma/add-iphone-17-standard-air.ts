import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Получаем путь к папке с изображениями
const getImagesPath = () => {
  if (process.env.IMAGES_PATH) {
    return process.env.IMAGES_PATH;
  }
  return 'C:\\Users\\Вітання!\\Desktop\\pictr';
};

const IMAGES_BASE_PATH = getImagesPath();

// Путь к папкам с изображениями для 17 и 17 Air
const PATH_17 = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';

async function main() {
  console.log('Добавление iPhone 17 и iPhone 17 Air...');
  console.log('ВАЖНО: Не трогаем iPhone 17 Pro и 17 Pro Max!\n');

  // Получаем категорию iPhone
  const iphone = await prisma.category.findUnique({
    where: { slug: 'iphone' },
  });

  if (!iphone) {
    console.error('Категория iPhone не найдена!');
    return;
  }

  // Функция для парсинга цвета из названия папки
  const parseColor = (folderName: string): string => {
    const colorMatch = folderName.match(/\(([^)]+)\)/);
    if (colorMatch) {
      let color = colorMatch[1].trim();
      const lowerColor = color.toLowerCase();
      
      // Нормализация цветов
      if (lowerColor.includes('blue') || lowerColor.includes('deep blue')) {
        return 'Blue';
      } else if (lowerColor.includes('orange')) {
        return 'Orange';
      } else if (lowerColor.includes('silver') || lowerColor.includes('white')) {
        return 'Silver';
      } else if (lowerColor.includes('black') || lowerColor.includes('space')) {
        return 'Black';
      }
      
      return color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
    }
    return 'Black';
  };

  // Функция для парсинга памяти из названия папки
  const parseMemory = (folderName: string): '256GB' | '512GB' | '1TB' => {
    const match = folderName.match(/(\d+)\s*(GB|TB)/i);
    if (match) {
      const num = match[1];
      const unit = match[2].toUpperCase();
      if (unit === 'TB') {
        return '1TB';
      } else if (num === '512') {
        return '512GB';
      }
    }
    return '256GB';
  };

  // Функция для получения priceModifier по памяти
  const getPriceModifier = (memory: string): number => {
    if (memory === '1TB') return 500;
    if (memory === '512GB') return 200;
    return 0;
  };

  // Функция для создания SKU (уникальный для каждого варианта)
  const createSKU = (model: string, color: string, memory: string): string => {
    const modelCode = model.includes('Air') ? 'IP17AIR' : 'IP17STD';
    const colorCode = color.substring(0, 2).toUpperCase();
    const memoryCode = memory.replace('GB', '').replace('TB', 'TB');
    return `${modelCode}-${colorCode}-${memoryCode}`;
  };

  // Обрабатываем iPhone 17 (Standard)
  console.log('\n📱 Обработка iPhone 17 (Standard)...');
  const path17 = path.join(PATH_17);
  
  if (fs.existsSync(path17)) {
    const folders = fs.readdirSync(path17, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name)
      .filter(name => {
        const lower = name.toLowerCase();
        return lower.includes('iphone') && 
               lower.includes('17') && 
               !lower.includes('pro') && 
               !lower.includes('air');
      });

    if (folders.length > 0) {
      console.log(`Найдено ${folders.length} папок для iPhone 17`);
      
      const variants: any[] = [];
      for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Standard', color, memory);
        
        // Проверяем наличие изображений в папке
        const folderPath = path.join(path17, folderName);
        const images = fs.readdirSync(folderPath, { withFileTypes: true })
          .filter(file => file.isFile())
          .map(file => file.name)
          .filter(name => {
            const ext = path.extname(name).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          })
          .sort(); // Сортируем для консистентности
        
        if (images.length > 0) {
          // Сохраняем все изображения из папки и название папки для API
          // API будет искать папку по этому названию в IMAGES_BASE_PATH
          const imagesData = {
            images: images.map(img => `/api/images/${encodeURIComponent(folderName)}/${encodeURIComponent(img)}`),
            variantPath: folderName, // КРИТИЧНО: сохраняем название папки для API
          };
          
          variants.push({
            color,
            memory,
            priceModifier,
            sku,
            stock: 20,
            inStock: true,
            images: JSON.stringify(imagesData), // Сохраняем как JSON с variantPath
          });
          console.log(`  ✅ ${color} ${memory} (${images.length} изображений, папка: ${folderName})`);
        }
      }

      if (variants.length > 0) {
        // Проверяем, существует ли продукт
        const existingProduct = await prisma.product.findUnique({
          where: { slug: 'iphone-17' },
        });

        if (existingProduct) {
          // Если продукт существует, обновляем/создаем варианты через upsert
          for (const variant of variants) {
            await prisma.productVariant.upsert({
              where: { sku: variant.sku },
              update: variant,
              create: {
                ...variant,
                productId: existingProduct.id,
              },
            });
          }
          console.log(`✅ iPhone 17 обновлен с ${variants.length} вариантами`);
        } else {
          // Если продукт не существует, создаем его без вариантов
          const newProduct = await prisma.product.create({
            data: {
              brand: 'Apple',
              model: 'iPhone 17',
              slug: 'iphone-17',
              categoryId: iphone.id,
              baseDescription: 'Leistungsstarkes iPhone mit fortschrittlicher Kamera',
              baseImages: JSON.stringify(['/images/products/iphone-17-base.jpg']),
              basePrice: 899.00,
              discount: 20,
              featured: true,
            },
          });
          
          // Затем создаем варианты через upsert
          for (const variant of variants) {
            await prisma.productVariant.upsert({
              where: { sku: variant.sku },
              update: variant,
              create: {
                ...variant,
                productId: newProduct.id,
              },
            });
          }
          console.log(`✅ iPhone 17 создан с ${variants.length} вариантами`);
        }
      }
    }
  }

  // Обрабатываем iPhone 17 Air
  console.log('\n📱 Обработка iPhone 17 Air...');
  
  if (fs.existsSync(path17)) {
    const folders = fs.readdirSync(path17, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name)
      .filter(name => {
        const lower = name.toLowerCase();
        return lower.includes('iphone') && 
               lower.includes('17') && 
               (lower.includes('air') || lower.includes('ейр'));
      });

    if (folders.length > 0) {
      console.log(`Найдено ${folders.length} папок для iPhone 17 Air`);
      
      const variants: any[] = [];
      for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Air', color, memory);
        
        // Проверяем наличие изображений в папке
        const folderPath = path.join(path17, folderName);
        const images = fs.readdirSync(folderPath, { withFileTypes: true })
          .filter(file => file.isFile())
          .map(file => file.name)
          .filter(name => {
            const ext = path.extname(name).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          })
          .sort(); // Сортируем для консистентности
        
        if (images.length > 0) {
          // Сохраняем все изображения из папки и название папки для API
          // API будет искать папку по этому названию в IMAGES_BASE_PATH
          const imagesData = {
            images: images.map(img => `/api/images/${encodeURIComponent(folderName)}/${encodeURIComponent(img)}`),
            variantPath: folderName, // КРИТИЧНО: сохраняем название папки для API
          };
          
          variants.push({
            color,
            memory,
            priceModifier,
            sku,
            stock: 20,
            inStock: true,
            images: JSON.stringify(imagesData), // Сохраняем как JSON с variantPath
          });
          console.log(`  ✅ ${color} ${memory} (${images.length} изображений, папка: ${folderName})`);
        }
      }

      if (variants.length > 0) {
        // Проверяем, существует ли продукт
        const existingProduct = await prisma.product.findUnique({
          where: { slug: 'iphone-17-air' },
        });

        if (existingProduct) {
          // Если продукт существует, обновляем/создаем варианты через upsert
          for (const variant of variants) {
            await prisma.productVariant.upsert({
              where: { sku: variant.sku },
              update: variant,
              create: {
                ...variant,
                productId: existingProduct.id,
              },
            });
          }
          console.log(`✅ iPhone 17 Air обновлен с ${variants.length} вариантами`);
        } else {
          // Если продукт не существует, создаем его без вариантов
          const newProduct = await prisma.product.create({
            data: {
              brand: 'Apple',
              model: 'iPhone 17 Air',
              slug: 'iphone-17-air',
              categoryId: iphone.id,
              baseDescription: 'Leichtes und elegantes iPhone',
              baseImages: JSON.stringify(['/images/products/iphone-17-air-base.jpg']),
              basePrice: 799.00,
              discount: 20,
              featured: true,
            },
          });
          
          // Затем создаем варианты через upsert
          for (const variant of variants) {
            await prisma.productVariant.upsert({
              where: { sku: variant.sku },
              update: variant,
              create: {
                ...variant,
                productId: newProduct.id,
              },
            });
          }
          console.log(`✅ iPhone 17 Air создан с ${variants.length} вариантами`);
        }
      }
    }
  }

  console.log('\n✅ Готово! iPhone 17 и 17 Air добавлены.');
  console.log('⚠️ iPhone 17 Pro и 17 Pro Max НЕ ТРОНУТЫ - они работают как раньше!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
