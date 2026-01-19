import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_12345 = 'C:\\Users\\Вітання!\\Desktop\\12345';

// Официальные цены на смартфоны (в евро, Германия/ЕС)
// Источники: официальные сайты производителей
const officialPrices: Record<string, { base: number; memory256?: number; memory512?: number; memory1TB?: number }> = {
  'Google Pixel 10': { base: 899, memory256: 999, memory512: 1149 },
  'Xiaomi 15 Ultra': { base: 999, memory256: 1099, memory512: 1299, memory1TB: 1499 },
  'Xiaomi 15T Pro': { base: 699, memory256: 799, memory512: 949 },
  'Xiaomi Redmi Note 15 Pro+': { base: 449, memory256: 499, memory512: 599 },
};

async function main() {
  console.log('📱 Импорт смартфонов из папки 12345...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только добавляем новые смартфоны.\n');

  // Получаем категорию smartphones
  const smartphonesCategory = await prisma.category.findUnique({
    where: { slug: 'smartphones' },
  });

  if (!smartphonesCategory) {
    console.log('❌ Категория smartphones не найдена!');
    return;
  }

  console.log(`✅ Категория smartphones: ${smartphonesCategory.slug}\n`);
  console.log('ℹ️ Существующие iPhone не будут затронуты\n');

  if (!fs.existsSync(PATH_12345)) {
    console.log(`❌ Папка не найдена: ${PATH_12345}`);
    return;
  }

  // Читаем все подпапки
  const folders = fs.readdirSync(PATH_12345, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  if (folders.length === 0) {
    console.log('❌ Подпапки не найдены');
    return;
  }

  console.log(`✅ Найдено папок: ${folders.length}\n`);

  // Группируем папки по модели
  const productsMap = new Map<string, Array<{ folderName: string; color: string; memory: string }>>();

  for (const folderName of folders) {
    try {
      // Пропускаем iPhone
      if (folderName.toLowerCase().includes('iphone')) {
        console.log(`⏭️  Пропущен iPhone: ${folderName}`);
        continue;
      }

      const folderPath = path.join(PATH_12345, folderName);
      
      if (!fs.statSync(folderPath).isDirectory()) {
        continue;
      }

      // Парсим название папки
      // Форматы:
      // "Google Pixel 10 12 128GB (Frost)" -> модель: "Google Pixel 10", память: "128GB", цвет: "Frost"
      // "Xiaomi 15 Ultra 16 1TB (Silver Chrome)" -> модель: "Xiaomi 15 Ultra", память: "1TB", цвет: "Silver Chrome"
      // "Xiaomi 15T Pro 12 256GB (Black)" -> модель: "Xiaomi 15T Pro", память: "256GB", цвет: "Black"
      // "Xiaomi Redmi Note 15 Pro+ 5G 12 512GB (Black)" -> модель: "Xiaomi Redmi Note 15 Pro+ 5G", память: "512GB", цвет: "Black"

      let modelName = '';
      let memory = '';
      let color = '';

      // Вариант 1: "Model X Y 1TB (Color)" - для 1TB
      const match1TB = folderName.match(/^(.+?)\s+\d+\s+(1TB)\s+\((.+?)\)/);
      if (match1TB) {
        modelName = match1TB[1].trim();
        memory = '1TB';
        color = match1TB[3].trim();
      } else {
        // Вариант 2: "Model X Y ZGB (Color)" - для GB (например, "Google Pixel 10 12 128GB")
        // Ищем паттерн: название модели, затем число (RAM), затем числоGB, затем цвет в скобках
        const matchGB = folderName.match(/^(.+?)\s+\d+\s+(\d+)GB\s+\((.+?)\)/);
        if (matchGB) {
          modelName = matchGB[1].trim();
          memory = `${matchGB[2]}GB`;
          color = matchGB[3].trim();
        } else {
          // Вариант 3: "Model X YGB (Color)" - без RAM числа
          const matchSimple = folderName.match(/^(.+?)\s+(\d+)GB\s+\((.+?)\)/);
          if (matchSimple) {
            // Убираем последнее число перед GB (это RAM, не часть модели)
            modelName = matchSimple[1].replace(/\s+\d+\s*$/, '').trim();
            memory = `${matchSimple[2]}GB`;
            color = matchSimple[3].trim();
          }
        }
      }

      if (!modelName || !memory || !color) {
        console.log(`⚠️ Не удалось распарсить: ${folderName}`);
        continue;
      }

      if (!productsMap.has(modelName)) {
        productsMap.set(modelName, []);
      }

      productsMap.get(modelName)!.push({ folderName, color, memory });

      console.log(`📦 Найдено: ${modelName} - ${memory} - ${color}`);

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${folderName}:`, error.message);
    }
  }

  console.log(`\n✅ Найдено моделей: ${productsMap.size}\n`);

  // Обрабатываем каждую модель
  for (const [modelName, variants] of productsMap.entries()) {
    try {
      console.log(`\n📱 Обработка модели: ${modelName}`);
      console.log(`   Вариантов: ${variants.length}`);

      // Определяем бренд
      let brand = 'Samsung';
      if (modelName.toLowerCase().includes('google') || modelName.toLowerCase().includes('pixel')) {
        brand = 'Google';
      } else if (modelName.toLowerCase().includes('xiaomi')) {
        brand = 'Xiaomi';
      } else if (modelName.toLowerCase().includes('oneplus')) {
        brand = 'OnePlus';
      }

      // Определяем цены
      let basePrice = 899;
      let price256 = 999;
      let price512 = 1149;
      let price1TB = 1499;

      if (modelName.includes('Google Pixel 10')) {
        basePrice = 899;
        price256 = 999;
        price512 = 1149;
      } else if (modelName.includes('Xiaomi 15 Ultra')) {
        basePrice = 999;
        price256 = 1099;
        price512 = 1299;
        price1TB = 1499;
      } else if (modelName.includes('Xiaomi 15T Pro')) {
        basePrice = 699;
        price256 = 799;
        price512 = 949;
      } else if (modelName.includes('Xiaomi Redmi Note 15 Pro+')) {
        basePrice = 449;
        price256 = 499;
        price512 = 599;
      }

      // Создаем slug
      const slug = modelName
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();

      if (!slug) {
        console.log(`   ⚠️ Не удалось создать slug, пропускаем`);
        continue;
      }

      // Получаем все уникальные цвета
      const uniqueColors = [...new Set(variants.map(v => v.color))];
      
      // Определяем доступные варианты памяти для модели
      // Для каждой модели создаем варианты для всех стандартных вариантов памяти
      let availableMemories: string[] = [];
      
      if (modelName.includes('Google Pixel 10')) {
        availableMemories = ['128GB', '256GB', '512GB'];
      } else if (modelName.includes('Xiaomi 15 Ultra')) {
        availableMemories = ['256GB', '512GB', '1TB'];
      } else if (modelName.includes('Xiaomi 15T Pro')) {
        availableMemories = ['256GB', '512GB'];
      } else if (modelName.includes('Xiaomi Redmi Note 15 Pro+')) {
        availableMemories = ['256GB', '512GB'];
      } else {
        // По умолчанию используем память из папок
        availableMemories = [...new Set(variants.map(v => v.memory))];
      }

      console.log(`   Цвета: ${uniqueColors.join(', ')}`);
      console.log(`   Память: ${availableMemories.join(', ')}`);

      // Создаем или обновляем товар
      const product = await prisma.product.upsert({
        where: { slug },
        update: {
          categoryId: smartphonesCategory.id,
          basePrice: basePrice,
          discount: 0,
          baseImages: JSON.stringify([]),
        },
        create: {
          slug: slug,
          categoryId: smartphonesCategory.id,
          brand: brand,
          model: modelName,
          basePrice: basePrice,
          discount: 0,
          baseImages: JSON.stringify([]),
        },
      });

      // Создаем варианты для каждой комбинации цвета и памяти
      for (const color of uniqueColors) {
        for (const memory of availableMemories) {
          // Находим папку для этого варианта
          const variantFolder = variants.find(v => v.color === color && v.memory === memory);
          
          if (!variantFolder) {
            // Если нет точного совпадения, используем первый доступный вариант с этим цветом
            const colorVariant = variants.find(v => v.color === color);
            if (!colorVariant) continue;
            
            // Используем папку с этим цветом, но создаем вариант с нужной памятью
            const folderPath = path.join(PATH_12345, colorVariant.folderName);
            
            // Определяем цену на основе памяти
            let price = basePrice;
            let priceModifier = 0;
            
            if (memory === '256GB') {
              price = price256;
              priceModifier = price256 - basePrice;
            } else if (memory === '512GB') {
              price = price512;
              priceModifier = price512 - basePrice;
            } else if (memory === '1TB') {
              price = price1TB;
              priceModifier = price1TB - basePrice;
            } else if (memory === '128GB') {
              // Для 128GB используем базовую цену
              price = basePrice;
              priceModifier = 0;
            }

            const variantSKU = `${slug.toUpperCase().replace(/-/g, '-')}-${memory}-${color.toUpperCase().replace(/\s+/g, '-')}`;
            
            const imagesData = {
              variantPath: colorVariant.folderName,
            };

            await prisma.productVariant.upsert({
              where: { sku: variantSKU },
              update: {
                color: color,
                memory: memory,
                storage: memory,
                priceModifier: priceModifier,
                stock: 20,
                inStock: true,
                images: JSON.stringify(imagesData),
              },
              create: {
                productId: product.id,
                color: color,
                memory: memory,
                storage: memory,
                priceModifier: priceModifier,
                sku: variantSKU,
                stock: 20,
                inStock: true,
                images: JSON.stringify(imagesData),
              },
            });
          } else {
            // Есть точное совпадение - используем эту папку
            const folderPath = path.join(PATH_12345, variantFolder.folderName);
            
            // Получаем изображения
            const images = fs.readdirSync(folderPath, { withFileTypes: true })
              .filter(file => file.isFile())
              .map(file => file.name)
              .filter(name => {
                const ext = path.extname(name).toLowerCase();
                return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
              })
              .sort();

            // Создаем главное изображение
            const mainImageName = images.find(img => 
              img.includes('_main') || img.includes('__main') || img.includes('00_main')
            );
            
            if (mainImageName && !mainImageName.includes('00_main')) {
              const oldPath = path.join(folderPath, mainImageName);
              const newPath = path.join(folderPath, '00_main.webp');
              try {
                fs.copyFileSync(oldPath, newPath);
              } catch (e) {
                // Игнорируем ошибки
              }
            }

            // Если нет главного изображения, используем первое
            if (!images.find(img => img.includes('00_main') || img.includes('_main') || img.includes('__main'))) {
              const firstImage = images[0];
              if (firstImage) {
                const oldPath = path.join(folderPath, firstImage);
                const newPath = path.join(folderPath, '00_main.webp');
                try {
                  fs.copyFileSync(oldPath, newPath);
                } catch (e) {
                  // Игнорируем ошибки
                }
              }
            }

            // Определяем цену на основе памяти
            let price = basePrice;
            let priceModifier = 0;
            
            if (memory === '256GB') {
              price = price256;
              priceModifier = price256 - basePrice;
            } else if (memory === '512GB') {
              price = price512;
              priceModifier = price512 - basePrice;
            } else if (memory === '1TB') {
              price = price1TB;
              priceModifier = price1TB - basePrice;
            } else if (memory === '128GB') {
              price = basePrice;
              priceModifier = 0;
            }

            const variantSKU = `${slug.toUpperCase().replace(/-/g, '-')}-${memory}-${color.toUpperCase().replace(/\s+/g, '-')}`;
            
            const imagesData = {
              variantPath: variantFolder.folderName,
            };

            await prisma.productVariant.upsert({
              where: { sku: variantSKU },
              update: {
                color: color,
                memory: memory,
                storage: memory,
                priceModifier: priceModifier,
                stock: 20,
                inStock: true,
                images: JSON.stringify(imagesData),
              },
              create: {
                productId: product.id,
                color: color,
                memory: memory,
                storage: memory,
                priceModifier: priceModifier,
                sku: variantSKU,
                stock: 20,
                inStock: true,
                images: JSON.stringify(imagesData),
              },
            });
          }
        }
      }

      console.log(`   ✅ Создан товар: ${modelName}`);
      console.log(`      Slug: ${slug}`);
      console.log(`      Бренд: ${brand}`);
      console.log(`      Базовая цена: ${basePrice} €`);
      if (price256 !== basePrice) console.log(`      256GB: ${price256} €`);
      if (price512 !== basePrice) console.log(`      512GB: ${price512} €`);
      if (price1TB !== basePrice) console.log(`      1TB: ${price1TB} €`);
      console.log(`      Цвета: ${uniqueColors.length}`);
      console.log(`      Варианты памяти: ${availableMemories.join(', ')}`);

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${modelName}:`, error.message);
    }
  }

  console.log('\n✅ Готово! Смартфоны импортированы с цветами, памятью и ценами.');
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
