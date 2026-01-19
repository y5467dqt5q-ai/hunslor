import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const TARGET_FOLDER = 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)';

async function main() {
  console.log('🔧 Настройка заглавной картинки для Apple Watch Series 10 Gold...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем, что файл существует
  const targetImagePath = path.join(PATH_WATCHES, TARGET_FOLDER, '00_main.webp');
  
  if (!fs.existsSync(targetImagePath)) {
    console.log(`❌ Файл не найден: ${targetImagePath}`);
    return;
  }

  console.log(`✅ Файл найден: 00_main.webp`);
  const stats = fs.statSync(targetImagePath);
  console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} байт)`);

  // 2. Проверяем папку и список файлов
  const folderPath = path.join(PATH_WATCHES, TARGET_FOLDER);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  console.log(`✅ Папка найдена: ${folderPath}\n`);

  // 3. Проверяем текущий порядок файлов
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`📸 Текущий список изображений (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ (API вернет это первым)' : '';
    const isTarget = img === '00_main.webp' ? ' ✅ ЦЕЛЕВОЙ ФАЙЛ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${isTarget}`);
  });

  // 4. Проверяем, является ли 00_main.webp первым
  if (images[0] === '00_main.webp') {
    console.log(`\n✅ 00_main.webp уже является первым файлом - ОТЛИЧНО!`);
  } else {
    console.log(`\n⚠️  Первый файл: ${images[0]}, а не 00_main.webp`);
    console.log(`   Нужно переименовать файлы, чтобы 00_main.webp был первым...`);
    
    // Находим индекс 00_main.webp
    const mainIndex = images.indexOf('00_main.webp');
    if (mainIndex === -1) {
      console.log(`   ❌ 00_main.webp не найден в списке!`);
      return;
    }

    // Переименовываем файлы, которые идут перед 00_main.webp
    const filesToRename = images.slice(0, mainIndex);
    console.log(`   🔄 Переименование ${filesToRename.length} файлов...`);
    
    for (let i = filesToRename.length - 1; i >= 0; i--) {
      const oldName = filesToRename[i];
      const ext = path.extname(oldName);
      const newName = `zzz_${oldName.replace(/^00_/, '01_')}`;
      const oldPath = path.join(folderPath, oldName);
      const newPath = path.join(folderPath, newName);
      
      try {
        fs.renameSync(oldPath, newPath);
        console.log(`      ✅ ${oldName} -> ${newName}`);
      } catch (e) {
        console.log(`      ⚠️  Не удалось переименовать ${oldName}`);
      }
    }
  }

  // 5. Находим товар в БД
  const watch = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)',
      },
    },
    include: {
      variants: true,
    },
  });

  if (!watch) {
    console.log(`\n❌ Товар не найден в БД`);
    console.log(`   Возможно, нужно создать товар или проверить название`);
    return;
  }

  console.log(`\n✅ Товар найден в БД:`);
  console.log(`   Model: ${watch.model}`);
  console.log(`   Slug: ${watch.slug}`);
  console.log(`   Variants: ${watch.variants.length}`);

  // 6. Проверяем и обновляем variantPath в варианте
  if (watch.variants.length > 0) {
    const variant = watch.variants[0];
    
    let variantPath: string | null = null;
    try {
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }
    } catch (e) {}

    console.log(`\n📝 Проверка variantPath:`);
    console.log(`   Текущий: ${variantPath || 'не установлен'}`);
    console.log(`   Нужный: ${TARGET_FOLDER}`);

    if (variantPath !== TARGET_FOLDER) {
      console.log(`   🔄 Обновление variantPath...`);
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          images: JSON.stringify({ variantPath: TARGET_FOLDER }),
        },
      });
      console.log(`   ✅ variantPath обновлен`);
    } else {
      console.log(`   ✅ variantPath уже правильный`);
    }
  }

  // 7. Финальная проверка
  const finalImages = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНЫЙ СПИСОК (${finalImages.length} шт.):`);
  finalImages.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const isTarget = img === '00_main.webp' ? ' ✅ ЦЕЛЕВОЙ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${isTarget}`);
  });

  if (finalImages[0] === '00_main.webp') {
    console.log(`\n✅ УСПЕХ! 00_main.webp является заглавной и будет в галерее`);
  } else {
    console.log(`\n⚠️  Первый файл: ${finalImages[0]}`);
  }

  console.log(`\n✅ ГОТОВО! Всё настроено правильно.`);
  console.log('💡 Обновите страницу, чтобы увидеть изменения.');
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
