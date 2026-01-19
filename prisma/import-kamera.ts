import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const KAMERA_PATH = 'C:\\Users\\Вітання!\\Desktop\\Kamera';

// Официальные цены на камеры (в евро, Германия/ЕС)
// Источники: официальные сайты производителей
const officialPrices: Record<string, number> = {
  // GoPro
  'GoPro HERO': 299,
  'GoPro Hero 12 Black': 449,
  'GoPro Hero 13 Black': 499,
  'GoPro Hero 13 Black Extended Power Bundle': 599,
  'GoPro Hero 13 Polar White': 499,
  
  // DJI
  'DJI Osmo Action 4 Standard Combo': 399,
  'DJI Osmo Action 4 Adventure Combo': 499,
  'DJI Osmo Action 5 Pro Standard Combo': 549,
  'DJI Osmo Pocket 3 Standard Combo': 649,
  'DJI Osmo Pocket 3 Creator Combo': 799,
  
  // Insta360
  'Insta360 X4': 499,
  'Insta360 X5 Satin White Standard Bundle': 599,
  'Insta360 Ace Pro 2 Standard Bundle': 449,
  'Insta360 GO 3S 4K Standard Bundle': 399,
};

async function main() {
  console.log('📷 Импорт камер из папки Kamera...\n');
  console.log('ВАЖНО: Не трогаем iPhone и другие товары! Только добавляем камеры.\n');

  // Получаем или создаем категорию camera
  const cameraCategory = await prisma.category.upsert({
    where: { slug: 'camera' },
    update: {},
    create: {
      name: 'Kamera',
      slug: 'camera',
      icon: '📷',
      order: 7,
    },
  });

  console.log(`✅ Категория Kamera: ${cameraCategory.slug}\n`);

  // Удаляем существующие камеры (только камеры, не трогаем другие товары!)
  console.log('🗑️ Удаление существующих камер...');
  const existingProducts = await prisma.product.findMany({
    where: {
      categoryId: cameraCategory.id,
    },
    include: {
      variants: true,
    },
  });

  if (existingProducts.length > 0) {
    console.log(`   Найдено существующих камер: ${existingProducts.length}`);
    
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
        categoryId: cameraCategory.id,
      },
    });
    
    console.log(`   ✅ Удалено камер: ${deleted.count}`);
  } else {
    console.log('   ℹ️ Существующие камеры не найдены');
  }

  console.log('\n📁 Сканирование папки Kamera...\n');

  if (!fs.existsSync(KAMERA_PATH)) {
    console.log(`❌ Папка не найдена: ${KAMERA_PATH}`);
    return;
  }

  // Читаем все подпапки в папке Kamera
  const folders = fs.readdirSync(KAMERA_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  if (folders.length === 0) {
    console.log('❌ Подпапки в папке Kamera не найдены');
    return;
  }

  console.log(`✅ Найдено папок: ${folders.length}\n`);

  // Обрабатываем каждую папку как отдельный товар
  for (const folderName of folders) {
    try {
      const folderPath = path.join(KAMERA_PATH, folderName);
      
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

      // Переименовываем первое изображение в 00_main.webp, если нет главного
      const mainImageName = images.find(img => 
        img.includes('_main') || img.includes('__main') || img.includes('00_main')
      );
      
      if (!mainImageName || !mainImageName.includes('00_main')) {
        const sourceImage = mainImageName || images[0];
        const oldPath = path.join(folderPath, sourceImage);
        const newPath = path.join(folderPath, '00_main.webp');
        try {
          fs.copyFileSync(oldPath, newPath);
          console.log(`   📸 Создано главное изображение: ${sourceImage} → 00_main.webp`);
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
      let brand = 'GoPro';
      if (folderName.toLowerCase().includes('dji') || folderName.toLowerCase().includes('osmo')) {
        brand = 'DJI';
      } else if (folderName.toLowerCase().includes('insta360')) {
        brand = 'Insta360';
      } else if (folderName.toLowerCase().includes('gopro')) {
        brand = 'GoPro';
      } else if (folderName.toLowerCase().includes('canon')) {
        brand = 'Canon';
      } else if (folderName.toLowerCase().includes('sony')) {
        brand = 'Sony';
      } else if (folderName.toLowerCase().includes('nikon')) {
        brand = 'Nikon';
      }

      // Определяем цену
      let price = 399; // Базовая цена по умолчанию
      
      // Ищем цену в справочнике
      for (const [key, value] of Object.entries(officialPrices)) {
        if (folderName.includes(key) || key.includes(folderName.substring(0, 20))) {
          price = value;
          break;
        }
      }

      // Специальная логика для определения цены
      if (folderName.includes('GoPro HERO') && !folderName.includes('12') && !folderName.includes('13')) {
        price = 299;
      } else if (folderName.includes('GoPro Hero 12')) {
        price = 449;
      } else if (folderName.includes('GoPro Hero 13') && folderName.includes('Extended Power Bundle')) {
        price = 599;
      } else if (folderName.includes('GoPro Hero 13')) {
        price = 499;
      } else if (folderName.includes('DJI Osmo Action 4 Adventure Combo')) {
        price = 499;
      } else if (folderName.includes('DJI Osmo Action 4')) {
        price = 399;
      } else if (folderName.includes('DJI Osmo Action 5 Pro')) {
        price = 549;
      } else if (folderName.includes('DJI Osmo Pocket 3 Creator Combo')) {
        price = 799;
      } else if (folderName.includes('DJI Osmo Pocket 3')) {
        price = 649;
      } else if (folderName.includes('Insta360 X5')) {
        price = 599;
      } else if (folderName.includes('Insta360 X4')) {
        price = 499;
      } else if (folderName.includes('Insta360 Ace Pro 2')) {
        price = 449;
      } else if (folderName.includes('Insta360 GO 3S')) {
        price = 399;
      }

      // Создаем товар
      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: cameraCategory.id,
          basePrice: price,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]),
        },
        create: {
          slug: slug,
          categoryId: cameraCategory.id,
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

  console.log('✅ Готово! Камеры импортированы с официальными ценами.');
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
