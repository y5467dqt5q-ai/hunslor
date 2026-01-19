import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

function getFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(fileBuffer).digest('hex');
}

async function main() {
  console.log('🔍 ГЛУБОКАЯ ПРОВЕРКА изображений...\n');

  // 1. Проверяем исходный файл на рабочем столе
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Исходный файл не найден: ${sourceImagePath}`);
    return;
  }

  const sourceStats = fs.statSync(sourceImagePath);
  const sourceHash = getFileHash(sourceImagePath);
  console.log(`✅ Исходный файл: 8473647.webp`);
  console.log(`   Размер: ${sourceStats.size} байт`);
  console.log(`   MD5: ${sourceHash.substring(0, 16)}...`);

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

  console.log(`\n✅ Папка: ${folderPath}\n`);

  // 4. Проверяем ВСЕ файлы в папке
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => {
      const filePath = path.join(folderPath, file.name);
      const stats = fs.statSync(filePath);
      return {
        name: file.name,
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        hash: getFileHash(filePath),
      };
    });

  console.log(`📁 ВСЕ файлы в папке (${allFiles.length} шт.):\n`);
  allFiles.forEach((file, idx) => {
    const ext = path.extname(file.name).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    const isExcluded = file.name.startsWith('_backup_') || file.name.startsWith('_');
    
    let marker = '';
    if (isImage) {
      if (isExcluded) {
        marker = ' ❌ ИСКЛЮЧЕН API';
      } else if (file.name === '00_main.webp') {
        marker = ' ⭐ ГЛАВНАЯ';
      } else if (file.name === '8473647.webp') {
        marker = ' ✅ ЭТО ТА КАРТИНКА';
      }
    }
    
    console.log(`  ${idx + 1}. ${file.name}`);
    console.log(`     Размер: ${file.size} байт (${(file.size / 1024).toFixed(2)} KB)`);
    if (isImage && !isExcluded) {
      console.log(`     MD5: ${file.hash.substring(0, 16)}...`);
      if (file.name === '00_main.webp' || file.name === '8473647.webp') {
        const matches = file.hash === sourceHash ? ' ✅ СОВПАДАЕТ' : ' ❌ НЕ СОВПАДАЕТ';
        console.log(`     Сравнение с исходным:${matches}`);
      }
    }
    console.log(`     ${marker}\n`);
  });

  // 5. ВОСПРОИЗВОДИМ ЛОГИКУ API
  const apiImages = allFiles
    .filter(file => {
      if (file.name.startsWith('_backup_') || file.name.startsWith('_')) {
        return false;
      }
      const ext = path.extname(file.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`\n📸 Изображения, которые API ВЕРНЕТ (${apiImages.length} шт.):\n`);
  apiImages.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ (mainImage)' : '';
    const is8473647 = img.name === '8473647.webp' ? ' ✅ В ГАЛЕРЕЕ' : '';
    console.log(`  ${idx + 1}. ${img.name}${isMain}${is8473647}`);
    console.log(`     URL: /api/images/${encodeURIComponent(variantPath!)}/${encodeURIComponent(img.name)}`);
  });

  // 6. ПРОВЕРКА
  const mainFile = apiImages.find(f => f.name === '00_main.webp');
  const galleryFile = apiImages.find(f => f.name === '8473647.webp');

  console.log(`\n📊 РЕЗУЛЬТАТЫ ПРОВЕРКИ:\n`);
  
  if (mainFile) {
    if (mainFile.hash === sourceHash) {
      console.log(`✅ 00_main.webp совпадает с исходным 8473647.webp`);
    } else {
      console.log(`❌ 00_main.webp НЕ совпадает с исходным 8473647.webp`);
      console.log(`   Нужно перекопировать!`);
    }
  } else {
    console.log(`❌ 00_main.webp не найден в списке API!`);
  }

  if (galleryFile) {
    if (galleryFile.hash === sourceHash) {
      console.log(`✅ 8473647.webp в галерее совпадает с исходным`);
    } else {
      console.log(`❌ 8473647.webp в галерее НЕ совпадает с исходным`);
      console.log(`   Нужно перекопировать!`);
    }
  } else {
    console.log(`❌ 8473647.webp не найден в списке API!`);
  }

  if (apiImages[0]?.name === '00_main.webp') {
    console.log(`✅ 00_main.webp является первым (главная)`);
  } else {
    console.log(`❌ Первый файл: ${apiImages[0]?.name}, а не 00_main.webp`);
  }

  // 7. ИСПРАВЛЕНИЕ ЕСЛИ НУЖНО
  if (mainFile && mainFile.hash !== sourceHash) {
    console.log(`\n🔧 ИСПРАВЛЕНИЕ: копирую 8473647.webp как 00_main.webp...`);
    fs.copyFileSync(sourceImagePath, mainFile.path);
    const newHash = getFileHash(mainFile.path);
    console.log(`   ✅ Скопировано. Новый MD5: ${newHash.substring(0, 16)}...`);
  }

  if (!galleryFile || (galleryFile && galleryFile.hash !== sourceHash)) {
    const galleryPath = path.join(folderPath, '8473647.webp');
    console.log(`\n🔧 ИСПРАВЛЕНИЕ: копирую 8473647.webp в галерею...`);
    fs.copyFileSync(sourceImagePath, galleryPath);
    const newHash = getFileHash(galleryPath);
    console.log(`   ✅ Скопировано. Новый MD5: ${newHash.substring(0, 16)}...`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
