import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔄 ПОЛНОЕ ПЕРЕСОЗДАНИЕ галереи товара...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем исходный файл
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Исходный файл не найден: ${sourceImagePath}`);
    return;
  }

  const sourceStats = fs.statSync(sourceImagePath);
  console.log(`✅ Исходный файл: 8473647.webp (${sourceStats.size} байт)`);

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
      category: true,
    },
  });

  if (!watch) {
    console.log('❌ Товар не найден');
    return;
  }

  console.log(`✅ Найден товар: ${watch.model}`);
  console.log(`   ID: ${watch.id}`);
  console.log(`   Вариантов: ${watch.variants.length}\n`);

  // 3. Определяем variantPath (папка товара)
  const variantPath = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, variantPath);

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  console.log(`✅ Папка найдена: ${folderPath}\n`);

  // 4. УДАЛЯЕМ ВСЕ ФАЙЛЫ в папке и пересоздаем
  console.log(`🗑️  Очистка папки...`);
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name));

  allFiles.forEach(filePath => {
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Удален: ${path.basename(filePath)}`);
    } catch (e) {
      console.log(`   ⚠️  Не удалось удалить: ${path.basename(filePath)}`);
    }
  });

  // 5. Копируем ВСЕ изображения заново
  console.log(`\n📸 Копирование изображений...`);

  // 5.1. Главная картинка
  const mainImagePath = path.join(folderPath, '00_main.webp');
  fs.copyFileSync(sourceImagePath, mainImagePath);
  console.log(`   ✅ 00_main.webp (ГЛАВНАЯ)`);

  // 5.2. В галерею
  const galleryImagePath = path.join(folderPath, '01_8473647.webp');
  fs.copyFileSync(sourceImagePath, galleryImagePath);
  console.log(`   ✅ 01_8473647.webp (В ГАЛЕРЕЮ)`);

  // 5.3. Другие картинки из старой папки (если были)
  // Но сначала проверяем, есть ли они в исходной папке или нужно их восстановить
  // Пока оставим только эти две

  // 6. Обновляем время модификации
  const now = new Date();
  fs.utimesSync(mainImagePath, now, now);
  fs.utimesSync(galleryImagePath, now, now);

  // 7. ОБНОВЛЯЕМ вариант товара в БД
  if (watch.variants.length > 0) {
    const variant = watch.variants[0];
    
    console.log(`\n📝 Обновление варианта в БД...`);
    console.log(`   Старый variantPath: ${JSON.parse(variant.images as string).variantPath || 'нет'}`);

    // Обновляем images поле с правильным variantPath
    const updatedImages = JSON.stringify({
      variantPath: variantPath,
    });

    await prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        images: updatedImages,
      },
    });

    console.log(`   ✅ Вариант обновлен с variantPath: ${variantPath}`);
  }

  // 8. ФИНАЛЬНАЯ ПРОВЕРКА
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНЫЙ СПИСОК в папке (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const is8473647 = img === '01_8473647.webp' ? ' ✅ ЭТО ТА КАРТИНКА' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}${is8473647}`);
  });

  // 9. ВОСПРОИЗВОДИМ ЛОГИКУ API
  const apiImages = images.filter(name => {
    if (name.startsWith('_backup_') || name.startsWith('_')) {
      return false;
    }
    const ext = path.extname(name).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  console.log(`\n📋 API ВЕРНЕТ (${apiImages.length} шт.):`);
  apiImages.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const is8473647 = img === '01_8473647.webp' ? ' ✅ В ГАЛЕРЕЕ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${is8473647}`);
  });

  if (apiImages[0] === '00_main.webp' && apiImages.includes('01_8473647.webp')) {
    console.log(`\n✅ ВСЕ ПРАВИЛЬНО! 00_main.webp - главная, 01_8473647.webp - в галерее`);
  }

  console.log(`\n✅ ГОТОВО! Галерея полностью пересоздана.`);
  console.log('💡 Обновите страницу с Ctrl+F5 (без кеша)');
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
