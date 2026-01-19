import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔧 Исправление заглавной картинки для часов...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

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

  // 1. Удаляем ВСЕ резервные копии (_backup_*)
  const backupFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && file.name.startsWith('_backup_'))
    .map(file => path.join(folderPath, file.name));

  console.log(`🗑️  Найдено резервных копий: ${backupFiles.length}`);
  for (const backupFile of backupFiles) {
    try {
      fs.unlinkSync(backupFile);
      console.log(`   ✅ Удален: ${path.basename(backupFile)}`);
    } catch (e) {
      console.log(`   ⚠️  Не удалось удалить: ${path.basename(backupFile)}`);
    }
  }

  // 2. Проверяем, что 00_main.webp существует
  const mainImagePath = path.join(folderPath, '00_main.webp');
  if (!fs.existsSync(mainImagePath)) {
    console.log(`\n❌ Файл 00_main.webp не найден!`);
    return;
  }

  console.log(`\n✅ Файл 00_main.webp найден`);

  // 3. Убеждаемся, что 00_main.webp будет первым (устанавливаем время модификации на самое старое)
  // Но сначала проверим все изображения
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => ({
      name: file.name,
      path: path.join(folderPath, file.name),
      stats: fs.statSync(path.join(folderPath, file.name)),
    }))
    .filter(f => {
      const ext = path.extname(f.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`\n📸 Изображения в папке после удаления резервных копий (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ (API вернет это первым)' : '';
    const size = (img.stats.size / 1024).toFixed(2);
    console.log(`  ${idx + 1}. ${img.name} (${size} KB)${isMain}`);
  });

  if (images.length > 0) {
    const firstImage = images[0];
    if (firstImage.name === '00_main.webp') {
      console.log(`\n✅ 00_main.webp является первым файлом - ОТЛИЧНО!`);
    } else {
      console.log(`\n⚠️ ПЕРВЫЙ файл: ${firstImage.name}, а не 00_main.webp`);
      console.log(`   Нужно переименовать файлы...`);
      
      // Переименовываем 00_main.webp в temp имя, потом переименовываем первый в другое имя, потом 00_main обратно
      // Проще: переименовываем первый файл, чтобы он шел после 00_main
      const firstExt = path.extname(firstImage.name);
      const tempName = `zzz_${firstImage.name}`;
      const tempPath = path.join(folderPath, tempName);
      
      try {
        fs.renameSync(firstImage.path, tempPath);
        console.log(`   Переименован ${firstImage.name} -> ${tempName}`);
        
        // Теперь переименовываем обратно, но с префиксом, чтобы он шел после 00_main
        const newName = `01_${firstImage.name.replace(/^00_/, '')}`;
        const newPath = path.join(folderPath, newName);
        fs.renameSync(tempPath, newPath);
        console.log(`   Переименован ${tempName} -> ${newName}`);
      } catch (e) {
        console.log(`   ❌ Ошибка при переименовании: ${e}`);
      }
    }
  }

  // 4. Финальная проверка
  const finalImages = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📋 ФИНАЛЬНЫЙ СПИСОК изображений (${finalImages.length} шт.):`);
  finalImages.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}`);
  });

  if (finalImages[0] === '00_main.webp') {
    console.log(`\n✅ УСПЕХ! 00_main.webp теперь является первым файлом!`);
    console.log(`   API вернет его как заглавную картинку.`);
  } else {
    console.log(`\n⚠️ ПРОБЛЕМА: Первый файл все еще ${finalImages[0]}`);
  }

  console.log(`\n✅ Готово!`);
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
