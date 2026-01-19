import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔄 Добавление 8473647.webp в галерею часов...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // Ищем файл на рабочем столе
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Файл не найден на рабочем столе: ${sourceImagePath}`);
    return;
  }

  console.log(`✅ Найден файл на рабочем столе: 8473647.webp`);

  // Находим товар
  const watch = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
      },
      category: {
        slug: 'smartwatches',
      },
    },
    include: {
      variants: true,
    },
  });

  if (!watch) {
    console.log('❌ Товар не найден');
    return;
  }

  // Получаем variantPath
  let variantPath: string | null = null;
  if (watch.variants.length > 0 && watch.variants[0].images) {
    try {
      const parsed = JSON.parse(watch.variants[0].images as string);
      variantPath = parsed.variantPath || null;
    } catch (e) {}
  }

  if (!variantPath) {
    variantPath = watch.folderName || null;
  }

  if (!variantPath) {
    console.log('❌ Не найден variantPath');
    return;
  }

  const folderPath = path.join(PATH_WATCHES, variantPath);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  console.log(`✅ Папка найдена: ${folderPath}\n`);

  // Проверяем, есть ли уже файл 8473647.webp в папке
  const existingFile = path.join(folderPath, '8473647.webp');
  if (fs.existsSync(existingFile)) {
    console.log(`⚠️  Файл 8473647.webp уже существует в папке, пропускаем копирование`);
  } else {
    // Копируем файл с рабочего стола в папку товара
    fs.copyFileSync(sourceImagePath, existingFile);
    console.log(`✅ Скопирован файл: 8473647.webp -> ${folderPath}\\8473647.webp`);
  }

  // Проверяем текущие файлы в папке
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Изображения в папке после добавления (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const filePath = path.join(folderPath, img);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}`);
  });

  // Проверяем, что 00_main.webp все еще первый
  if (images[0] === '00_main.webp') {
    console.log(`\n✅ 00_main.webp остается главной (первой)`);
  }

  // Проверяем, что 8473647.webp добавлен
  if (images.includes('8473647.webp')) {
    const index = images.indexOf('8473647.webp') + 1;
    console.log(`✅ 8473647.webp добавлен в галерею на позиции ${index}`);
  } else {
    console.log(`\n⚠️  8473647.webp не найден в списке изображений`);
  }

  console.log(`\n✅ Готово! Файл добавлен в галерею.`);
  console.log('💡 Обновите страницу с Ctrl+F5 (без кеша), чтобы увидеть изменения.');
  console.log('⚠️ iPhone НЕ ТРОНУТЫ - они работают как раньше!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
