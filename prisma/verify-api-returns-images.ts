import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка, что API вернет правильные изображения...\n');

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

  // ВОСПРОИЗВОДИМ ЛОГИКУ API
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      // Исключаем резервные копии и файлы, начинающиеся с _
      if (name.startsWith('_backup_') || name.startsWith('_')) {
        return false;
      }
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`📸 Изображения, которые API ВЕРНЕТ (${images.length} шт.):\n`);
  
  const imageUrls = images.map(img => `/api/images/${encodeURIComponent(variantPath!)}/${encodeURIComponent(img)}`);
  
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const is8473647 = img === '8473647.webp' ? ' ✅ ЭТО ТА КАРТИНКА' : '';
    const filePath = path.join(folderPath, img);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}${is8473647}`);
    console.log(`     URL: ${imageUrls[idx]}`);
  });

  console.log(`\n✅ API вернет:`);
  console.log(`   Главная (mainImage): ${imageUrls[0]}`);
  console.log(`   Всего в галерее: ${images.length} изображений`);

  // Проверяем, что 8473647.webp есть в списке
  if (images.includes('8473647.webp')) {
    const index = images.indexOf('8473647.webp') + 1;
    console.log(`\n✅ 8473647.webp найден в списке на позиции ${index}`);
    console.log(`   URL для галереи: ${imageUrls[index - 1]}`);
  } else {
    console.log(`\n❌ ПРОБЛЕМА: 8473647.webp НЕ найден в списке!`);
    console.log(`   Список изображений: ${images.join(', ')}`);
  }

  // Проверяем, что 00_main.webp - это первое
  if (images[0] === '00_main.webp') {
    console.log(`\n✅ 00_main.webp является первым файлом (главная)`);
    
    // Проверяем, что 00_main.webp и 8473647.webp - это один файл
    const mainPath = path.join(folderPath, '00_main.webp');
    const galleryPath = path.join(folderPath, '8473647.webp');
    
    if (fs.existsSync(mainPath) && fs.existsSync(galleryPath)) {
      const mainStats = fs.statSync(mainPath);
      const galleryStats = fs.statSync(galleryPath);
      
      if (mainStats.size === galleryStats.size) {
        console.log(`   ✅ 00_main.webp и 8473647.webp имеют одинаковый размер - это одна картинка`);
      } else {
        console.log(`   ⚠️ Размеры различаются: 00_main=${mainStats.size}, 8473647=${galleryStats.size}`);
      }
    }
  } else {
    console.log(`\n⚠️ Первый файл: ${images[0]}, а не 00_main.webp`);
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
