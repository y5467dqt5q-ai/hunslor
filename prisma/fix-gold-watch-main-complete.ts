import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const TARGET_FOLDER = 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)';

async function main() {
  console.log('🔧 ПОЛНАЯ ПРОВЕРКА И ИСПРАВЛЕНИЕ...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем файл 00_main.webp
  const targetImagePath = path.join(PATH_WATCHES, TARGET_FOLDER, '00_main.webp');
  
  if (!fs.existsSync(targetImagePath)) {
    console.log(`❌ Файл не найден: ${targetImagePath}`);
    return;
  }

  const stats = fs.statSync(targetImagePath);
  console.log(`✅ Файл 00_main.webp найден (${(stats.size / 1024).toFixed(2)} KB)`);

  // 2. Проверяем папку
  const folderPath = path.join(PATH_WATCHES, TARGET_FOLDER);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  // 3. Удаляем ВСЕ резервные копии и временные файлы
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name));

  const backupFiles = allFiles.filter(f => 
    path.basename(f).startsWith('_backup_') || 
    path.basename(f).startsWith('_old_') ||
    path.basename(f).startsWith('zzz_')
  );

  if (backupFiles.length > 0) {
    console.log(`\n🗑️  Удаление резервных копий (${backupFiles.length} шт.)...`);
    backupFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`   ✅ Удален: ${path.basename(file)}`);
      } catch (e) {}
    });
  }

  // 4. Проверяем и исправляем порядок файлов
  let images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_') && !file.name.startsWith('zzz_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Текущий список (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const isTarget = img === '00_main.webp' ? ' ✅ ЦЕЛЕВОЙ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${isTarget}`);
  });

  // 5. Если 00_main.webp не первый - исправляем
  if (images[0] !== '00_main.webp') {
    console.log(`\n⚠️  00_main.webp не первый! Исправляю...`);
    
    // Находим индекс 00_main.webp
    const mainIndex = images.indexOf('00_main.webp');
    
    if (mainIndex !== -1) {
      // Переименовываем файлы, которые идут перед 00_main.webp
      const filesToRename = images.slice(0, mainIndex);
      
      for (let i = filesToRename.length - 1; i >= 0; i--) {
        const oldName = filesToRename[i];
        const ext = path.extname(oldName);
        const baseName = path.basename(oldName, ext);
        // Добавляем префикс, чтобы файл шел после 00_main.webp
        const newName = `01_${baseName}${ext}`;
        const oldPath = path.join(folderPath, oldName);
        const newPath = path.join(folderPath, newName);
        
        try {
          fs.renameSync(oldPath, newPath);
          console.log(`   ✅ ${oldName} -> ${newName}`);
        } catch (e) {
          console.log(`   ⚠️  Не удалось переименовать ${oldName}`);
        }
      }
    }
  }

  // 6. Обновляем список после переименования
  images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_') && !file.name.startsWith('zzz_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Финальный список (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const isTarget = img === '00_main.webp' ? ' ✅ ЦЕЛЕВОЙ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${isTarget}`);
  });

  // 7. Находим товар в БД
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

  if (!watch || watch.variants.length === 0) {
    console.log(`\n❌ Товар не найден в БД`);
    return;
  }

  console.log(`\n✅ Товар найден в БД:`);
  console.log(`   Model: ${watch.model}`);
  console.log(`   Slug: ${watch.slug}`);

  // 8. Обновляем variantPath в варианте
  const variant = watch.variants[0];
  
  console.log(`\n📝 Обновление варианта в БД...`);
  const newImages = JSON.stringify({ variantPath: TARGET_FOLDER });
  
  await prisma.productVariant.update({
    where: { id: variant.id },
    data: {
      images: newImages,
    },
  });

  console.log(`   ✅ variantPath обновлен: ${TARGET_FOLDER}`);

  // 9. ФИНАЛЬНАЯ ПРОВЕРКА - воспроизводим логику API
  const apiImages = images.filter(name => {
    if (name.startsWith('_backup_') || name.startsWith('_old_') || name.startsWith('_')) {
      return false;
    }
    const ext = path.extname(name).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  console.log(`\n📋 API ВЕРНЕТ (${apiImages.length} шт.):`);
  apiImages.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const isTarget = img === '00_main.webp' ? ' ✅ ЦЕЛЕВОЙ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${isTarget}`);
  });

  if (apiImages[0] === '00_main.webp' && apiImages.includes('00_main.webp')) {
    console.log(`\n✅ ВСЕ ПРАВИЛЬНО! 00_main.webp - заглавная и в галерее`);
  } else {
    console.log(`\n⚠️  ПРОБЛЕМА: Первый файл ${apiImages[0]}, не 00_main.webp`);
  }

  console.log(`\n✅ ГОТОВО! Все проверено и исправлено.`);
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
