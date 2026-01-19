import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const WATCHES_PATH = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🕐 Импорт часов из папки watch...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только добавляем часы.\n');

  // Получаем или создаем категорию часов
  const watchesCategory = await prisma.category.upsert({
    where: { slug: 'smartwatches' },
    update: {},
    create: {
      name: 'Smartwatches',
      slug: 'smartwatches',
      icon: '⌚',
      order: 2,
    },
  });

  console.log(`✅ Категория часов: ${watchesCategory.slug}\n`);

  // Удаляем существующие часы (только часы, не трогаем другие товары!)
  console.log('🗑️ Удаление существующих часов...');
  const existingWatches = await prisma.product.findMany({
    where: {
      categoryId: watchesCategory.id,
    },
    include: {
      variants: true,
    },
  });

  if (existingWatches.length > 0) {
    console.log(`   Найдено существующих часов: ${existingWatches.length}`);
    
    // Удаляем варианты сначала
    for (const watch of existingWatches) {
      if (watch.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { productId: watch.id },
        });
      }
    }
    
    // Затем удаляем товары
    const deleted = await prisma.product.deleteMany({
      where: {
        categoryId: watchesCategory.id,
      },
    });
    
    console.log(`   ✅ Удалено часов: ${deleted.count}`);
  } else {
    console.log('   ℹ️ Существующие часы не найдены');
  }

  console.log('\n📁 Сканирование папки watch...\n');

  if (!fs.existsSync(WATCHES_PATH)) {
    console.log(`❌ Папка не найдена: ${WATCHES_PATH}`);
    return;
  }

  // Читаем все подпапки в папке watch
  const folders = fs.readdirSync(WATCHES_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  if (folders.length === 0) {
    console.log('❌ Подпапки в папке watch не найдены');
    return;
  }

  console.log(`✅ Найдено папок: ${folders.length}\n`);

  // Обрабатываем каждую папку как отдельный товар
  for (const folderName of folders) {
    try {
      const folderPath = path.join(WATCHES_PATH, folderName);
      
      // Проверяем, что это папка
      if (!fs.statSync(folderPath).isDirectory()) {
        continue;
      }

      console.log(`📦 Обработка: ${folderName}`);

      // Получаем все изображения из папки
      const images = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      if (images.length === 0) {
        console.log(`   ⚠️ Нет изображений в папке, пропускаем`);
        continue;
      }

      console.log(`   📸 Изображений: ${images.length}`);

      // Название товара - название папки (без расширения и специальных символов)
      const productName = folderName.trim();
      
      // Создаем slug из названия (транслитерация и очистка)
      const slug = productName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      if (!slug) {
        console.log(`   ⚠️ Не удалось создать slug из названия, пропускаем`);
        continue;
      }

      // Сохраняем variantPath для загрузки галереи (как для iPhone)
      const imagesData = {
        variantPath: folderName,
      };

      // Определяем бренд из названия папки
      let brand = 'Apple';
      if (folderName.toLowerCase().includes('garmin')) {
        brand = 'Garmin';
      }

      // Создаем товар
      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: watchesCategory.id,
          basePrice: 999, // Базовая цена, можно изменить позже
          discount: 0,
          folderName: folderName, // Сохраняем название папки
          baseImages: JSON.stringify([]), // Пустой массив изображений
        },
        create: {
          slug: slug,
          categoryId: watchesCategory.id,
          brand: brand,
          model: productName, // Название товара = model
          basePrice: 999,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]), // Пустой массив изображений
        },
      });

      // Создаем один вариант для товара (без выбора памяти/цвета)
      const variantSKU = `${slug.toUpperCase().replace(/-/g, '-')}`;
      
      await prisma.productVariant.upsert({
        where: { sku: variantSKU },
        update: {
          color: null, // Нет выбора цвета
          memory: null, // Нет выбора памяти
          storage: null, // Нет выбора хранилища
          priceModifier: 0,
          stock: 20,
          inStock: true,
          images: JSON.stringify(imagesData), // Сохраняем variantPath для галереи
        },
        create: {
          productId: product.id,
          color: null,
          memory: null,
          storage: null,
          priceModifier: 0,
          sku: variantSKU,
          stock: 20,
          inStock: true,
          images: JSON.stringify(imagesData),
        },
      });

      console.log(`   ✅ Создан товар: ${productName}`);
      console.log(`      Slug: ${slug}`);
      console.log(`      SKU: ${variantSKU}`);
      console.log(`      Галерея: ${images.length} изображений\n`);

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${folderName}:`, error.message);
    }
  }

  console.log('✅ Готово! Часы импортированы.');
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
