import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Путь к папкам с изображениями
const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';
const PATH_17_AIR = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';

// Функция для получения пути к папке
function getFolderPath(folderName: string, isAir: boolean = false): string | null {
  // Сначала проверяем в pictr
  if (fs.existsSync(IMAGES_BASE_PATH)) {
    const path1 = path.join(IMAGES_BASE_PATH, folderName);
    if (fs.existsSync(path1)) {
      return path1;
    }
  }
  
  // Потом проверяем в "17 ейр и 17"
  if (fs.existsSync(PATH_17_AIR)) {
    const path2 = path.join(PATH_17_AIR, folderName);
    if (fs.existsSync(path2)) {
      return path2;
    }
  }
  
  return null;
}

async function main() {
  console.log('Добавление недостающих цветов для iPhone 17 и 17 Air...');
  console.log('ВАЖНО: Не трогаем iPhone 17 Pro и 17 Pro Max!\n');

  // Функция для парсинга цвета из названия папки
  const parseColor = (folderName: string): string => {
    const colorMatch = folderName.match(/\(([^)]+)\)/);
    if (colorMatch) {
      let color = colorMatch[1].trim();
      const lowerColor = color.toLowerCase();
      
      // Нормализация цветов
      if (lowerColor.includes('blue') || lowerColor.includes('mist blue') || lowerColor.includes('sky blue') || lowerColor.includes('deep blue')) {
        return 'Blue';
      } else if (lowerColor.includes('orange')) {
        return 'Orange';
      } else if (lowerColor.includes('silver') || lowerColor.includes('white') || lowerColor.includes('cloud white')) {
        return 'Silver';
      } else if (lowerColor.includes('black') || lowerColor.includes('space black')) {
        return 'Black';
      } else if (lowerColor.includes('lavender')) {
        return 'Lavender';
      } else if (lowerColor.includes('sage')) {
        return 'Sage';
      } else if (lowerColor.includes('light gold') || lowerColor.includes('gold')) {
        return 'Light Gold';
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

  // Функция для создания SKU
  const createSKU = (model: string, color: string, memory: string): string => {
    const modelCode = model.includes('Air') ? 'IP17AIR' : 'IP17STD';
    const colorCode = color.substring(0, 2).toUpperCase();
    const memoryCode = memory.replace('GB', '').replace('TB', 'TB');
    return `${modelCode}-${colorCode}-${memoryCode}`;
  };

  // Обрабатываем iPhone 17 - добавляем Black
  console.log('\n📱 Добавление Black для iPhone 17...');
  const iphone17 = await prisma.product.findUnique({
    where: { slug: 'iphone-17' },
  });

  if (iphone17) {
    // Проверяем, какие варианты Black уже есть
    const existingBlack = await prisma.productVariant.findMany({
      where: {
        productId: iphone17.id,
        color: 'Black',
      },
    });

    console.log(`Найдено существующих вариантов Black: ${existingBlack.length}`);

    // Ищем папки с Black - сначала в pictr, потом в "17 ейр и 17"
    let folders: string[] = [];
    if (fs.existsSync(IMAGES_BASE_PATH)) {
      folders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name)
        .filter(name => {
          const lower = name.toLowerCase();
          return lower.includes('iphone') && 
                 lower.includes('17') && 
                 !lower.includes('pro') && 
                 !lower.includes('air') &&
                 (lower.includes('black') || lower.includes('(black)'));
        });
    }
    // Если не нашли в pictr, ищем в "17 ейр и 17"
    if (folders.length === 0 && fs.existsSync(PATH_17_AIR)) {
      folders = fs.readdirSync(PATH_17_AIR, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name)
        .filter(name => {
          const lower = name.toLowerCase();
          return lower.includes('iphone') && 
                 lower.includes('17') && 
                 !lower.includes('pro') && 
                 !lower.includes('air') &&
                 (lower.includes('black') || lower.includes('(black)'));
        });
    }

    console.log(`Найдено папок с Black: ${folders.length}`);

    // Если папки не найдены, создаем варианты вручную на основе существующих
    if (folders.length === 0) {
      console.log('Папки не найдены, создаем варианты Black вручную...');
      const blackVariants = [
        { memory: '256GB' as const, priceModifier: 0 },
        { memory: '512GB' as const, priceModifier: 200 },
      ];

      for (const variantData of blackVariants) {
        const sku = createSKU('Standard', 'Black', variantData.memory);
        const existing = await prisma.productVariant.findUnique({
          where: { sku },
        });

        if (!existing) {
          // Используем variantPath из существующего варианта Black (если есть) или создаем новый
          const imagesData = {
            variantPath: `Apple iPhone 17 ${variantData.memory} (Black)`,
          };

          await prisma.productVariant.create({
            data: {
              productId: iphone17.id,
              color: 'Black',
              memory: variantData.memory,
              storage: variantData.memory,
              priceModifier: variantData.priceModifier,
              sku: sku,
              stock: 20,
              inStock: true,
              images: JSON.stringify(imagesData),
            },
          });

          console.log(`  ✅ Добавлен: Black ${variantData.memory}`);
        }
      }
    }

    for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Standard', color, memory);

        // Проверяем, существует ли уже такой вариант
        const existing = await prisma.productVariant.findUnique({
          where: { sku },
        });

      if (!existing && color === 'Black') {
        // Получаем изображения из папки
        const folderPath = getFolderPath(folderName, false);
        if (!folderPath) {
          console.log(`  ⚠️ Папка не найдена: ${folderName}`);
          continue;
        }
        const images = fs.readdirSync(folderPath, { withFileTypes: true })
          .filter(file => file.isFile())
          .map(file => file.name)
          .filter(name => {
            const ext = path.extname(name).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          })
          .sort();

        if (images.length > 0) {
          // Сохраняем variantPath в images JSON
          const imagesData = {
            variantPath: folderName,
          };

          await prisma.productVariant.create({
            data: {
              productId: iphone17.id,
              color: 'Black',
              memory: memory,
              storage: memory,
              priceModifier: priceModifier,
              sku: sku,
              stock: 20,
              inStock: true,
              images: JSON.stringify(imagesData),
            },
          });

          console.log(`  ✅ Добавлен: Black ${memory} (${images.length} изображений, папка: ${folderName})`);
        }
      }
    }
  }

  // Обрабатываем iPhone 17 Air - добавляем Blue
  console.log('\n📱 Добавление Blue для iPhone 17 Air...');
  const iphone17Air = await prisma.product.findUnique({
    where: { slug: 'iphone-17-air' },
  });

  if (iphone17Air) {
    // Проверяем, какие варианты Blue уже есть
    const existingBlue = await prisma.productVariant.findMany({
      where: {
        productId: iphone17Air.id,
        color: 'Blue',
      },
    });

    console.log(`Найдено существующих вариантов Blue: ${existingBlue.length}`);

    // Ищем папки с Blue - сначала в pictr, потом в "17 ейр и 17"
    let folders: string[] = [];
    if (fs.existsSync(IMAGES_BASE_PATH)) {
      folders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name)
        .filter(name => {
          const lower = name.toLowerCase();
          return lower.includes('iphone') && 
                 lower.includes('17') && 
                 (lower.includes('air') || lower.includes('ейр')) &&
                 (lower.includes('blue') || lower.includes('sky blue'));
        });
    }
    // Если не нашли в pictr, ищем в "17 ейр и 17"
    if (folders.length === 0 && fs.existsSync(PATH_17_AIR)) {
      folders = fs.readdirSync(PATH_17_AIR, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name)
        .filter(name => {
          const lower = name.toLowerCase();
          return lower.includes('iphone') && 
                 lower.includes('17') && 
                 (lower.includes('air') || lower.includes('ейр')) &&
                 (lower.includes('blue') || lower.includes('sky blue'));
        });
    }

    console.log(`Найдено папок с Blue: ${folders.length}`);

    // Если папки не найдены, создаем варианты Blue вручную на основе существующих
    if (folders.length === 0) {
      console.log('Папки не найдены, создаем варианты Blue вручную...');
      const blueVariants = [
        { memory: '256GB' as const, priceModifier: 0 },
        { memory: '512GB' as const, priceModifier: 200 },
        { memory: '1TB' as const, priceModifier: 500 },
      ];

      for (const variantData of blueVariants) {
        const sku = createSKU('Air', 'Blue', variantData.memory);
        const existing = await prisma.productVariant.findUnique({
          where: { sku },
        });

        if (!existing) {
          // Используем variantPath из существующего варианта Blue (если есть) или создаем новый
          const imagesData = {
            variantPath: `Apple iPhone 17 Air ${variantData.memory} (Sky Blue)`,
          };

          await prisma.productVariant.create({
            data: {
              productId: iphone17Air.id,
              color: 'Blue',
              memory: variantData.memory,
              storage: variantData.memory,
              priceModifier: variantData.priceModifier,
              sku: sku,
              stock: 20,
              inStock: true,
              images: JSON.stringify(imagesData),
            },
          });

          console.log(`  ✅ Добавлен: Blue ${variantData.memory}`);
        }
      }
    }

    for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Air', color, memory);

        // Проверяем, существует ли уже такой вариант
        const existing = await prisma.productVariant.findUnique({
          where: { sku },
        });

      if (!existing && color === 'Blue') {
        // Получаем изображения из папки
        const folderPath = getFolderPath(folderName, true);
        if (!folderPath) {
          console.log(`  ⚠️ Папка не найдена: ${folderName}`);
          continue;
        }
        const images = fs.readdirSync(folderPath, { withFileTypes: true })
          .filter(file => file.isFile())
          .map(file => file.name)
          .filter(name => {
            const ext = path.extname(name).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          })
          .sort();

        if (images.length > 0) {
          // Сохраняем variantPath в images JSON
          const imagesData = {
            variantPath: folderName,
          };

          await prisma.productVariant.create({
            data: {
              productId: iphone17Air.id,
              color: 'Blue',
              memory: memory,
              storage: memory,
              priceModifier: priceModifier,
              sku: sku,
              stock: 20,
              inStock: true,
              images: JSON.stringify(imagesData),
            },
          });

          console.log(`  ✅ Добавлен: Blue ${memory} (${images.length} изображений, папка: ${folderName})`);
        }
      }
    }
  }

  console.log('\n✅ Готово! Недостающие цвета добавлены.');
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
