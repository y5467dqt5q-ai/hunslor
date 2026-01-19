import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔧 Принудительное применение 8473647.webp как главной и в галерее...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем файл на рабочем столе
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Файл не найден на рабочем столе: ${sourceImagePath}`);
    return;
  }

  console.log(`✅ Найден файл на рабочем столе: 8473647.webp`);

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

  console.log(`✅ Папка найдена: ${folderPath}\n`);

  // 4. Удаляем все резервные копии
  const backupFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && (file.name.startsWith('_backup_') || file.name.startsWith('_')))
    .map(file => path.join(folderPath, file.name));

  if (backupFiles.length > 0) {
    console.log(`🗑️  Удаление резервных копий (${backupFiles.length} шт.)...`);
    backupFiles.forEach(backupFile => {
      try {
        fs.unlinkSync(backupFile);
        console.log(`   ✅ Удален: ${path.basename(backupFile)}`);
      } catch (e) {}
    });
  }

  // 5. Сохраняем текущий 00_main.webp как резервную копию (если это другой файл)
  const currentMainPath = path.join(folderPath, '00_main.webp');
  if (fs.existsSync(currentMainPath)) {
    // Проверяем, это ли тот же файл
    const currentStats = fs.statSync(currentMainPath);
    const sourceStats = fs.statSync(sourceImagePath);
    
    if (currentStats.size !== sourceStats.size) {
      // Разные файлы - сохраняем старый
      const backupPath = path.join(folderPath, `_old_main_${Date.now()}.webp`);
      fs.copyFileSync(currentMainPath, backupPath);
      console.log(`📦 Сохранена старая заглавная: ${path.basename(backupPath)}`);
    }
  }

  // 6. Удаляем старый 00_main.webp
  if (fs.existsSync(currentMainPath)) {
    fs.unlinkSync(currentMainPath);
    console.log(`🗑️  Удален старый 00_main.webp`);
  }

  // 7. Копируем 8473647.webp как 00_main.webp (главная)
  fs.copyFileSync(sourceImagePath, currentMainPath);
  console.log(`✅ Скопирован 8473647.webp как 00_main.webp (главная)`);

  // 8. Убеждаемся, что 8473647.webp также есть в папке как отдельный файл для галереи
  const galleryImagePath = path.join(folderPath, '8473647.webp');
  if (!fs.existsSync(galleryImagePath)) {
    // Если файла нет - копируем его
    fs.copyFileSync(sourceImagePath, galleryImagePath);
    console.log(`✅ Скопирован 8473647.webp в папку для галереи`);
  } else {
    // Если файл есть - проверяем, что он совпадает с исходным
    const galleryStats = fs.statSync(galleryImagePath);
    const sourceStats = fs.statSync(sourceImagePath);
    
    if (galleryStats.size !== sourceStats.size) {
      // Разные файлы - заменяем
      fs.copyFileSync(sourceImagePath, galleryImagePath);
      console.log(`✅ Обновлен 8473647.webp в папке для галереи`);
    } else {
      console.log(`✅ 8473647.webp уже существует в папке`);
    }
  }

  // 9. Устанавливаем время модификации на текущее, чтобы обойти кеш
  const now = new Date();
  fs.utimesSync(currentMainPath, now, now);
  fs.utimesSync(galleryImagePath, now, now);

  // 10. Проверяем финальный список файлов
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНЫЙ СПИСОК изображений в папке (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ (API вернет это первым)' : '';
    const isInGallery = img === '8473647.webp' ? ' ✅ В ГАЛЕРЕЕ' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}${isInGallery}`);
  });

  // 11. Проверяем, что все правильно
  if (images[0] === '00_main.webp') {
    console.log(`\n✅ 00_main.webp является первым файлом (главная)`);
  } else {
    console.log(`\n⚠️ ПРОБЛЕМА: Первый файл - ${images[0]}, а не 00_main.webp`);
  }

  if (images.includes('8473647.webp')) {
    const index = images.indexOf('8473647.webp') + 1;
    console.log(`✅ 8473647.webp найден в галерее на позиции ${index}`);
  } else {
    console.log(`\n❌ ПРОБЛЕМА: 8473647.webp не найден в списке!`);
  }

  // 12. Проверяем размеры файлов
  const mainStats = fs.statSync(currentMainPath);
  const galleryStats = fs.statSync(galleryImagePath);
  const sourceStats = fs.statSync(sourceImagePath);

  console.log(`\n📊 Сравнение размеров файлов:`);
  console.log(`   Исходный 8473647.webp: ${sourceStats.size} байт`);
  console.log(`   00_main.webp в папке: ${mainStats.size} байт`);
  console.log(`   8473647.webp в папке: ${galleryStats.size} байт`);

  if (mainStats.size === sourceStats.size && galleryStats.size === sourceStats.size) {
    console.log(`   ✅ Все размеры совпадают - файлы идентичны`);
  } else {
    console.log(`   ⚠️ Размеры различаются!`);
  }

  console.log(`\n✅ Готово! 8473647.webp установлен как главная И добавлен в галерею.`);
  console.log('💡 ВАЖНО - выполните:');
  console.log('   1. Перезапустите dev server (Ctrl+C, затем npm run dev)');
  console.log('   2. Очистите кеш браузера (Ctrl+Shift+Delete)');
  console.log('   3. Обновите страницу с Ctrl+F5');
  console.log('   4. Или откройте в режиме инкогнито (Ctrl+Shift+N)');
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
