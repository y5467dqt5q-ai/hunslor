import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SOURCE_FOLDER = 'C:\\Users\\Вітання!\\Desktop\\create\\Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
const DEST_FOLDER = 'C:\\Users\\Вітання!\\Desktop\\watch\\Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';

async function main() {
  console.log('📦 Импорт товара из папки create...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем исходную папку
  if (!fs.existsSync(SOURCE_FOLDER)) {
    console.log(`❌ Исходная папка не найдена: ${SOURCE_FOLDER}`);
    return;
  }

  console.log(`✅ Исходная папка найдена: ${SOURCE_FOLDER}`);

  // 2. Проверяем файл _main.jpeg.webp
  const mainImageSource = path.join(SOURCE_FOLDER, '_main.jpeg.webp');
  if (!fs.existsSync(mainImageSource)) {
    console.log(`❌ Файл _main.jpeg.webp не найден в исходной папке`);
    return;
  }

  console.log(`✅ Файл _main.jpeg.webp найден`);

  // 3. Создаем целевую папку
  if (!fs.existsSync(DEST_FOLDER)) {
    fs.mkdirSync(DEST_FOLDER, { recursive: true });
    console.log(`✅ Создана целевая папка: ${DEST_FOLDER}`);
  } else {
    // Очищаем целевую папку, если она существует
    const existingFiles = fs.readdirSync(DEST_FOLDER, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => path.join(DEST_FOLDER, file.name));

    existingFiles.forEach(filePath => {
      try {
        fs.unlinkSync(filePath);
      } catch (e) {}
    });
    console.log(`✅ Целевая папка очищена`);
  }

  // 4. Копируем все файлы из исходной папки
  console.log(`\n📸 Копирование изображений...`);
  const sourceFiles = fs.readdirSync(SOURCE_FOLDER, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

  let mainCopied = false;
  for (const fileName of sourceFiles) {
    const sourcePath = path.join(SOURCE_FOLDER, fileName);
    let destFileName = fileName;

    // Если это _main.jpeg.webp - переименовываем в 00_main.webp
    if (fileName === '_main.jpeg.webp') {
      destFileName = '00_main.webp';
      mainCopied = true;
    }

    const destPath = path.join(DEST_FOLDER, destFileName);
    fs.copyFileSync(sourcePath, destPath);
    console.log(`   ✅ ${fileName} -> ${destFileName}`);
  }

  if (!mainCopied) {
    console.log(`\n⚠️  Предупреждение: _main.jpeg.webp не найден, но копирование продолжено`);
  } else {
    console.log(`\n✅ Главная картинка скопирована как 00_main.webp`);
  }

  // 5. Проверяем финальный список файлов
  const finalImages = fs.readdirSync(DEST_FOLDER, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Финальный список изображений (${finalImages.length} шт.):`);
  finalImages.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}`);
  });

  // 6. Находим категорию smartwatches
  const category = await prisma.category.findFirst({
    where: {
      slug: 'smartwatches',
    },
  });

  if (!category) {
    console.log(`\n❌ Категория smartwatches не найдена`);
    return;
  }

  console.log(`\n✅ Категория найдена: ${category.name} (${category.slug})`);

  // 7. Создаем товар
  const model = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const slug = model.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[()]/g, '')
    .replace(/\+/g, '-plus-')
    .replace(/--+/g, '-')
    .replace(/^-|-$/g, '');

  console.log(`\n📝 Создание товара...`);
  console.log(`   Model: ${model}`);
  console.log(`   Slug: ${slug}`);

  // variantPath - это имя папки
  const variantPath = model;
  const folderName = model;

  const product = await prisma.product.upsert({
    where: { slug },
    update: {
      model,
      brand: 'Apple',
      folderName,
      basePrice: 999,
      discount: 0,
      categoryId: category.id,
      baseImages: JSON.stringify([]),
    },
    create: {
      model,
      slug,
      brand: 'Apple',
      folderName,
      basePrice: 999,
      discount: 0,
      categoryId: category.id,
      baseImages: JSON.stringify([]),
    },
  });

  console.log(`✅ Товар создан: ${product.id}`);

  // 8. Создаем вариант товара
  const sku = `APPLE-WATCH-ULTRA-2-49MM-GPS-LTE-BLACK-TITANIUM-CASE-WITH-BLACK-OCEAN-BAND-MX4P3`;

  const variant = await prisma.productVariant.upsert({
    where: {
      sku,
    },
    update: {
      images: JSON.stringify({ variantPath }),
      inStock: true,
      stock: 20,
      priceModifier: 0,
    },
    create: {
      productId: product.id,
      sku,
      color: null,
      memory: null,
      storage: null,
      images: JSON.stringify({ variantPath }),
      inStock: true,
      stock: 20,
      priceModifier: 0,
    },
  });

  console.log(`✅ Вариант создан: ${variant.id}`);

  console.log(`\n✅ ГОТОВО! Товар добавлен в категорию smartwatches.`);
  console.log(`   URL: /products/${slug}`);
  console.log(`   Главная картинка: 00_main.webp`);
  console.log(`   Всего изображений: ${finalImages.length}`);
  console.log(`\n⚠️ iPhone НЕ ТРОНУТЫ - они работают как раньше!`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
