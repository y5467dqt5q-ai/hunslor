import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('🔄 Замена заглавной фотки Blue для iPhone 17 Air...\n');

  // Получаем путь к новому изображению из аргументов командной строки
  const newImagePathArg = process.argv[2];

  // Если путь не указан, ищем на рабочем столе
  let newImagePath: string | null = newImagePathArg || null;

  if (!newImagePath) {
    const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
    const possibleNames = [
      'iphone17air-blue-new.jpg',
      'iphone17air-blue-new.png',
      'iphone17air-blue-new.webp',
      'iphone17air-blue-new.jpeg',
      'iphone17-air-blue-new.jpg',
      'iphone17-air-blue-new.png',
      'iphone17-air-blue-new.webp',
      'iphone17-air-blue-new.jpeg',
      'blue-new.jpg',
      'blue-new.png',
      'blue-new.webp',
      'blue-new.jpeg',
    ];

    for (const name of possibleNames) {
      const testPath = path.join(DESKTOP_PATH, name);
      if (fs.existsSync(testPath)) {
        newImagePath = testPath;
        break;
      }
    }

    // Если не нашли с известными именами, ищем самое недавнее изображение (созданное менее 30 минут назад)
    if (!newImagePath) {
      console.log('🔍 Поиск недавно созданных изображений на рабочем столе...');
      try {
        const desktopFiles = fs.readdirSync(DESKTOP_PATH, { withFileTypes: true })
          .filter(item => item.isFile())
          .map(item => {
            const fullPath = path.join(DESKTOP_PATH, item.name);
            const stats = fs.statSync(fullPath);
            return { name: item.name, path: fullPath, mtime: stats.mtime };
          })
          .filter(file => {
            const ext = path.extname(file.name).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          })
          .sort((a, b) => b.mtime.getTime() - a.mtime.getTime())
          .slice(0, 3);

        if (desktopFiles.length > 0) {
          console.log('📸 Найдены изображения на рабочем столе:');
          desktopFiles.forEach((file, idx) => {
            const timeAgo = Math.round((Date.now() - file.mtime.getTime()) / 1000 / 60);
            console.log(`   ${idx + 1}. ${file.name} (${timeAgo} минут назад)`);
          });
          
          // Используем самое недавнее изображение (если создано менее 60 минут назад) или файл с именем iphone17air-blue-new
          const mostRecent = desktopFiles[0];
          const timeAgoMinutes = Math.round((Date.now() - mostRecent.mtime.getTime()) / 1000 / 60);
          
          // Ищем файл с именем iphone17air-blue-new в любом случае
          const iphone17AirBlueFile = desktopFiles.find(f => f.name.toLowerCase().includes('iphone17air-blue-new') || f.name.toLowerCase().includes('iphone17-air-blue-new'));
          
          if (iphone17AirBlueFile) {
            newImagePath = iphone17AirBlueFile.path;
            console.log(`✅ Используем изображение с правильным именем: ${iphone17AirBlueFile.name}`);
          } else if (timeAgoMinutes < 60) {
            newImagePath = mostRecent.path;
            console.log(`✅ Используем самое недавнее изображение: ${mostRecent.name}`);
          } else if (timeAgoMinutes < 1440) {
            // Если изображение создано менее 24 часов назад, используем его
            newImagePath = mostRecent.path;
            console.log(`✅ Используем изображение (создано ${timeAgoMinutes} минут назад): ${mostRecent.name}`);
          }
        }
      } catch (error) {
        // Игнорируем ошибки при чтении рабочего стола
      }
    }
  }

  if (!newImagePath || !fs.existsSync(newImagePath)) {
    console.log('❌ Новое изображение не найдено.');
    console.log('\n💡 Инструкция:');
    console.log('   1. Сохраните новое изображение на рабочий стол с именем: iphone17air-blue-new.jpg');
    console.log('   2. Или запустите скрипт с путем к изображению:');
    console.log('      npx tsx prisma/replace-blue-main-air.ts "C:\\path\\to\\image.jpg"');
    return;
  }

  console.log(`✅ Найдено новое изображение: ${newImagePath}`);

  // Находим варианты Blue для iPhone 17 Air
  const variants = await prisma.productVariant.findMany({
    where: {
      sku: { startsWith: 'IP17AIR' },
      color: 'Blue',
    },
  });

  if (variants.length === 0) {
    console.log('❌ Варианты Blue для iPhone 17 Air не найдены');
    return;
  }

  console.log(`✅ Найдено вариантов Blue: ${variants.length}\n`);

  // Заменяем заглавную фотку для каждого варианта
  for (const variant of variants) {
    try {
      // Получаем variantPath из images JSON
      let variantPath: string | null = null;
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }

      if (!variantPath) {
        console.log(`⚠️ variantPath не найден для ${variant.sku}`);
        continue;
      }

      const folderPath = path.join(IMAGES_BASE_PATH, variantPath);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ Папка не найдена: ${folderPath}`);
        continue;
      }

      // Находим текущее заглавное изображение (первое по алфавиту)
      const images = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      if (images.length === 0) {
        console.log(`⚠️ Нет изображений в папке: ${folderPath}`);
        continue;
      }

      const mainImage = images[0]; // Первое изображение - заглавная фотка
      const mainImagePath = path.join(folderPath, mainImage);

      // Сохраняем расширение оригинального файла
      const mainExt = path.extname(mainImage);
      const mainNameWithoutExt = path.basename(mainImage, mainExt);
      
      // Создаем резервную копию старого изображения
      const backupPath = path.join(folderPath, `_backup_${Date.now()}_${mainImage}`);
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(mainImagePath, backupPath);
        console.log(`📦 Создана резервная копия: ${path.basename(backupPath)}`);
      }

      // Определяем расширение нового изображения
      const newExt = path.extname(newImagePath).toLowerCase();
      
      // Если расширение совпадает, заменяем файл напрямую
      if (newExt === mainExt.toLowerCase() || 
          (newExt === '.jpg' && mainExt === '.jpeg') || 
          (newExt === '.jpeg' && mainExt === '.jpg') ||
          (newExt === '.png' && mainExt === '.webp') ||
          (newExt === '.webp' && mainExt === '.png')) {
        // Просто заменяем файл
        fs.copyFileSync(newImagePath, mainImagePath);
        console.log(`✅ Заменено: ${variant.sku} (${variant.memory})`);
        console.log(`   Старое: ${mainImage}`);
        console.log(`   Новое: ${path.basename(newImagePath)} -> ${mainImage}`);
        console.log(`   Папка: ${variantPath}\n`);
      } else {
        // Если расширение отличается, заменяем с новым расширением
        const newMainImageName = `${mainNameWithoutExt}${newExt}`;
        const newMainImagePath = path.join(folderPath, newMainImageName);
        
        // Копируем новое изображение с правильным расширением
        fs.copyFileSync(newImagePath, newMainImagePath);
        
        // Если имя файла изменилось, удаляем старое (если нужно)
        if (mainImage !== newMainImageName) {
          // Старое изображение останется как резервная копия, основным станет новое
          console.log(`✅ Заменено: ${variant.sku} (${variant.memory})`);
          console.log(`   Старое: ${mainImage} (сохранено как резервная копия)`);
          console.log(`   Новое: ${newMainImageName} (стало заглавной фоткой)`);
          console.log(`   Папка: ${variantPath}\n`);
        }
      }

    } catch (error: any) {
      console.error(`❌ Ошибка при замене для ${variant.sku}:`, error.message);
    }
  }

  console.log('✅ Готово! Заглавная фотка заменена.');
  console.log('💡 Обновите страницу сайта, чтобы увидеть изменения.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
