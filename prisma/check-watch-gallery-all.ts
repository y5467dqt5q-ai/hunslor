import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка всех файлов и галереи...\n');

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

  console.log(`📁 Папка: ${folderPath}\n`);

  // Получаем ВСЕ файлы в папке (включая те, которые API исключает)
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => ({
      name: file.name,
      path: path.join(folderPath, file.name),
      stats: fs.statSync(path.join(folderPath, file.name)),
    }));

  // Сортируем по алфавиту
  allFiles.sort((a, b) => a.name.localeCompare(b.name));

  // Отделяем изображения от других файлов
  const allImages = allFiles.filter(file => {
    const ext = path.extname(file.name).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  // Файлы, которые API ВКЛЮЧИТ (не начинаются с _backup_ или _)
  const apiImages = allImages.filter(img => {
    return !img.name.startsWith('_backup_') && !img.name.startsWith('_');
  });

  // Файлы, которые API ИСКЛЮЧИТ (начинаются с _backup_ или _)
  const excludedImages = allImages.filter(img => {
    return img.name.startsWith('_backup_') || img.name.startsWith('_');
  });

  console.log(`📊 ВСЕ файлы в папке (${allFiles.length} шт.):\n`);
  allFiles.forEach((file, idx) => {
    const ext = path.extname(file.name).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    const isExcluded = file.name.startsWith('_backup_') || file.name.startsWith('_');
    
    let marker = '';
    if (isImage) {
      if (isExcluded) {
        marker = ' ❌ ИСКЛЮЧЕН API (начинается с _)';
      } else if (idx === 0) {
        marker = ' ⭐ БУДЕТ ГЛАВНОЙ';
      } else {
        marker = ' ✅ В ГАЛЕРЕЕ';
      }
    }
    
    const size = isImage ? `(${(file.stats.size / 1024).toFixed(2)} KB)` : '';
    console.log(`  ${idx + 1}. ${file.name} ${size}${marker}`);
  });

  console.log(`\n📸 Изображения, которые API ВКЛЮЧИТ в галерею (${apiImages.length} шт.):\n`);
  apiImages.forEach((img, idx) => {
    const size = (img.stats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img.name} (${size} KB)${isMain}`);
  });

  if (excludedImages.length > 0) {
    console.log(`\n⚠️ Изображения, которые API ИСКЛЮЧИТ из галереи (${excludedImages.length} шт.):\n`);
    excludedImages.forEach((img, idx) => {
      const size = (img.stats.size / 1024).toFixed(2);
      console.log(`  ${idx + 1}. ${img.name} (${size} KB) - начинается с _`);
    });
  }

  console.log(`\n✅ API вернет в галерею: ${apiImages.length} изображений`);
  console.log(`   Первое (главное): ${apiImages[0]?.name || 'нет'}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
