import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 ФИНАЛЬНАЯ ДИАГНОСТИКА...\n');

  // 1. Проверяем исходный файл
  const sourcePath = path.join(DESKTOP_PATH, '8473647.webp');
  if (!fs.existsSync(sourcePath)) {
    console.log(`❌ Исходный файл не найден`);
    return;
  }
  console.log(`✅ Исходный файл: ${sourcePath}`);

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

  if (!watch || watch.variants.length === 0) {
    console.log('❌ Товар не найден');
    return;
  }

  const variant = watch.variants[0];
  console.log(`✅ Товар: ${watch.model}`);
  console.log(`   Slug: ${watch.slug}`);
  console.log(`   Variant ID: ${variant.id}`);
  console.log(`   Images: ${variant.images}\n`);

  // 3. Парсим variantPath
  let variantPath: string | null = null;
  try {
    const parsed = JSON.parse(variant.images as string);
    variantPath = parsed.variantPath || null;
  } catch (e) {
    console.log('❌ Ошибка парсинга images');
  }

  if (!variantPath) {
    console.log('❌ variantPath не найден! Исправляем...');
    variantPath = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
    await prisma.productVariant.update({
      where: { id: variant.id },
      data: {
        images: JSON.stringify({ variantPath }),
      },
    });
    console.log(`✅ variantPath установлен: ${variantPath}`);
  } else {
    console.log(`✅ variantPath: ${variantPath}`);
  }

  // 4. Проверяем папку
  const folderPath = path.join(PATH_WATCHES, variantPath);
  console.log(`\n📂 Папка: ${folderPath}`);
  console.log(`   Существует: ${fs.existsSync(folderPath)}\n`);

  if (!fs.existsSync(folderPath)) {
    console.log('❌ Папка не найдена! Создаем...');
    fs.mkdirSync(folderPath, { recursive: true });
    console.log(`✅ Папка создана`);
  }

  // 5. Удаляем ВСЕ файлы и пересоздаем
  console.log(`\n🗑️  Полная очистка папки...`);
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name));

  allFiles.forEach(filePath => {
    try {
      fs.unlinkSync(filePath);
      console.log(`   ✅ Удален: ${path.basename(filePath)}`);
    } catch (e) {}
  });

  // 6. Копируем файлы
  console.log(`\n📸 Копирование изображений...`);
  const mainPath = path.join(folderPath, '00_main.webp');
  const galleryPath = path.join(folderPath, '01_8473647.webp');

  fs.copyFileSync(sourcePath, mainPath);
  console.log(`   ✅ 00_main.webp (ГЛАВНАЯ)`);
  
  fs.copyFileSync(sourcePath, galleryPath);
  console.log(`   ✅ 01_8473647.webp (В ГАЛЕРЕЮ)`);

  // 7. Устанавливаем время
  const now = new Date();
  fs.utimesSync(mainPath, now, now);
  fs.utimesSync(galleryPath, now, now);

  // 8. ФИНАЛЬНАЯ ПРОВЕРКА
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
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}`);
    console.log(`     Файл существует: ${fs.existsSync(filePath)}`);
    console.log(`     Размер: ${stats.size} байт`);
  });

  // 9. СИМУЛИРУЕМ ЗАПРОС API
  console.log(`\n📋 СИМУЛЯЦИЯ API ЗАПРОСА:`);
  console.log(`   URL: /api/products/images?product=${watch.slug}&variant=${variant.id}`);
  console.log(`   variantPath из БД: ${variantPath}`);
  console.log(`   Папка: ${folderPath}`);
  console.log(`   Файлы в папке: ${images.length}`);
  
  images.forEach((img, idx) => {
    const apiUrl = `/api/images/${encodeURIComponent(variantPath!)}/${encodeURIComponent(img)}`;
    console.log(`   ${idx + 1}. ${apiUrl}`);
  });

  console.log(`\n✅ ГОТОВО! Все проверено и исправлено.`);
  console.log('💡 Теперь должно работать!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
