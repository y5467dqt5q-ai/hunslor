import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Путь к папке с изображениями iPhone
const PATH_IPHONE_IMAGES = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('🔄 Восстановление вариантов для основных моделей iPhone...\n');

  // Получаем категорию iPhone
  const iphoneCategory = await prisma.category.findUnique({
    where: { slug: 'iphone' },
  });

  if (!iphoneCategory) {
    console.error('❌ Категория iPhone не найдена!');
    return;
  }

  // Проверяем текущее состояние
  const currentIphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      variants: true,
    },
  });

  console.log(`📦 Текущее количество iPhone 17: ${currentIphones.length}`);
  currentIphones.forEach(p => {
    console.log(`   - ${p.model} (${p.variants.length} вариантов)`);
  });

  // Функция для парсинга информации из названия папки
  const parseFolderName = (folderName: string) => {
    // Пример: "Apple iPhone 17 256GB (Mist Blue)"
    const modelMatch = folderName.match(/iPhone\s*17\s*(Pro\s*Max|Pro|Air)?/i);
    const memoryMatch = folderName.match(/(\d+)\s*(GB|TB)/i);
    const colorMatch = folderName.match(/\(([^)]+)\)/);

    let model = 'iPhone 17';
    if (modelMatch && modelMatch[1]) {
      if (modelMatch[1].toLowerCase().includes('pro max')) {
        model = 'iPhone 17 Pro Max';
      } else if (modelMatch[1].toLowerCase().includes('pro')) {
        model = 'iPhone 17 Pro';
      } else if (modelMatch[1].toLowerCase().includes('air')) {
        model = 'iPhone 17 Air';
      }
    }

    let memory: string | null = null;
    if (memoryMatch) {
      const num = memoryMatch[1];
      const unit = memoryMatch[2].toUpperCase();
      if (unit === 'TB') {
        memory = '1TB';
      } else if (num === '512') {
        memory = '512GB';
      } else if (num === '256') {
        memory = '256GB';
      } else if (num === '128') {
        memory = '256GB'; // Маппинг
      }
    }

    let color: string | null = null;
    if (colorMatch) {
      color = colorMatch[1].trim();
      // Нормализация цветов
      const lowerColor = color.toLowerCase();
      if (lowerColor.includes('blue') || lowerColor.includes('mist blue')) {
        color = 'Blue';
      } else if (lowerColor.includes('black') || lowerColor.includes('space black')) {
        color = 'Black';
      } else if (lowerColor.includes('silver') || lowerColor.includes('white')) {
        color = 'Silver';
      } else if (lowerColor.includes('lavender')) {
        color = 'Lavender';
      } else if (lowerColor.includes('sage')) {
        color = 'Sage';
      } else if (lowerColor.includes('orange') || lowerColor.includes('cosmic orange')) {
        color = 'Cosmic Orange';
      } else if (lowerColor.includes('deep blue')) {
        color = 'Deep Blue';
      } else if (lowerColor.includes('cloud white')) {
        color = 'Cloud White';
      } else if (lowerColor.includes('light gold')) {
        color = 'Light Gold';
      } else if (lowerColor.includes('sky blue')) {
        color = 'Sky Blue';
      } else {
        color = color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
      }
    }

    return { model, memory, color };
  };

  // Функция для получения priceModifier
  const getPriceModifier = (memory: string | null): number => {
    if (!memory) return 0;
    if (memory === '1TB') return 500;
    if (memory === '512GB') return 200;
    if (memory === '256GB') return 0;
    return 0;
  };

  // Функция для создания SKU
  const createSKU = (model: string, memory: string | null, color: string | null): string => {
    const modelCode = model.includes('Pro Max') ? 'IP17PM' : 
                     model.includes('Pro') ? 'IP17P' :
                     model.includes('Air') ? 'IP17A' : 'IP17';
    const memoryCode = memory ? memory.replace('GB', '').replace('TB', 'TB') : '256';
    const colorCode = color ? color.substring(0, 2).toUpperCase().replace(/\s/g, '') : 'BL';
    return `${modelCode}-${memoryCode}-${colorCode}`;
  };

  // Сканируем папку с изображениями
  if (!fs.existsSync(PATH_IPHONE_IMAGES)) {
    console.error(`❌ Папка с изображениями не найдена: ${PATH_IPHONE_IMAGES}`);
    return;
  }

  const folders = fs.readdirSync(PATH_IPHONE_IMAGES, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name)
    .filter(name => {
      const lower = name.toLowerCase();
      return lower.includes('iphone') && lower.includes('17');
    });

  console.log(`\n📁 Найдено ${folders.length} папок с iPhone 17\n`);

  // Группируем варианты по основным моделям
  const variantsByModel = new Map<string, any[]>();

  for (const folderName of folders) {
    const { model, memory, color } = parseFolderName(folderName);
    
    // Пропускаем, если нет памяти или цвета
    if (!memory || !color) {
      continue;
    }

    // Добавляем вариант в соответствующую модель
    if (!variantsByModel.has(model)) {
      variantsByModel.set(model, []);
    }

    const folderPath = path.join(PATH_IPHONE_IMAGES, folderName);
    const images = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name)
      .filter(name => {
        const ext = path.extname(name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .sort();

    if (images.length > 0) {
      const imagesData = {
        images: images.map(img => `/api/images/${encodeURIComponent(folderName)}/${encodeURIComponent(img)}`),
        variantPath: folderName,
      };

      variantsByModel.get(model)!.push({
        color,
        memory,
        priceModifier: getPriceModifier(memory),
        sku: createSKU(model, memory, color),
        images: JSON.stringify(imagesData),
      });
    }
  }

  // Обновляем варианты для каждой модели
  console.log(`\n📦 Обновление вариантов для основных моделей...\n`);

  for (const [model, variants] of variantsByModel.entries()) {
    const slug = model.toLowerCase().replace(/\s+/g, '-');
    
    // Ищем продукт в обеих категориях (iphone и apple)
    const existingProduct = await prisma.product.findFirst({
      where: {
        OR: [
          { slug },
          { model },
        ],
      },
    });

    if (existingProduct) {
      console.log(`\n📱 ${model}:`);
      let added = 0;
      let updated = 0;

      for (const variantData of variants) {
        const existing = await prisma.productVariant.findUnique({
          where: { sku: variantData.sku },
        });

        if (existing) {
          await prisma.productVariant.update({
            where: { sku: variantData.sku },
            data: {
              color: variantData.color,
              memory: variantData.memory,
              priceModifier: variantData.priceModifier,
              images: variantData.images,
              stock: 20,
              inStock: true,
            },
          });
          updated++;
        } else {
          await prisma.productVariant.create({
            data: {
              productId: existingProduct.id,
              color: variantData.color,
              memory: variantData.memory,
              priceModifier: variantData.priceModifier,
              images: variantData.images,
              stock: 20,
              inStock: true,
              sku: variantData.sku,
            },
          });
          added++;
        }
      }

      console.log(`   ✅ Добавлено: ${added}, Обновлено: ${updated}, Всего вариантов: ${variants.length}`);
    } else {
      console.log(`   ⚠️ Продукт ${model} не найден, пропускаем`);
    }
  }

  // Проверяем итоговое состояние
  const finalIphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      variants: true,
    },
  });

  console.log(`\n✅ Восстановление завершено!`);
  console.log(`\n📊 Итоговое состояние:`);
  finalIphones.forEach(p => {
    const prices = p.variants.map(v => p.basePrice + v.priceModifier);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = minPrice === maxPrice ? `${minPrice} €` : `${minPrice} - ${maxPrice} €`;
    console.log(`   - ${p.model}: ${p.variants.length} вариантов, цена: ${priceRange}`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
