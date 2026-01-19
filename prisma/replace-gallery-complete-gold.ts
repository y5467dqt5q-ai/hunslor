import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SOURCE_FOLDER = 'C:\\Users\\Вітання!\\Desktop\\999999999999';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const TARGET_FOLDER = 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)';

async function main() {
  console.log('🔄 Полная замена галереи...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем исходную папку
  if (!fs.existsSync(SOURCE_FOLDER)) {
    console.log(`❌ Исходная папка не найдена: ${SOURCE_FOLDER}`);
    return;
  }

  console.log(`✅ Исходная папка найдена: ${SOURCE_FOLDER}`);

  // 2. Читаем файлы из исходной папки
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

  if (sourceFiles.length === 0) {
    console.log(`\n❌ В исходной папке нет изображений!`);
    return;
  }

  console.log(`\n📸 Найдено изображений в исходной папке: ${sourceFiles.length}`);
  sourceFiles.forEach((file, idx) => {
    const size = (file.stats.size / 1024).toFixed(2);
    console.log(`  ${idx + 1}. ${file.name} (${size} KB)`);
  });

  // 3. Проверяем целевую папку
  const folderPath = path.join(PATH_WATCHES, TARGET_FOLDER);
  
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`\n✅ Создана целевая папка: ${folderPath}`);
  } else {
    console.log(`\n✅ Целевая папка найдена: ${folderPath}`);
  }

  // 4. Удаляем ВСЕ старые файлы в целевой папке
  console.log(`\n🗑️  Очистка целевой папки...`);
  const existingFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name));

  existingFiles.forEach(filePath => {
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Удален: ${path.basename(filePath)}`);
    } catch (e) {
      console.log(`   ⚠️  Не удалось удалить: ${path.basename(filePath)}`);
    }
  });

  // 5. Копируем файлы из исходной папки
  console.log(`\n📸 Копирование изображений...`);
  
  // Ищем главную картинку (может быть _main или похожее)
  let mainImageFound = false;
  const mainImageCandidates = ['_main', 'main', '00_main', '01_main'];
  
  for (const sourceFile of sourceFiles) {
    let destFileName = sourceFile.name;
    
    // Проверяем, не является ли это главной картинкой
    const baseName = path.basename(sourceFile.name, path.extname(sourceFile.name)).toLowerCase();
    const isMainCandidate = mainImageCandidates.some(candidate => baseName.includes(candidate.toLowerCase()));
    
    // Если нашли потенциальную главную картинку и еще не переименовали
    if (isMainCandidate && !mainImageFound) {
      const ext = path.extname(sourceFile.name).toLowerCase();
      destFileName = `00_main${ext}`;
      mainImageFound = true;
      console.log(`   ✅ ${sourceFile.name} -> ${destFileName} (ГЛАВНАЯ)`);
    } else {
      console.log(`   ✅ ${sourceFile.name} -> ${destFileName}`);
    }
    
    const destPath = path.join(folderPath, destFileName);
    fs.copyFileSync(sourceFile.path, destPath);
  }

  // Если главная картинка не найдена - делаем первую главной
  if (!mainImageFound && sourceFiles.length > 0) {
    const firstFile = sourceFiles[0];
    const ext = path.extname(firstFile.name).toLowerCase();
    const oldName = path.basename(firstFile.name);
    const newMainPath = path.join(folderPath, `00_main${ext}`);
    const oldPath = path.join(folderPath, oldName);
    
    if (fs.existsSync(oldPath) && oldPath !== newMainPath) {
      fs.renameSync(oldPath, newMainPath);
      console.log(`\n   🔄 Переименован первый файл: ${oldName} -> 00_main${ext} (ГЛАВНАЯ)`);
    }
  }

  // 6. Устанавливаем время модификации на текущее
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
    
    console.log(`\n✅ Товар найден в БД`);
    
    // Проверяем variantPath
    let variantPath: string | null = null;
    try {
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }
    } catch (e) {}

    if (variantPath !== TARGET_FOLDER) {
      console.log(`📝 Обновление variantPath...`);
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          images: JSON.stringify({ variantPath: TARGET_FOLDER }),
        },
      });
      console.log(`   ✅ variantPath обновлен`);
    } else {
      console.log(`✅ variantPath правильный`);
    }
  }

  console.log(`\n✅ ГОТОВО! Галерея полностью заменена.`);
  console.log(`   Всего изображений: ${images.length}`);
  console.log(`   Главная: ${images[0]}`);
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
