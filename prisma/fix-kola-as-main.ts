import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const TARGET_FOLDER = 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)';

async function main() {
  console.log('🔧 Установка _kola.png.webp как заглавной...\n');

  const folderPath = path.join(PATH_WATCHES, TARGET_FOLDER);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  // Проверяем текущие файлы
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`📸 Текущие файлы (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}`);
  });

  // Находим _kola.png.webp
  const kolaFile = images.find(img => img.includes('kola') || img === '_kola.png.webp');
  
  if (!kolaFile) {
    console.log(`\n❌ Файл _kola.png.webp не найден`);
    return;
  }

  console.log(`\n✅ Найден файл: ${kolaFile}`);

  // Удаляем текущий 00_main.webp если есть
  const currentMain = path.join(folderPath, '00_main.webp');
  if (fs.existsSync(currentMain)) {
    fs.unlinkSync(currentMain);
    console.log(`🗑️  Удален старый: 00_main.webp`);
  }

  // Переименовываем _kola.png.webp в 00_main.webp
  const kolaPath = path.join(folderPath, kolaFile);
  const newMainPath = path.join(folderPath, '00_main.webp');
  
  fs.renameSync(kolaPath, newMainPath);
  console.log(`✅ Переименован: ${kolaFile} -> 00_main.webp`);

  // ФИНАЛЬНАЯ ПРОВЕРКА
  const finalImages = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНАЯ ГАЛЕРЕЯ (${finalImages.length} шт.):`);
  finalImages.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const imgStats = fs.statSync(filePath);
    const size = (imgStats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}`);
  });

  if (finalImages[0] === '00_main.webp') {
    console.log(`\n✅ УСПЕХ! 00_main.webp является заглавной`);
  }

  console.log(`\n✅ ГОТОВО!`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
