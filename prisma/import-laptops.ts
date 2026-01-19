import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('💻 Импорт ноутбуков из папки Laptop...\n');
  console.log('⚠️  ВАЖНО: НЕ ТРОГАЕМ iPhone! Только добавляем ноутбуки.\n');

  // Получаем или создаем категорию ноутбуков
  const laptopsCategory = await prisma.category.upsert({
    where: { slug: 'laptops' },
    update: {},
    create: {
      name: 'Laptops',
      slug: 'laptops',
      icon: '💻',
      order: 3,
    },
  });

  console.log(`✅ Категория ноутбуков: ${laptopsCategory.slug}\n`);

  // Удаляем существующие ноутбуки (только ноутбуки, не трогаем другие товары!)
  console.log('🗑️ Удаление существующих ноутбуков...');
  const existingLaptops = await prisma.product.findMany({
    where: {
      categoryId: laptopsCategory.id,
    },
    include: {
      variants: true,
    },
  });

  if (existingLaptops.length > 0) {
    console.log(`   Найдено существующих ноутбуков: ${existingLaptops.length}`);
    
    // Удаляем варианты сначала
    for (const laptop of existingLaptops) {
      if (laptop.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: { productId: laptop.id },
        });
      }
    }
    
    // Затем удаляем товары
    const deleted = await prisma.product.deleteMany({
      where: {
        categoryId: laptopsCategory.id,
      },
    });
    
    console.log(`   ✅ Удалено ноутбуков: ${deleted.count}`);
  } else {
    console.log('   ℹ️ Существующие ноутбуки не найдены');
  }

  console.log('\n📁 Сканирование папки Laptop...\n');

  if (!fs.existsSync(LAPTOPS_PATH)) {
    console.log(`❌ Папка не найдена: ${LAPTOPS_PATH}`);
    return;
  }

  // Читаем все подпапки в папке Laptop
  const folders = fs.readdirSync(LAPTOPS_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  if (folders.length === 0) {
    console.log('❌ Подпапки в папке Laptop не найдены');
    return;
  }

  console.log(`✅ Найдено папок: ${folders.length}\n`);

  // Обрабатываем каждую папку как отдельный товар
  for (const folderName of folders) {
    try {
      const folderPath = path.join(LAPTOPS_PATH, folderName);
      
      // Проверяем, что это папка
      if (!fs.statSync(folderPath).isDirectory()) {
        continue;
      }

      console.log(`📦 Обработка: ${folderName}`);

      // Получаем все изображения из папки
      const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      if (allFiles.length === 0) {
        console.log(`   ⚠️ Нет изображений в папке, пропускаем`);
        continue;
      }

      // Находим главное изображение (__main.jpeg или __main.jpeg.webp)
      // Пользователь указал, что заглавная картинка = __main.jpeg
      const mainImageFile = allFiles.find(f => {
        const lower = f.toLowerCase();
        return lower === '__main.jpeg' || 
               lower === '__main.jpeg.webp' ||
               lower.includes('__main.jpeg');
      });

      // Если нет __main, используем первое изображение
      const mainImage = mainImageFile || allFiles[0];
      
      console.log(`   📸 Изображений: ${allFiles.length} (главное: ${mainImage})`);

      // КРИТИЧНО: Переименовываем главное изображение в 00_main.webp для API
      // Это нужно для правильной сортировки (00_main.webp будет первым)
      const mainImagePath = path.join(folderPath, mainImage);
      const targetMainPath = path.join(folderPath, '00_main.webp');
      
      // Удаляем старый 00_main.webp, если он существует
      if (fs.existsSync(targetMainPath)) {
        try {
          fs.unlinkSync(targetMainPath);
          console.log(`   🗑️ Удален старый 00_main.webp`);
        } catch (err) {
          console.log(`   ⚠️ Не удалось удалить старый 00_main.webp: ${err}`);
        }
      }
      
      // Копируем главное изображение как 00_main.webp
      if (mainImage !== '00_main.webp') {
        try {
          // Копируем главное изображение как 00_main.webp
          fs.copyFileSync(mainImagePath, targetMainPath);
          console.log(`   ✅ Главное изображение "${mainImage}" скопировано как 00_main.webp`);
        } catch (err) {
          console.log(`   ❌ Не удалось скопировать главное изображение: ${err}`);
        }
      } else {
        console.log(`   ✅ Главное изображение уже называется 00_main.webp`);
      }

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

      // Сохраняем variantPath для загрузки галереи (как для iPhone)
      const imagesData = {
        variantPath: folderName,
      };

      // Определяем бренд из названия папки
      let brand = 'Acer';
      if (folderName.toLowerCase().includes('asus')) {
        brand = 'ASUS';
      } else if (folderName.toLowerCase().includes('lenovo')) {
        brand = 'Lenovo';
      } else if (folderName.toLowerCase().includes('hp')) {
        brand = 'HP';
      } else if (folderName.toLowerCase().includes('dell')) {
        brand = 'Dell';
      } else if (folderName.toLowerCase().includes('msi')) {
        brand = 'MSI';
      } else if (folderName.toLowerCase().includes('acer')) {
        brand = 'Acer';
      }

      // Создаем товар
      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: laptopsCategory.id,
          basePrice: 999, // Базовая цена, можно изменить позже
          discount: 0,
          folderName: folderName, // Сохраняем название папки
          baseImages: JSON.stringify([]), // Пустой массив изображений
        },
        create: {
          slug: slug,
          categoryId: laptopsCategory.id,
          brand: brand,
          model: productName, // Название товара = model
          basePrice: 999,
          discount: 0,
          folderName: folderName,
          baseImages: JSON.stringify([]), // Пустой массив изображений
        },
      });

      // Создаем один вариант для товара (без выбора памяти/цвета)
      const variantSKU = `${slug.toUpperCase().replace(/-/g, '-')}-V1`;
      
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
      console.log(`      Бренд: ${brand}`);
      console.log(`      Галерея: ${allFiles.length} изображений\n`);

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${folderName}:`, error.message);
    }
  }

  console.log('✅ Готово! Ноутбуки импортированы.');
  console.log('⚠️  iPhone НЕ ТРОНУТЫ - они работают как раньше!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
