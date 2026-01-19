import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const SMARTPHONE_PATH = 'C:\\Users\\Вітання!\\Desktop\\Smartphone';

// Официальные цены на смартфоны (в евро, Германия/ЕС)
// Источники: официальные сайты производителей
const officialPrices: Record<string, { base: number; memory256: number; memory512: number }> = {
  'Samsung Galaxy S25': { base: 899, memory256: 999, memory512: 1149 },
  'Samsung Galaxy S25+': { base: 1099, memory256: 1199, memory512: 1349 },
  'Samsung Galaxy S25 Ultra': { base: 1349, memory256: 1449, memory512: 1649 },
  'Samsung Galaxy S24 Ultra': { base: 1249, memory256: 1349, memory512: 1549 },
  'Samsung Galaxy Flip 7': { base: 1099, memory256: 1199, memory512: 1349 },
};

async function main() {
  console.log('📱 Импорт смартфонов из папки Smartphone...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только добавляем другие смартфоны.\n');

  // Получаем или создаем категорию smartphones
  const smartphonesCategory = await prisma.category.upsert({
    where: { slug: 'smartphones' },
    update: {},
    create: {
      name: 'Smartphones',
      slug: 'smartphones',
      icon: '📱',
      order: 1,
    },
  });

  console.log(`✅ Категория smartphones: ${smartphonesCategory.slug}\n`);

  // НЕ удаляем существующие товары, чтобы не затронуть iPhone!
  console.log('ℹ️ Существующие iPhone не будут затронуты\n');

  console.log('📁 Сканирование папки Smartphone...\n');

  if (!fs.existsSync(SMARTPHONE_PATH)) {
    console.log(`❌ Папка не найдена: ${SMARTPHONE_PATH}`);
    return;
  }

  // Читаем все подпапки в папке Smartphone
  const folders = fs.readdirSync(SMARTPHONE_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  if (folders.length === 0) {
    console.log('❌ Подпапки в папке Smartphone не найдены');
    return;
  }

  console.log(`✅ Найдено папок: ${folders.length}\n`);

  // Обрабатываем каждую папку как отдельный товар
  for (const folderName of folders) {
    try {
      // Пропускаем iPhone
      if (folderName.toLowerCase().includes('iphone')) {
        console.log(`⏭️  Пропущен iPhone: ${folderName}`);
        continue;
      }

      const folderPath = path.join(SMARTPHONE_PATH, folderName);
      
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

      // Переименовываем _main.png.webp или _main.jpeg.webp в 00_main.webp
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

      // Парсим название папки для извлечения модели, памяти и цвета
      // Формат: "Samsung Galaxy S25 12 256GB (Icyblue)"
      const folderNameParts = folderName.match(/^(.+?)\s+(\d+)\s+(\d+)GB\s+\((.+?)\)/);
      let modelName = folderName;
      let memory = '256GB';
      let color = '';

      if (folderNameParts) {
        modelName = folderNameParts[1].trim(); // "Samsung Galaxy S25"
        memory = `${folderNameParts[3]}GB`; // "256GB" или "512GB"
        color = folderNameParts[4].trim(); // "Icyblue"
      } else {
        // Альтернативный формат: "Samsung Galaxy S25 Ultra 12 256GB (Titanium Whitesilver) (S938)"
        const altMatch = folderName.match(/^(.+?)\s+(\d+)GB\s+\((.+?)\)/);
        if (altMatch) {
          modelName = altMatch[1].replace(/\s+\d+\s+$/, '').trim(); // Убираем "12" в конце
          memory = `${altMatch[2]}GB`;
          color = altMatch[3].split(')')[0].trim(); // Берем первый цвет
        }
      }

      // Создаем slug из названия модели (без памяти и цвета)
      const slug = modelName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      if (!slug) {
        console.log(`   ⚠️ Не удалось создать slug из названия, пропускаем`);
        continue;
      }

      // Определяем бренд
      let brand = 'Samsung';
      if (modelName.toLowerCase().includes('google') || modelName.toLowerCase().includes('pixel')) {
        brand = 'Google';
      } else if (modelName.toLowerCase().includes('oneplus')) {
        brand = 'OnePlus';
      } else if (modelName.toLowerCase().includes('xiaomi')) {
        brand = 'Xiaomi';
      }

      // Определяем цену на основе модели
      let basePrice = 899;
      let price256 = 999;
      let price512 = 1149;

      if (modelName.includes('Galaxy S25 Ultra')) {
        basePrice = 1349;
        price256 = 1449;
        price512 = 1649;
      } else if (modelName.includes('Galaxy S25+')) {
        basePrice = 1099;
        price256 = 1199;
        price512 = 1349;
      } else if (modelName.includes('Galaxy S25')) {
        basePrice = 899;
        price256 = 999;
        price512 = 1149;
      } else if (modelName.includes('Galaxy S24 Ultra')) {
        basePrice = 1249;
        price256 = 1349;
        price512 = 1549;
      } else if (modelName.includes('Galaxy Flip 7')) {
        basePrice = 1099;
        price256 = 1199;
        price512 = 1349;
      }

      // Сохраняем variantPath для загрузки галереи
      const imagesData = {
        variantPath: folderName,
      };

      // Создаем или обновляем товар (без памяти в названии модели)
      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: smartphonesCategory.id,
          basePrice: basePrice,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]),
        },
        create: {
          slug: slug,
          categoryId: smartphonesCategory.id,
          brand: brand,
          model: modelName, // Без памяти и цвета
          basePrice: basePrice,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]),
        },
      });

      // Создаем варианты с разной памятью (256GB и 512GB)
      const memories = ['256GB', '512GB'];
      
      for (const mem of memories) {
        const price = mem === '256GB' ? price256 : price512;
        const priceModifier = price - basePrice;
        
        // SKU включает память и цвет
        const variantSKU = `${slug.toUpperCase().replace(/-/g, '-')}-${mem}-${color.toUpperCase().replace(/\s+/g, '-')}`;
        
        await prisma.productVariant.upsert({
          where: { sku: variantSKU },
          update: {
            color: color,
            memory: mem,
            storage: mem,
            priceModifier: priceModifier,
            stock: 20,
            inStock: true,
            images: JSON.stringify(imagesData),
          },
          create: {
            productId: product.id,
            color: color,
            memory: mem,
            storage: mem,
            priceModifier: priceModifier,
            sku: variantSKU,
            stock: 20,
            inStock: true,
            images: JSON.stringify(imagesData),
          },
        });
      }

      console.log(`   ✅ Создан товар: ${modelName}`);
      console.log(`      Slug: ${slug}`);
      console.log(`      Бренд: ${brand}`);
      console.log(`      Цена: ${basePrice} € (256GB: ${price256} €, 512GB: ${price512} €)`);
      console.log(`      Цвет: ${color}`);
      console.log(`      Варианты: 256GB, 512GB`);
      console.log(`      Галерея: ${images.length} изображений\n`);

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${folderName}:`, error.message);
    }
  }

  console.log('✅ Готово! Смартфоны импортированы с официальными ценами и вариантами памяти.');
  console.log('⚠️ iPhone НЕ ТРОНУТЫ - они остаются вверху списка!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
