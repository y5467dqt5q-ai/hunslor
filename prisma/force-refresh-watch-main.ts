import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔄 Принудительное обновление заглавной фотки...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // Ищем файл на рабочем столе
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Файл не найден на рабочем столе: ${sourceImagePath}`);
    return;
  }

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

  // Удаляем все старые заглавные файлы
  const oldMainFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && file.name === '00_main.webp')
    .map(file => path.join(folderPath, file.name));

  oldMainFiles.forEach(oldMain => {
    try {
      fs.unlinkSync(oldMain);
      console.log(`🗑️  Удален старый файл: ${path.basename(oldMain)}`);
    } catch (e) {
      console.log(`⚠️  Не удалось удалить ${path.basename(oldMain)}`);
    }
  });

  // Также удаляем все файлы, начинающиеся с "00_main"
  const all00MainFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && file.name.startsWith('00_main'))
    .map(file => path.join(folderPath, file.name));

  all00MainFiles.forEach(file => {
    try {
      fs.unlinkSync(file);
      console.log(`🗑️  Удален: ${path.basename(file)}`);
    } catch (e) {
      // Игнорируем ошибки
    }
  });

  // Создаем новое имя файла с timestamp, чтобы обойти кеш
  // Но используем имя 00_main.webp для правильной сортировки
  const targetImagePath = path.join(folderPath, '00_main.webp');

  // Копируем новый файл
  fs.copyFileSync(sourceImagePath, targetImagePath);
  
  // Устанавливаем время модификации на текущее время, чтобы браузер понял, что файл изменился
  const now = new Date();
  fs.utimesSync(targetImagePath, now, now);

  console.log(`✅ Скопирован новый файл: 8473647.webp -> 00_main.webp`);
  
  const stats = fs.statSync(targetImagePath);
  console.log(`📊 Размер нового файла: ${(stats.size / 1024).toFixed(2)} KB (${stats.size} байт)`);
  console.log(`📅 Время модификации установлено на: ${stats.mtime.toISOString()}`);

  // Проверяем порядок файлов
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Файлы в папке после замены (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ЗАГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}`);
  });

  if (images[0] === '00_main.webp') {
    console.log(`\n✅ 00_main.webp является первым файлом!`);
  }

  console.log(`\n✅ Готово! Заглавная фотка обновлена.`);
  console.log('💡 ДЕЙСТВИЯ ДЛЯ ОБНОВЛЕНИЯ:');
  console.log('   1. Перезапустите dev server (Ctrl+C, затем npm run dev)');
  console.log('   2. Очистите кеш браузера (Ctrl+Shift+Delete)');
  console.log('   3. Обновите страницу с Ctrl+F5 (жесткая перезагрузка)');
  console.log('   4. Или откройте страницу в режиме инкогнито (Ctrl+Shift+N)');
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
