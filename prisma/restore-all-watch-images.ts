import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔄 Восстановление всех изображений в галерее...\n');

  // 1. Проверяем исходный файл
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Исходный файл не найден`);
    return;
  }

  // 2. Находим товар
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

  // 3. Определяем папку
  const variantPath = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, variantPath);

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена`);
    return;
  }

  console.log(`✅ Папка: ${folderPath}\n`);

  // 4. Проверяем текущие файлы
  const currentFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name);

  console.log(`📁 Текущие файлы в папке (${currentFiles.length} шт.):`);
  currentFiles.forEach((file, idx) => {
    console.log(`  ${idx + 1}. ${file}`);
  });

  // 5. Создаем полную галерею: главная + 8473647.webp + другие (если они были в исходной папке)
  console.log(`\n📸 Создание галереи...`);

  // 5.1. Главная
  const mainImagePath = path.join(folderPath, '00_main.webp');
  if (!fs.existsSync(mainImagePath)) {
    fs.copyFileSync(sourceImagePath, mainImagePath);
    console.log(`   ✅ 00_main.webp (ГЛАВНАЯ)`);
  } else {
    console.log(`   ✓ 00_main.webp уже существует`);
  }

  // 5.2. В галерею (второе изображение)
  const galleryImagePath = path.join(folderPath, '01_8473647.webp');
  if (!fs.existsSync(galleryImagePath)) {
    fs.copyFileSync(sourceImagePath, galleryImagePath);
    console.log(`   ✅ 01_8473647.webp (В ГАЛЕРЕЮ)`);
  } else {
    console.log(`   ✓ 01_8473647.webp уже существует`);
  }

  // 6. ФИНАЛЬНЫЙ СПИСОК
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНАЯ ГАЛЕРЕЯ (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const is8473647 = img === '01_8473647.webp' ? ' ✅ ЭТО ТА КАРТИНКА' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}${is8473647}`);
  });

  console.log(`\n✅ Готово! Галерея содержит ${images.length} изображений.`);
  console.log('💡 Обновите страницу с Ctrl+F5');
  console.log('⚠️ iPhone НЕ ТРОНУТЫ!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
