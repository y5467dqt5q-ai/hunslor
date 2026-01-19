import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Путь к папкам с изображениями
const PATH_17_AIR = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';
const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('Добавление недостающих цветов БЕЗ замены существующих...');
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
    
    // Уникальные коды цветов (чтобы Black и Blue не конфликтовали)
    let colorCode: string;
    const lowerColor = color.toLowerCase();
    if (lowerColor.includes('black')) {
      colorCode = 'BK'; // Black
    } else if (lowerColor.includes('blue')) {
      colorCode = 'BLU'; // Blue
    } else if (lowerColor.includes('silver')) {
      colorCode = 'SI';
    } else if (lowerColor.includes('lavender')) {
      colorCode = 'LA';
    } else if (lowerColor.includes('sage')) {
      colorCode = 'SA';
    } else if (lowerColor.includes('light gold') || lowerColor.includes('gold')) {
      colorCode = 'LG';
    } else {
      colorCode = color.substring(0, 2).toUpperCase();
    }
    
    const memoryCode = memory.replace('GB', '').replace('TB', 'TB');
    return `${modelCode}-${colorCode}-${memoryCode}`;
  };

  // Обрабатываем iPhone 17 - добавляем Blue (если его нет!)
  console.log('\n📱 Проверка и добавление Blue для iPhone 17...');
  const iphone17 = await prisma.product.findUnique({
    where: { slug: 'iphone-17' },
    include: { variants: true },
  });

  if (iphone17) {
    // Получаем все существующие цвета
    const existingColors = [...new Set(iphone17.variants.map(v => v.color).filter(Boolean))];
    console.log(`  Существующие цвета iPhone 17: ${existingColors.join(', ')}`);

    // Проверяем, есть ли уже Blue
    const hasBlue = existingColors.includes('Blue');
    console.log(`  Blue уже есть? ${hasBlue ? 'Да' : 'Нет'}`);

    if (!hasBlue) {
      // Ищем папки с Blue для iPhone 17 (без Air и Pro)
      let folders: string[] = [];
      
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
                   (lower.includes('blue') || lower.includes('mist blue'));
          });
      }
      
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
                   (lower.includes('blue') || lower.includes('mist blue'));
          });
      }

      console.log(`  Найдено папок с Blue для iPhone 17: ${folders.length}`);

      for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Standard', color, memory);

        if (color === 'Blue') {
          // Проверяем, не существует ли уже такой SKU (защита от дубликатов)
          const existingVariant = await prisma.productVariant.findUnique({
            where: { sku },
          });

          if (!existingVariant) {
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
                const imagesData = {
                  variantPath: folderName,
                };

                await prisma.productVariant.create({
                  data: {
                    productId: iphone17.id,
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

                console.log(`    ✅ Создан: Blue ${memory} (SKU: ${sku}, ${images.length} изображений)`);
              }
            }
          } else {
            console.log(`    ℹ️ Вариант уже существует: ${sku}`);
          }
        }
      }
    } else {
      console.log(`  ℹ️ Blue уже существует для iPhone 17, пропускаем`);
    }
  }

  // Обрабатываем iPhone 17 Air - добавляем Black (если его нет!)
  console.log('\n📱 Проверка и добавление Black для iPhone 17 Air...');
  const iphone17Air = await prisma.product.findUnique({
    where: { slug: 'iphone-17-air' },
    include: { variants: true },
  });

  if (iphone17Air) {
    // Получаем все существующие цвета
    const existingColors = [...new Set(iphone17Air.variants.map(v => v.color).filter(Boolean))];
    console.log(`  Существующие цвета iPhone 17 Air: ${existingColors.join(', ')}`);

    // Проверяем, есть ли уже Black
    const hasBlack = existingColors.includes('Black');
    console.log(`  Black уже есть? ${hasBlack ? 'Да' : 'Нет'}`);

    if (!hasBlack) {
      // Ищем папки с Black для iPhone 17 Air
      let folders: string[] = [];
      
      if (fs.existsSync(PATH_17_AIR)) {
        folders = fs.readdirSync(PATH_17_AIR, { withFileTypes: true })
          .filter(item => item.isDirectory())
          .map(item => item.name)
          .filter(name => {
            const lower = name.toLowerCase();
            return lower.includes('iphone') && 
                   lower.includes('17') && 
                   (lower.includes('air') || lower.includes('ейр')) &&
                   (lower.includes('black') || lower.includes('space black'));
          });
      }
      
      if (folders.length === 0 && fs.existsSync(IMAGES_BASE_PATH)) {
        folders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
          .filter(item => item.isDirectory())
          .map(item => item.name)
          .filter(name => {
            const lower = name.toLowerCase();
            return lower.includes('iphone') && 
                   lower.includes('17') && 
                   (lower.includes('air') || lower.includes('ейр')) &&
                   (lower.includes('black') || lower.includes('space black'));
          });
      }

      console.log(`  Найдено папок с Black для iPhone 17 Air: ${folders.length}`);

      for (const folderName of folders) {
        const color = parseColor(folderName);
        const memory = parseMemory(folderName);
        const priceModifier = getPriceModifier(memory);
        const sku = createSKU('Air', color, memory);

        if (color === 'Black') {
          // Проверяем, не существует ли уже такой SKU (защита от дубликатов)
          const existingVariant = await prisma.productVariant.findUnique({
            where: { sku },
          });

          if (!existingVariant) {
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
                const imagesData = {
                  variantPath: folderName,
                };

                await prisma.productVariant.create({
                  data: {
                    productId: iphone17Air.id,
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

                console.log(`    ✅ Создан: Black ${memory} (SKU: ${sku}, ${images.length} изображений)`);
              }
            }
          } else {
            console.log(`    ℹ️ Вариант уже существует: ${sku}`);
          }
        }
      }
    } else {
      console.log(`  ℹ️ Black уже существует для iPhone 17 Air, пропускаем`);
    }
  }

  console.log('\n✅ Готово! Проверка и добавление недостающих цветов завершено.');
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
