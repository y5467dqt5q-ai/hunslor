import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔧 Исправление заглавной фотки для Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)...\n');

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

  // Получаем все изображения (исключая резервные копии и 00_main, чтобы увидеть оригинальные имена)
  const allImages = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

  // Разделяем на 00_main и остальные
  const mainImages = allImages.filter(img => img === '00_main.webp');
  const otherImages = allImages.filter(img => img !== '00_main.webp').sort();

  // Восстанавливаем исходный порядок: сначала все кроме 00_main, потом 00_main
  const images = [...otherImages, ...mainImages];

  console.log(`📁 Папка: ${variantPath}`);
  console.log(`📸 Всего изображений: ${allImages.length}\n`);

  console.log('Текущий порядок изображений:');
  allImages.sort().forEach((img, idx) => {
    const isMain = img === '00_main.webp' ? ' ⭐ ЗАГЛАВНАЯ' : '';
    const is4thInOriginal = idx === 3 ? ' 🎯 ДОЛЖНО БЫТЬ 4-М' : '';
    console.log(`   ${idx + 1}. ${img}${isMain}${is4thInOriginal}`);
  });

  // Если 00_main.webp существует, узнаем его размер, чтобы понять, какое это было изображение
  const mainImagePath = path.join(folderPath, '00_main.webp');
  let mainImageSize: number | null = null;
  if (fs.existsSync(mainImagePath)) {
    const stats = fs.statSync(mainImagePath);
    mainImageSize = stats.size;
    console.log(`\n📊 00_main.webp размер: ${mainImageSize} байт`);
  }

  // Проверяем размеры всех изображений, чтобы найти, какое было переименовано
  const imageSizes = allImages.map(img => {
    const imgPath = path.join(folderPath, img);
    const stats = fs.statSync(imgPath);
    return { name: img, size: stats.size };
  });

  // Если пользователь говорит, что на странице 4-е изображение должно быть заглавным,
  // но порядок файлов отличается, возможно нужно посмотреть на оригинальный порядок
  // или понять, какое изображение действительно 4-е на странице

  // Возможно, пользователь имеет в виду 4-е изображение в том порядке, в котором они были ДО переименования
  // Или порядок определяется не по алфавиту, а по дате создания

  // Попробуем найти изображение, которое визуально соответствует описанию (темный корпус с оранжевой кнопкой)
  // И сделаем его заглавным

  // Но проще всего - спросить пользователя или найти файл по размеру или по признакам

  console.log('\n💡 Если на странице отображается неправильное изображение, возможно проблема в кешировании.');
  console.log('   Попробуйте очистить кеш браузера (Ctrl+Shift+Delete) или обновить страницу с Ctrl+F5');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
