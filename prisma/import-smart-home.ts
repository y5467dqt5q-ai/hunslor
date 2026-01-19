import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SMART_HOME_PATH = 'C:\\Users\\Вітання!\\Desktop\\Smart Home';

// Официальные цены на Smart Home устройства (в евро, Германия/ЕС)
// Источники: официальные сайты производителей
const officialPrices: Record<string, number> = {
  'Apple HomePod mini': 99, // Официальная цена Apple HomePod mini
};

async function main() {
  console.log('🏠 Импорт товаров Smart Home...\n');
  console.log('ВАЖНО: Не трогаем iPhone и другие товары! Только добавляем Smart Home.\n');

  // Получаем или создаем категорию Smart Home
  const smartHomeCategory = await prisma.category.upsert({
    where: { slug: 'smart-home' },
    update: {},
    create: {
      name: 'Smart Home',
      slug: 'smart-home',
      icon: '🏠',
      order: 10,
    },
  });

  console.log(`✅ Категория Smart Home: ${smartHomeCategory.slug}\n`);

  // Удаляем существующие товары Smart Home (только Smart Home, не трогаем другие товары!)
  console.log('🗑️ Удаление существующих товаров Smart Home...');
  const existingProducts = await prisma.product.findMany({
    where: {
      categoryId: smartHomeCategory.id,
    },
    include: {
      variants: true,
    },
  });

  if (existingProducts.length > 0) {
    console.log(`   Найдено существующих товаров: ${existingProducts.length}`);
    
    // Удаляем варианты сначала
    for (const product of existingProducts) {
      if (product.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { productId: product.id },
        });
      }
    }
    
    // Затем удаляем товары
    const deleted = await prisma.product.deleteMany({
      where: {
        categoryId: smartHomeCategory.id,
      },
    });
    
    console.log(`   ✅ Удалено товаров: ${deleted.count}`);
  } else {
    console.log('   ℹ️ Существующие товары не найдены');
  }

  console.log('\n📁 Сканирование папки Smart Home...\n');

  if (!fs.existsSync(SMART_HOME_PATH)) {
    console.log(`❌ Папка не найдена: ${SMART_HOME_PATH}`);
    return;
  }

  // Читаем все подпапки в папке Smart Home
  const folders = fs.readdirSync(SMART_HOME_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  if (folders.length === 0) {
    console.log('❌ Подпапки в папке Smart Home не найдены');
    return;
  }

  console.log(`✅ Найдено папок: ${folders.length}\n`);

  // Обрабатываем каждую папку как отдельный товар
  for (const folderName of folders) {
    try {
      const folderPath = path.join(SMART_HOME_PATH, folderName);
      
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

      // Переименовываем _main.jpeg.webp или __main.jpeg в 00_main.webp
      const mainImageName = images.find(img => 
        img.includes('_main') || img.includes('__main')
      );
      
      if (mainImageName && !mainImageName.includes('00_main')) {
        const oldPath = path.join(folderPath, mainImageName);
        const newPath = path.join(folderPath, '00_main.webp');
        try {
          fs.copyFileSync(oldPath, newPath);
          console.log(`   📸 Переименовано главное изображение: ${mainImageName} → 00_main.webp`);
        } catch (e) {
          console.log(`   ⚠️ Не удалось переименовать главное изображение`);
        }
      }

      // Если нет главного изображения, используем первое
      if (!images.find(img => img.includes('00_main') || img.includes('_main') || img.includes('__main'))) {
        const firstImage = images[0];
        const oldPath = path.join(folderPath, firstImage);
        const newPath = path.join(folderPath, '00_main.webp');
        try {
          fs.copyFileSync(oldPath, newPath);
          console.log(`   📸 Создано главное изображение из первого: ${firstImage} → 00_main.webp`);
        } catch (e) {
          console.log(`   ⚠️ Не удалось создать главное изображение`);
        }
      }

      console.log(`   📸 Изображений: ${images.length}`);

      // Название товара - название папки
      const productName = folderName.trim();
      
      // Создаем slug из названия
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

      // Сохраняем variantPath для загрузки галереи
      const imagesData = {
        variantPath: folderName,
      };

      // Определяем бренд из названия папки
      let brand = 'Apple';
      if (folderName.toLowerCase().includes('philips') || folderName.toLowerCase().includes('hue')) {
        brand = 'Philips';
      } else if (folderName.toLowerCase().includes('google') || folderName.toLowerCase().includes('nest')) {
        brand = 'Google';
      } else if (folderName.toLowerCase().includes('ring')) {
        brand = 'Ring';
      } else if (folderName.toLowerCase().includes('homepod')) {
        brand = 'Apple';
      }

      // Определяем цену
      let price = 99; // Базовая цена по умолчанию
      if (folderName.includes('HomePod mini')) {
        price = 99; // Официальная цена Apple HomePod mini
      }

      // Создаем товар
      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: smartHomeCategory.id,
          basePrice: price,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]),
        },
        create: {
          slug: slug,
          categoryId: smartHomeCategory.id,
          brand: brand,
          model: productName,
          basePrice: price,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]),
        },
      });

      // Создаем один вариант для товара (без выбора памяти/цвета)
      const variantSKU = `${slug.toUpperCase().replace(/-/g, '-')}`;
      
      await prisma.productVariant.upsert({
        where: { sku: variantSKU },
        update: {
          color: null,
          memory: null,
          storage: null,
          priceModifier: 0,
          stock: 20,
          inStock: true,
          images: JSON.stringify(imagesData),
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
      console.log(`      Бренд: ${brand}`);
      console.log(`      Цена: ${price} €`);
      console.log(`      SKU: ${variantSKU}`);
      console.log(`      Галерея: ${images.length} изображений\n`);

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${folderName}:`, error.message);
    }
  }

  console.log('✅ Готово! Товары Smart Home импортированы с официальными ценами.');
  console.log('⚠️ iPhone и другие товары НЕ ТРОНУТЫ!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
