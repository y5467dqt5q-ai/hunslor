import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SOURCE_FOLDER = 'C:\\Users\\Вітання!\\Desktop\\999999999999';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const TARGET_FOLDER = 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)';

async function main() {
  console.log('🔄 Восстановление полной галереи из папки 999999999999...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем исходную папку
  if (!fs.existsSync(SOURCE_FOLDER)) {
    console.log(`❌ Исходная папка не найдена: ${SOURCE_FOLDER}`);
    return;
  }

  // 2. Читаем все файлы из исходной папки
  const sourceFiles = fs.readdirSync(SOURCE_FOLDER, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => ({
      name: file.name,
      path: path.join(SOURCE_FOLDER, file.name),
      stats: fs.statSync(path.join(SOURCE_FOLDER, file.name)),
    }))
    .filter(file => {
      const ext = path.extname(file.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

  console.log(`📸 Найдено изображений в исходной папке: ${sourceFiles.length}`);
  sourceFiles.forEach((file, idx) => {
    const size = (file.stats.size / 1024).toFixed(2);
    console.log(`  ${idx + 1}. ${file.name} (${size} KB)`);
  });

  // 3. Проверяем целевую папку
  const folderPath = path.join(PATH_WATCHES, TARGET_FOLDER);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`\n✅ Создана целевая папка: ${folderPath}`);
  }

  // 4. Удаляем ВСЕ старые файлы
  console.log(`\n🗑️  Полная очистка целевой папки...`);
  const existingFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name));

  existingFiles.forEach(filePath => {
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Удален: ${path.basename(filePath)}`);
    } catch (e) {}
  });

  // 5. Копируем ВСЕ файлы из исходной папки
  console.log(`\n📸 Копирование всех изображений...`);
  
  let mainImageFile: typeof sourceFiles[0] | null = null;
  const otherFiles: typeof sourceFiles = [];

  // Ищем _kola.png.webp как главную картинку
  for (const file of sourceFiles) {
    const baseName = path.basename(file.name, path.extname(file.name)).toLowerCase();
    if (baseName.includes('kola') || file.name === '_kola.png.webp') {
      mainImageFile = file;
    } else {
      otherFiles.push(file);
    }
  }

  // Копируем главную картинку как 00_main.webp
  if (mainImageFile) {
    const destPath = path.join(folderPath, '00_main.webp');
    fs.copyFileSync(mainImageFile.path, destPath);
    console.log(`   ✅ ${mainImageFile.name} -> 00_main.webp (ГЛАВНАЯ)`);
  } else {
    // Если _kola не найден, делаем первый файл главным
    if (sourceFiles.length > 0) {
      const firstFile = sourceFiles[0];
      const destPath = path.join(folderPath, '00_main.webp');
      fs.copyFileSync(firstFile.path, destPath);
      console.log(`   ✅ ${firstFile.name} -> 00_main.webp (ГЛАВНАЯ)`);
    }
  }

  // Копируем остальные файлы
  for (const file of otherFiles) {
    const destPath = path.join(folderPath, file.name);
    fs.copyFileSync(file.path, destPath);
    console.log(`   ✅ ${file.name} -> ${file.name}`);
  }

  // Если _kola не был найден отдельно, но есть в списке - копируем все файлы заново
  if (!mainImageFile && sourceFiles.length > 0) {
    const kolaFile = sourceFiles.find(f => f.name.includes('kola'));
    if (kolaFile) {
      // Уже скопирован как первый файл или нужно переименовать
      const existingMain = path.join(folderPath, '00_main.webp');
      const kolaPath = path.join(folderPath, kolaFile.name);
      
      if (fs.existsSync(kolaPath) && kolaPath !== existingMain) {
        fs.unlinkSync(existingMain);
        fs.renameSync(kolaPath, existingMain);
        console.log(`   🔄 ${kolaFile.name} -> 00_main.webp (ГЛАВНАЯ)`);
      }
    }
  }

  // 6. Устанавливаем время модификации
  const now = new Date();
  const allDestFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name));

  allDestFiles.forEach(filePath => {
    try {
      fs.utimesSync(filePath, now, now);
    } catch (e) {}
  });

  // 7. ФИНАЛЬНАЯ ПРОВЕРКА
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНАЯ ГАЛЕРЕЯ (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const imgStats = fs.statSync(filePath);
    const size = (imgStats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}`);
  });

  // 8. Проверяем товар в БД
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

  if (watch && watch.variants.length > 0) {
    const variant = watch.variants[0];
    
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        images: JSON.stringify({ variantPath: TARGET_FOLDER }),
      },
    });
    console.log(`\n✅ variantPath обновлен в БД`);
  }

  if (images[0] === '00_main.webp') {
    console.log(`\n✅ УСПЕХ! 00_main.webp является заглавной`);
    console.log(`   Всего изображений в галерее: ${images.length}`);
  }

  console.log(`\n✅ ГОТОВО! Галерея полностью заменена.`);
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
