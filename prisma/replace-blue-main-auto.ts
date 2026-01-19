import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';
const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';

async function main() {
  console.log('🔍 Поиск нового изображения для замены заглавной фотки Blue...\n');

  // Ищем новое изображение на рабочем столе
  const possibleNames = [
    'iphone17-blue-new.jpg',
    'iphone17-blue-new.png',
    'iphone17-blue-new.webp',
    'iphone17-blue-new.jpeg',
    'blue-new.jpg',
    'blue-new.png',
    'blue-new.webp',
    'blue-new.jpeg',
    'новое-blue.jpg',
    'новое-blue.png',
    'новое-blue.webp',
    'новое-blue.jpeg',
  ];

  let newImagePath: string | null = null;
  for (const name of possibleNames) {
    const testPath = path.join(DESKTOP_PATH, name);
    if (fs.existsSync(testPath)) {
      newImagePath = testPath;
      console.log(`✅ Найдено новое изображение: ${name}`);
      break;
    }
  }

  // Если не нашли с известными именами, ищем все изображения на рабочем столе, созданные недавно
  if (!newImagePath) {
    console.log('🔍 Поиск недавно созданных изображений на рабочем столе...');
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
      console.log('📸 Недавние изображения на рабочем столе:');
      desktopFiles.forEach((file, idx) => {
        const timeAgo = Math.round((Date.now() - file.mtime.getTime()) / 1000 / 60);
        console.log(`   ${idx + 1}. ${file.name} (${timeAgo} минут назад)`);
      });
      // Используем самое недавнее изображение (если создано менее чем 30 минут назад)
      const mostRecent = desktopFiles[0];
      const timeAgoMinutes = Math.round((Date.now() - mostRecent.mtime.getTime()) / 1000 / 60);
      if (timeAgoMinutes < 30) {
        newImagePath = mostRecent.path;
        console.log(`✅ Используем самое недавнее изображение: ${mostRecent.name}`);
      }
    }
  }

  if (!newImagePath) {
    console.log('\n❌ Новое изображение не найдено на рабочем столе.');
    console.log('\n💡 Инструкция:');
    console.log('   1. Сохраните новое изображение на рабочий стол');
    console.log('   2. Или переименуйте его в одно из:');
    possibleNames.slice(0, 4).forEach(name => console.log(`      - ${name}`));
    console.log('   3. Запустите этот скрипт снова');
    return;
  }

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

  console.log(`\n✅ Найдено вариантов Blue: ${variants.length}`);

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

      // Находим текущее заглавное изображение
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

      const mainImage = images[0];
      const mainImagePath = path.join(folderPath, mainImage);

      // Определяем расширение основного изображения
      const mainExt = path.extname(mainImage);
      
      // Определяем имя нового файла с тем же расширением
      const newImageName = path.basename(mainImage);
      const newImageDestPath = path.join(folderPath, newImageName);

      // Создаем резервную копию старого изображения
      const backupPath = path.join(folderPath, `_backup_${mainImage}`);
      if (!fs.existsSync(backupPath)) {
        fs.copyFileSync(mainImagePath, backupPath);
        console.log(`📦 Создана резервная копия: ${path.basename(backupPath)}`);
      }

      // Копируем новое изображение, сохраняя расширение оригинала
      fs.copyFileSync(newImagePath, newImageDestPath);
      
      console.log(`✅ Заменено: ${variant.sku} (${variant.memory})`);
      console.log(`   Старое: ${mainImage}`);
      console.log(`   Новое: ${path.basename(newImagePath)} -> ${newImageName}`);
      console.log(`   Путь: ${folderPath}`);

    } catch (error) {
      console.error(`❌ Ошибка при замене для ${variant.sku}:`, error);
    }
  }

  console.log('\n✅ Готово! Заглавная фотка заменена.');
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
