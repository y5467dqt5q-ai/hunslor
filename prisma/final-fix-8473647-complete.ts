import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔧 ФИНАЛЬНОЕ ИСПРАВЛЕНИЕ 8473647.webp...\n');

  // 1. Проверяем исходный файл на рабочем столе
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Файл не найден на рабочем столе: ${sourceImagePath}`);
    return;
  }

  const sourceStats = fs.statSync(sourceImagePath);
  console.log(`✅ Исходный файл найден: 8473647.webp (${sourceStats.size} байт)`);

  // 2. Находим товар
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

  // 3. Получаем variantPath
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

  // 4. Удаляем ВСЕ старые файлы и резервные копии
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name));

  console.log(`🗑️  Очистка папки...`);
  allFiles.forEach(filePath => {
    const fileName = path.basename(filePath);
    // Удаляем только файлы изображений, оставляя структуру
    if (fileName.startsWith('_') || fileName === '00_main.webp') {
      try {
        fs.unlinkSync(filePath);
        console.log(`   ✅ Удален: ${fileName}`);
      } catch (e) {}
    }
  });

  // 5. Копируем 8473647.webp как 00_main.webp (ГЛАВНАЯ)
  const mainImagePath = path.join(folderPath, '00_main.webp');
  fs.copyFileSync(sourceImagePath, mainImagePath);
  console.log(`✅ Скопирован как 00_main.webp (ГЛАВНАЯ)`);

  // 6. Копируем 8473647.webp как 8473647.webp (В ГАЛЕРЕЮ)
  const galleryImagePath = path.join(folderPath, '8473647.webp');
  fs.copyFileSync(sourceImagePath, galleryImagePath);
  console.log(`✅ Скопирован как 8473647.webp (В ГАЛЕРЕЮ)`);

  // 7. Устанавливаем время модификации на текущее
  const now = new Date();
  fs.utimesSync(mainImagePath, now, now);
  fs.utimesSync(galleryImagePath, now, now);

  // 8. ФИНАЛЬНАЯ ПРОВЕРКА
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНЫЙ СПИСОК (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const is8473647 = img === '8473647.webp' ? ' ✅ ЭТО ТА КАРТИНКА' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}${is8473647}`);
  });

  // 9. ВЕРИФИКАЦИЯ
  if (images[0] === '00_main.webp') {
    console.log(`\n✅ 00_main.webp - ГЛАВНАЯ ✓`);
  } else {
    console.log(`\n❌ ПРОБЛЕМА: Первый файл - ${images[0]}`);
  }

  if (images.includes('8473647.webp')) {
    const index = images.indexOf('8473647.webp') + 1;
    console.log(`✅ 8473647.webp - В ГАЛЕРЕЕ на позиции ${index} ✓`);
  } else {
    console.log(`\n❌ ПРОБЛЕМА: 8473647.webp не найден!`);
  }

  // 10. Проверяем размеры
  const mainStats = fs.statSync(mainImagePath);
  const galleryStats = fs.statSync(galleryImagePath);
  
  if (mainStats.size === sourceStats.size && galleryStats.size === sourceStats.size) {
    console.log(`✅ Размеры совпадают - файлы идентичны ✓`);
  }

  console.log(`\n✅ ГОТОВО! Файлы на месте и готовы к отображению.`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
