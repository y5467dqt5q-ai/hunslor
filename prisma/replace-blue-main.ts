import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('🔄 Замена заглавной фотки Blue для iPhone 17...\n');

  // Получаем путь к новому изображению из аргументов командной строки
  const newImagePathArg = process.argv[2];

  // Если путь не указан, ищем на рабочем столе
  let newImagePath: string | null = newImagePathArg || null;

  if (!newImagePath) {
    const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
    const possibleNames = [
      'iphone17-blue-new.jpg',
      'iphone17-blue-new.png',
      'iphone17-blue-new.webp',
      'iphone17-blue-new.jpeg',
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
  }

  if (!newImagePath || !fs.existsSync(newImagePath)) {
    console.log('❌ Новое изображение не найдено.');
    console.log('\n💡 Инструкция:');
    console.log('   1. Сохраните новое изображение на рабочий стол с именем: iphone17-blue-new.jpg');
    console.log('   2. Или запустите скрипт с путем к изображению:');
    console.log('      npx tsx prisma/replace-blue-main.ts "C:\\path\\to\\image.jpg"');
    return;
  }

  console.log(`✅ Найдено новое изображение: ${newImagePath}`);

  // Находим варианты Blue для iPhone 17
  const variants = await prisma.productVariant.findMany({
    where: {
      sku: { startsWith: 'IP17STD-BLU' },
    },
  });

  if (variants.length === 0) {
    console.log('❌ Варианты Blue для iPhone 17 не найдены');
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
      }

      // Определяем расширение нового изображения
      const newExt = path.extname(newImagePath).toLowerCase();
      
      // Если расширение совпадает, заменяем файл напрямую
      if (newExt === mainExt.toLowerCase() || newExt === '.jpg' && mainExt === '.jpeg' || newExt === '.jpeg' && mainExt === '.jpg') {
        // Просто заменяем файл
        fs.copyFileSync(newImagePath, mainImagePath);
        console.log(`✅ Заменено: ${variant.sku} (${variant.memory})`);
        console.log(`   Старое: ${mainImage}`);
        console.log(`   Новое: ${path.basename(newImagePath)} -> ${mainImage}`);
        console.log(`   Папка: ${variantPath}\n`);
      } else {
        // Если расширение отличается, заменяем с новым расширением
        // Сначала удаляем старое изображение (если оно не зарезервировано)
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
