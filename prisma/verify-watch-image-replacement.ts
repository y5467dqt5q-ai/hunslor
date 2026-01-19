import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';

async function main() {
  console.log('🔍 Проверка замены заглавной фотки...\n');

  const watch = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
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

  // Проверяем файл на рабочем столе
  const desktopFile = path.join(DESKTOP_PATH, '00_main.webp');
  console.log(`📁 Файл на рабочем столе:`);
  if (fs.existsSync(desktopFile)) {
    const stats = fs.statSync(desktopFile);
    console.log(`   ✅ Найден: ${desktopFile}`);
    console.log(`   Размер: ${stats.size} байт`);
    console.log(`   Дата изменения: ${stats.mtime}`);
  } else {
    console.log(`   ❌ Не найден: ${desktopFile}`);
  }

  // Проверяем файл в папке товара
  const watchFile = path.join(folderPath, '00_main.webp');
  console.log(`\n📁 Файл в папке товара:`);
  if (fs.existsSync(watchFile)) {
    const stats = fs.statSync(watchFile);
    console.log(`   ✅ Найден: ${watchFile}`);
    console.log(`   Размер: ${stats.size} байт`);
    console.log(`   Дата изменения: ${stats.mtime}`);
  } else {
    console.log(`   ❌ Не найден: ${watchFile}`);
  }

  // Сравниваем размеры
  if (fs.existsSync(desktopFile) && fs.existsSync(watchFile)) {
    const desktopStats = fs.statSync(desktopFile);
    const watchStats = fs.statSync(watchFile);
    
    console.log(`\n📊 Сравнение:`);
    if (desktopStats.size === watchStats.size) {
      console.log(`   ✅ Размеры совпадают (${desktopStats.size} байт)`);
      if (desktopStats.mtime.getTime() === watchStats.mtime.getTime()) {
        console.log(`   ✅ Даты изменения совпадают - файлы идентичны`);
      } else {
        console.log(`   ⚠️ Даты изменения различаются - файлы могут быть разными`);
        console.log(`   Рабочий стол: ${desktopStats.mtime}`);
        console.log(`   Папка товара: ${watchStats.mtime}`);
      }
    } else {
      console.log(`   ⚠️ Размеры РАЗЛИЧАЮТСЯ!`);
      console.log(`   Рабочий стол: ${desktopStats.size} байт`);
      console.log(`   Папка товара: ${watchStats.size} байт`);
      console.log(`   ❌ Файлы не совпадают - нужно скопировать заново`);
    }
  }

  // Проверяем все изображения в папке
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Изображения в папке (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ЗАГЛАВНАЯ (API вернет это первым)' : '';
    const imgPath = path.join(folderPath, img);
    const stats = fs.statSync(imgPath);
    console.log(`   ${idx + 1}. ${img} (${stats.size} байт)${isMain}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
