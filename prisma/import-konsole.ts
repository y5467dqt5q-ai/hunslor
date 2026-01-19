import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const KONSOLE_PATH = 'C:\\Users\\Вітання!\\Desktop\\konsole';

// Официальные цены на консоли (в евро, Германия/ЕС)
// Источники: официальные сайты производителей
const officialPrices: Record<string, number> = {
  // PlayStation 5
  'PlayStation 5 Pro': 749,
  'PlayStation 5 Slim': 549,
  'PlayStation 5 Slim (Digital Edition)': 499,
  'PlayStation 5 Slim (Digital Edition) (EA SPORTS FC 26 Bundle)': 549,
  'PlayStation 5 Slim (Digital Edition) (Fortnite Flowering Chaos Bundle)': 549,
  
  // PlayStation VR2
  'PlayStation VR2': 399,
  
  // Xbox Series X
  'Microsoft Xbox (Series X) (1TB)': 649,
  'Microsoft Xbox (Series X) (2TB) (Galaxy Black)': 799,
  'Microsoft Xbox Series X Digital Edition': 599,
  
  // Nintendo Switch
  'Nintendo Switch 2': 449,
  'Nintendo Switch OLED': 399,
};

async function main() {
  console.log('🎮 Импорт консолей из папки konsole...\n');
  console.log('ВАЖНО: Не трогаем iPhone и другие товары! Только добавляем консоли.\n');

  // Получаем или создаем категорию консолей
  const consolesCategory = await prisma.category.upsert({
    where: { slug: 'consoles' },
    update: {},
    create: {
      name: 'Gaming Consoles',
      slug: 'consoles',
      icon: '🎮',
      order: 3,
    },
  });

  console.log(`✅ Категория консолей: ${consolesCategory.slug}\n`);

  // Удаляем существующие консоли (только консоли, не трогаем другие товары!)
  console.log('🗑️ Удаление существующих консолей...');
  const existingConsoles = await prisma.product.findMany({
    where: {
      categoryId: consolesCategory.id,
    },
    include: {
      variants: true,
    },
  });

  if (existingConsoles.length > 0) {
    console.log(`   Найдено существующих консолей: ${existingConsoles.length}`);
    
    // Удаляем варианты сначала
    for (const console of existingConsoles) {
      if (console.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { productId: console.id },
        });
      }
    }
    
    // Затем удаляем товары
    const deleted = await prisma.product.deleteMany({
      where: {
        categoryId: consolesCategory.id,
      },
    });
    
    console.log(`   ✅ Удалено консолей: ${deleted.count}`);
  } else {
    console.log('   ℹ️ Существующие консоли не найдены');
  }

  console.log('\n📁 Сканирование папки konsole...\n');

  if (!fs.existsSync(KONSOLE_PATH)) {
    console.log(`❌ Папка не найдена: ${KONSOLE_PATH}`);
    return;
  }

  // Читаем все подпапки в папке konsole
  const folders = fs.readdirSync(KONSOLE_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  if (folders.length === 0) {
    console.log('❌ Подпапки в папке konsole не найдены');
    return;
  }

  console.log(`✅ Найдено папок: ${folders.length}\n`);

  // Обрабатываем каждую папку как отдельный товар
  for (const folderName of folders) {
    try {
      const folderPath = path.join(KONSOLE_PATH, folderName);
      
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
      let brand = 'Sony';
      if (folderName.toLowerCase().includes('xbox') || folderName.toLowerCase().includes('microsoft')) {
        brand = 'Microsoft';
      } else if (folderName.toLowerCase().includes('nintendo') || folderName.toLowerCase().includes('switch')) {
        brand = 'Nintendo';
      } else if (folderName.toLowerCase().includes('playstation') || folderName.toLowerCase().includes('ps5') || folderName.toLowerCase().includes('ps vr')) {
        brand = 'Sony';
      }

      // Определяем цену
      let price = 499; // Базовая цена по умолчанию
      for (const [key, value] of Object.entries(officialPrices)) {
        if (folderName.includes(key) || key.includes(folderName.substring(0, 20))) {
          price = value;
          break;
        }
      }

      // Специальная логика для определения цены
      if (folderName.includes('PlayStation 5 Pro')) {
        price = 749;
      } else if (folderName.includes('PlayStation 5 Slim') && folderName.includes('Digital Edition')) {
        if (folderName.includes('Bundle')) {
          price = 549;
        } else {
          price = 499;
        }
      } else if (folderName.includes('PlayStation 5 Slim')) {
        price = 549;
      } else if (folderName.includes('PlayStation VR2') || folderName.includes('PS VR2')) {
        price = 399;
      } else if (folderName.includes('Xbox Series X') && folderName.includes('2TB')) {
        price = 799;
      } else if (folderName.includes('Xbox Series X') && folderName.includes('Digital Edition')) {
        price = 599;
      } else if (folderName.includes('Xbox Series X') && folderName.includes('1TB')) {
        price = 649;
      } else if (folderName.includes('Nintendo Switch 2')) {
        price = 449;
      } else if (folderName.includes('Nintendo Switch OLED')) {
        price = 399;
      }

      // Создаем товар
      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: consolesCategory.id,
          basePrice: price,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]),
        },
        create: {
          slug: slug,
          categoryId: consolesCategory.id,
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

  console.log('✅ Готово! Консоли импортированы с официальными ценами.');
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
