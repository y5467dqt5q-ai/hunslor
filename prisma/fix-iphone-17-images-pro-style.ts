import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Путь к папкам с изображениями для 17 и 17 Air
// КРИТИЧНО: Папки находятся в "17 ейр и 17", но нужно сохранить variantPath как для Pro/Pro Max
const PATH_17_AIR = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';
const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('Исправление изображений для iPhone 17 и 17 Air (как для Pro/Pro Max)...');
  console.log('ВАЖНО: Не трогаем iPhone 17 Pro и 17 Pro Max!\n');
  
  if (!fs.existsSync(PATH_17_AIR)) {
    console.error(`❌ Папка не найдена: ${PATH_17_AIR}`);
    return;
  }

  // Функция для парсинга цвета из названия папки
  const parseColor = (folderName: string): string => {
    const colorMatch = folderName.match(/\(([^)]+)\)/);
    if (colorMatch) {
      let color = colorMatch[1].trim();
      const lowerColor = color.toLowerCase();
      
      // Нормализация цветов (как в import-products.ts)
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

  // Обрабатываем iPhone 17
  console.log('\n📱 Обработка iPhone 17...');
  const folders17 = fs.readdirSync(PATH_17_AIR, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name)
    .filter(name => {
      const lower = name.toLowerCase();
      return lower.includes('iphone') && 
             lower.includes('17') && 
             !lower.includes('pro') && 
             !lower.includes('air');
    });

  console.log(`Найдено ${folders17.length} папок для iPhone 17`);

  for (const folderName of folders17) {
    const color = parseColor(folderName);
    const memory = parseMemory(folderName);
    
    // КРИТИЧНО: Сохраняем variantPath в images JSON, как для Pro/Pro Max
    // API будет искать папку по variantPath в IMAGES_BASE_PATH
    // Но папки находятся в PATH_17_AIR, поэтому нужно скопировать или использовать правильный путь
    
    // Получаем все изображения из папки
    const folderPath = path.join(PATH_17_AIR, folderName);
    const images = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name)
      .filter(name => {
        const ext = path.extname(name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .sort();
    
    if (images.length > 0) {
      // КРИТИЧНО: Сохраняем variantPath в images JSON (как для Pro/Pro Max)
      // Но нужно проверить, есть ли папка в IMAGES_BASE_PATH
      // Если нет - API должен искать в PATH_17_AIR
      const imagesData: any = {
        variantPath: folderName, // Сохраняем название папки для API
      };
      
      // Обновляем вариант
      await prisma.productVariant.updateMany({
        where: { 
          product: { slug: 'iphone-17' },
          color: color,
          storage: memory,
        },
        data: {
          images: JSON.stringify(imagesData), // Сохраняем только variantPath, как для Pro/Pro Max
        },
      });
      
      console.log(`  ✅ Обновлен: ${color} ${memory} (${images.length} изображений, variantPath: ${folderName})`);
    }
  }

  // Обрабатываем iPhone 17 Air
  console.log('\n📱 Обработка iPhone 17 Air...');
  const folders17Air = fs.readdirSync(PATH_17_AIR, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name)
    .filter(name => {
      const lower = name.toLowerCase();
      return lower.includes('iphone') && 
             lower.includes('17') && 
             (lower.includes('air') || lower.includes('ейр'));
    });

  console.log(`Найдено ${folders17Air.length} папок для iPhone 17 Air`);

  for (const folderName of folders17Air) {
    const color = parseColor(folderName);
    const memory = parseMemory(folderName);
    
    // Получаем все изображения из папки
    const folderPath = path.join(PATH_17_AIR, folderName);
    const images = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name)
      .filter(name => {
        const ext = path.extname(name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .sort();
    
    if (images.length > 0) {
      // КРИТИЧНО: Сохраняем variantPath в images JSON (как для Pro/Pro Max)
      const imagesData: any = {
        variantPath: folderName, // Сохраняем название папки для API
      };
      
      // Обновляем вариант
      await prisma.productVariant.updateMany({
        where: { 
          product: { slug: 'iphone-17-air' },
          color: color,
          storage: memory,
        },
        data: {
          images: JSON.stringify(imagesData), // Сохраняем только variantPath, как для Pro/Pro Max
        },
      });
      
      console.log(`  ✅ Обновлен: ${color} ${memory} (${images.length} изображений, variantPath: ${folderName})`);
    }
  }

  console.log('\n✅ Готово! Изображения для iPhone 17 и 17 Air обновлены (как для Pro/Pro Max).');
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
