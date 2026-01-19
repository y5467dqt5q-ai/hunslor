import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Путь к папкам с изображениями
const PATH_17_AIR = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';
const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('Добавление недостающих цветов (не заменяя существующие)...');
  console.log('ВАЖНО: Не трогаем iPhone 17 Pro и 17 Pro Max!\n');

  // Функция для парсинга цвета из названия папки
  const parseColor = (folderName: string): string => {
    const colorMatch = folderName.match(/\(([^)]+)\)/);
    if (colorMatch) {
      let color = colorMatch[1].trim();
      const lowerColor = color.toLowerCase();
      
      if (lowerColor.includes('blue') || lowerColor.includes('mist blue') || lowerColor.includes('sky blue') || lowerColor.includes('deep blue')) {
        return 'Blue';
      } else if (lowerColor.includes('black') || lowerColor.includes('space black')) {
        return 'Black';
      } else if (lowerColor.includes('silver') || lowerColor.includes('white') || lowerColor.includes('cloud white')) {
        return 'Silver';
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

  // Обрабатываем iPhone 17 - добавляем Black (НЕ заменяя существующие цвета!)
  console.log('\n📱 Добавление Black для iPhone 17 (без замены существующих)...');
  const iphone17 = await prisma.product.findUnique({
    where: { slug: 'iphone-17' },
  });

  if (iphone17) {
    // Проверяем, есть ли уже Black варианты
    const existingBlack = await prisma.productVariant.findMany({
      where: {
        productId: iphone17.id,
        color: 'Black',
      },
    });

    if (existingBlack.length === 0) {
      // Ищем папки с Black
      let folders: string[] = [];
      
      // Проверяем в PATH_17_AIR
      if (fs.existsSync(PATH_17_AIR)) {
        folders = fs.readdirSync(PATH_17_AIR, { withFileTypes: true })
          .filter(item => item.isDirectory())
          .map(item => item.name)
          .filter(name => {
            const lower = name.toLowerCase();
            return lower.includes('iphone') && 
                   lower.includes('17') && 
                   !lower.includes('pro') && 
                   !lower.includes('air') &&
                   (lower.includes('black') || lower.includes('space black'));
          });
      }
      
      // Если не нашли, проверяем в IMAGES_BASE_PATH
      if (folders.length === 0 && fs.existsSync(IMAGES_BASE_PATH)) {
        folders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
          .filter(item => item.isDirectory())
          .map(item => item.name)
          .filter(name => {
            const lower = name.toLowerCase();
            return lower.includes('iphone') && 
                   lower.includes('17') && 
                   !lower.includes('pro') && 
                   !lower.includes('air') &&
                   (lower.includes('black') || lower.includes('space black'));
          });
      }

      console.log(`Найдено папок с Black: ${folders.length}`);

      for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Standard', color, memory);

        if (color === 'Black') {
          // Получаем изображения из папки
          let folderPath = path.join(PATH_17_AIR, folderName);
          if (!fs.existsSync(folderPath) && fs.existsSync(IMAGES_BASE_PATH)) {
            folderPath = path.join(IMAGES_BASE_PATH, folderName);
          }
          
          if (fs.existsSync(folderPath)) {
            const images = fs.readdirSync(folderPath, { withFileTypes: true })
              .filter(file => file.isFile())
              .map(file => file.name)
              .filter(name => {
                const ext = path.extname(name).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
              })
              .sort();

            if (images.length > 0) {
              // Сохраняем variantPath в images JSON (как для Pro/Pro Max)
              const imagesData = {
                variantPath: folderName,
              };

              await prisma.productVariant.upsert({
                where: { sku },
                update: {
                  color: 'Black',
                  memory: memory,
                  storage: memory,
                  priceModifier: priceModifier,
                  images: JSON.stringify(imagesData),
                },
                create: {
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

              console.log(`  ✅ Добавлен/обновлен: Black ${memory} (${images.length} изображений, папка: ${folderName})`);
            }
          }
        }
      }
    } else {
      console.log(`  ℹ️ Black варианты уже существуют для iPhone 17 (${existingBlack.length} вариантов), пропускаем`);
    }
  }

  // Обрабатываем iPhone 17 Air - добавляем Blue (НЕ заменяя существующие цвета!)
  console.log('\n📱 Добавление Blue для iPhone 17 Air (без замены существующих)...');
  const iphone17Air = await prisma.product.findUnique({
    where: { slug: 'iphone-17-air' },
  });

  if (iphone17Air) {
    // Проверяем, есть ли уже Blue варианты
    const existingBlue = await prisma.productVariant.findMany({
      where: {
        productId: iphone17Air.id,
        color: 'Blue',
      },
    });

    if (existingBlue.length === 0) {
      // Ищем папки с Blue
      let folders: string[] = [];
      
      // Проверяем в PATH_17_AIR
      if (fs.existsSync(PATH_17_AIR)) {
        folders = fs.readdirSync(PATH_17_AIR, { withFileTypes: true })
          .filter(item => item.isDirectory())
          .map(item => item.name)
          .filter(name => {
            const lower = name.toLowerCase();
            return lower.includes('iphone') && 
                   lower.includes('17') && 
                   (lower.includes('air') || lower.includes('ейр')) &&
                   (lower.includes('blue') || lower.includes('sky blue') || lower.includes('mist blue'));
          });
      }
      
      // Если не нашли, проверяем в IMAGES_BASE_PATH
      if (folders.length === 0 && fs.existsSync(IMAGES_BASE_PATH)) {
        folders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
          .filter(item => item.isDirectory())
          .map(item => item.name)
          .filter(name => {
            const lower = name.toLowerCase();
            return lower.includes('iphone') && 
                   lower.includes('17') && 
                   (lower.includes('air') || lower.includes('ейр')) &&
                   (lower.includes('blue') || lower.includes('sky blue') || lower.includes('mist blue'));
          });
      }

      console.log(`Найдено папок с Blue: ${folders.length}`);

      for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Air', color, memory);

        if (color === 'Blue') {
          // Получаем изображения из папки
          let folderPath = path.join(PATH_17_AIR, folderName);
          if (!fs.existsSync(folderPath) && fs.existsSync(IMAGES_BASE_PATH)) {
            folderPath = path.join(IMAGES_BASE_PATH, folderName);
          }
          
          if (fs.existsSync(folderPath)) {
            const images = fs.readdirSync(folderPath, { withFileTypes: true })
              .filter(file => file.isFile())
              .map(file => file.name)
              .filter(name => {
                const ext = path.extname(name).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
              })
              .sort();

            if (images.length > 0) {
              // Сохраняем variantPath в images JSON (как для Pro/Pro Max)
              const imagesData = {
                variantPath: folderName,
              };

              await prisma.productVariant.upsert({
                where: { sku },
                update: {
                  color: 'Blue',
                  memory: memory,
                  storage: memory,
                  priceModifier: priceModifier,
                  images: JSON.stringify(imagesData),
                },
                create: {
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

              console.log(`  ✅ Добавлен/обновлен: Blue ${memory} (${images.length} изображений, папка: ${folderName})`);
            }
          }
        }
      }
    } else {
      console.log(`  ℹ️ Blue варианты уже существуют для iPhone 17 Air (${existingBlue.length} вариантов), пропускаем`);
    }
  }

  console.log('\n✅ Готово! Недостающие цвета добавлены (без замены существующих).');
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
