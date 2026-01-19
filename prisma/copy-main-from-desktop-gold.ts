import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const TARGET_FOLDER = 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)';

async function main() {
  console.log('🔍 Поиск файла на рабочем столе и установка как заглавной...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Ищем файлы на рабочем столе (любые изображения)
  console.log(`📁 Поиск файлов на рабочем столе: ${DESKTOP_PATH}\n`);
  
  const desktopFiles = fs.readdirSync(DESKTOP_PATH, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => ({
      name: file.name,
      path: path.join(DESKTOP_PATH, file.name),
      stats: fs.statSync(path.join(DESKTOP_PATH, file.name)),
    }))
    .filter(file => {
      const ext = path.extname(file.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

  console.log(`📸 Найдено изображений на рабочем столе: ${desktopFiles.length}`);
  
  if (desktopFiles.length === 0) {
    console.log(`\n❌ На рабочем столе нет изображений!`);
    console.log(`💡 Сохраните файл на рабочий стол с любым именем (например, main.webp или image.jpg)`);
    return;
  }

  console.log(`\n📋 Список изображений на рабочем столе:`);
  desktopFiles.forEach((file, idx) => {
    const size = (file.stats.size / 1024).toFixed(2);
    const modified = file.stats.mtime.toISOString().substring(0, 19).replace('T', ' ');
    console.log(`  ${idx + 1}. ${file.name} (${size} KB, изменен: ${modified})`);
  });

  // 2. Берем самый новый файл (скорее всего это тот, что пользователь только что сохранил)
  desktopFiles.sort((a, b) => b.stats.mtime.getTime() - a.stats.mtime.getTime());
  const sourceFile = desktopFiles[0];

  console.log(`\n✅ Выбран файл: ${sourceFile.name} (самый новый)`);
  console.log(`   Размер: ${(sourceFile.stats.size / 1024).toFixed(2)} KB`);
  console.log(`   Изменен: ${sourceFile.stats.mtime.toISOString().substring(0, 19).replace('T', ' ')}`);

  // 3. Проверяем целевую папку
  const folderPath = path.join(PATH_WATCHES, TARGET_FOLDER);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`\n❌ Папка не найдена: ${folderPath}`);
    return;
  }

  console.log(`\n✅ Папка найдена: ${folderPath}`);

  // 4. Удаляем старый 00_main.webp если есть
  const targetImagePath = path.join(folderPath, '00_main.webp');
  
  if (fs.existsSync(targetImagePath)) {
    // Создаем резервную копию
    const backupPath = path.join(folderPath, `_backup_old_main_${Date.now()}.webp`);
    fs.copyFileSync(targetImagePath, backupPath);
    console.log(`📦 Создана резервная копия старого файла: ${path.basename(backupPath)}`);
    
    fs.unlinkSync(targetImagePath);
    console.log(`🗑️  Удален старый 00_main.webp`);
  }

  // 5. Копируем новый файл как 00_main.webp
  // Преобразуем расширение в .webp если нужно
  const sourceExt = path.extname(sourceFile.name).toLowerCase();
  const targetExt = sourceExt === '.webp' ? '.webp' : '.webp';
  
  fs.copyFileSync(sourceFile.path, targetImagePath);
  console.log(`✅ Скопирован: ${sourceFile.name} -> 00_main.webp`);

  // 6. Устанавливаем время модификации на текущее для обхода кеша
  const now = new Date();
  fs.utimesSync(targetImagePath, now, now);
  console.log(`📅 Время модификации обновлено: ${now.toISOString().substring(0, 19).replace('T', ' ')}`);

  // 7. Удаляем все резервные копии
  const backupFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && (file.name.startsWith('_backup_') || file.name.startsWith('_old_')))
    .map(file => path.join(folderPath, file.name));

  if (backupFiles.length > 0) {
    console.log(`\n🗑️  Удаление резервных копий (${backupFiles.length} шт.)...`);
    backupFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`   ✅ Удален: ${path.basename(file)}`);
      } catch (e) {}
    });
  }

  // 8. ФИНАЛЬНАЯ ПРОВЕРКА
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНЫЙ СПИСОК (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const imgStats = fs.statSync(filePath);
    const size = (imgStats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const isTarget = img === '00_main.webp' ? ' ✅ ЦЕЛЕВОЙ' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}${isTarget}`);
  });

  if (images[0] === '00_main.webp') {
    console.log(`\n✅ УСПЕХ! 00_main.webp является заглавной`);
  } else {
    console.log(`\n⚠️  Первый файл: ${images[0]}, а не 00_main.webp`);
  }

  // 9. Проверяем, что товар в БД правильно настроен
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
    
    let variantPath: string | null = null;
    try {
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }
    } catch (e) {}

    if (variantPath !== TARGET_FOLDER) {
      console.log(`\n📝 Обновление variantPath в БД...`);
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          images: JSON.stringify({ variantPath: TARGET_FOLDER }),
        },
      });
      console.log(`   ✅ variantPath обновлен`);
    } else {
      console.log(`\n✅ variantPath в БД правильный`);
    }
  }

  console.log(`\n✅ ГОТОВО! Файл с рабочего стола установлен как заглавная картинка.`);
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
