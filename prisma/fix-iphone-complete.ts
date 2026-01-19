import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Полное исправление iPhone...\n');

  // Получаем категорию "телефоны" или "smartphones"
  const phonesCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'smartphones' },
        { slug: 'phones' },
        { slug: 'телефоны' },
        { name: { contains: 'Phone' } },
        { name: { contains: 'Smartphone' } },
      ],
    },
  });

  if (!phonesCategory) {
    console.error('❌ Категория телефонов не найдена!');
    return;
  }

  console.log(`✅ Найдена категория: ${phonesCategory.name} (${phonesCategory.slug})\n`);

  // Нормализация цветов
  const colorNormalization: Record<string, string> = {
    'light gold': 'Light Gold',
    'lightgold': 'Light Gold',
    'light-gold': 'Light Gold',
    'space black': 'Space Black',
    'spaceblack': 'Space Black',
    'space-black': 'Space Black',
    'cloud white': 'Cloud White',
    'cloudwhite': 'Cloud White',
    'cloud-white': 'Cloud White',
    'sky blue': 'Sky Blue',
    'skyblue': 'Sky Blue',
    'sky-blue': 'Sky Blue',
    'cosmic orange': 'Cosmic Orange',
    'cosmicorange': 'Cosmic Orange',
    'cosmic-orange': 'Cosmic Orange',
    'deep blue': 'Deep Blue',
    'deepblue': 'Deep Blue',
    'deep-blue': 'Deep Blue',
    'mist blue': 'Blue',
    'mistblue': 'Blue',
    'mist-blue': 'Blue',
  };

  const normalizeColor = (color: string | null): string | null => {
    if (!color) return null;
    const normalized = color.toLowerCase().trim();
    return colorNormalization[normalized] || color.charAt(0).toUpperCase() + color.slice(1).toLowerCase();
  };

  // Получаем все iPhone 17
  const iphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      category: true,
      variants: true,
    },
  });

  console.log(`📦 Найдено iPhone 17: ${iphones.length}\n`);

  for (const iphone of iphones) {
    console.log(`\n📱 Обработка: ${iphone.model}`);
    
    // Перемещаем в категорию телефонов
    if (iphone.categoryId !== phonesCategory.id) {
      await prisma.product.update({
        where: { id: iphone.id },
        data: {
          categoryId: phonesCategory.id,
        },
      });
      console.log(`   ✅ Перемещен в категорию: ${phonesCategory.name}`);
    }

    // Нормализуем цвета в вариантах
    const colorMap = new Map<string, string>();
    let updatedColors = 0;

    for (const variant of iphone.variants) {
      if (variant.color) {
        const normalized = normalizeColor(variant.color);
        if (normalized && normalized !== variant.color) {
          // Проверяем, есть ли уже вариант с нормализованным цветом
          const existingVariant = iphone.variants.find(
            v => v.id !== variant.id && 
            v.color === normalized && 
            v.memory === variant.memory &&
            v.storage === variant.storage
          );

          if (existingVariant) {
            // Если есть дубликат, удаляем текущий вариант
            console.log(`   ⚠️ Удаляем дубликат: ${variant.color} -> ${normalized} (уже есть)`);
            await prisma.productVariant.delete({
              where: { id: variant.id },
            });
          } else {
            // Обновляем цвет
            colorMap.set(variant.color, normalized);
            await prisma.productVariant.update({
              where: { id: variant.id },
              data: {
                color: normalized,
              },
            });
            updatedColors++;
          }
        }
      }
    }

    if (updatedColors > 0) {
      console.log(`   ✅ Нормализовано цветов: ${updatedColors}`);
    }

    // Проверяем и исправляем priceModifier для памяти
    let updatedPrices = 0;
    const variants = await prisma.productVariant.findMany({
      where: { productId: iphone.id },
    });

    for (const variant of variants) {
      const memory = variant.memory || variant.storage;
      let correctPriceModifier = 0;
      
      if (memory === '1TB') {
        correctPriceModifier = 500;
      } else if (memory === '512GB') {
        correctPriceModifier = 200;
      } else if (memory === '256GB') {
        correctPriceModifier = 0;
      }

      if (variant.priceModifier !== correctPriceModifier) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            priceModifier: correctPriceModifier,
          },
        });
        updatedPrices++;
      }
    }

    if (updatedPrices > 0) {
      console.log(`   ✅ Исправлено priceModifier: ${updatedPrices}`);
    }

    // Проверяем, что storage заполнен
    let updatedStorage = 0;
    for (const variant of variants) {
      if (variant.memory && !variant.storage) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            storage: variant.memory as any,
          },
        });
        updatedStorage++;
      }
    }

    if (updatedStorage > 0) {
      console.log(`   ✅ Заполнено storage: ${updatedStorage}`);
    }
  }

  // Проверяем итоговое состояние
  console.log(`\n\n📊 Итоговое состояние:\n`);
  const finalIphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      category: true,
      variants: {
        orderBy: [
          { color: 'asc' },
          { storage: 'asc' },
        ],
      },
    },
  });

  for (const iphone of finalIphones) {
    const prices = iphone.variants.map(v => iphone.basePrice + v.priceModifier);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = minPrice === maxPrice ? `${minPrice} €` : `${minPrice} - ${maxPrice} €`;
    
    const colors = Array.from(new Set(iphone.variants.map(v => v.color).filter(Boolean)));
    
    console.log(`📱 ${iphone.model}`);
    console.log(`   Категория: ${iphone.category.name}`);
    console.log(`   Вариантов: ${iphone.variants.length}`);
    console.log(`   Цена: ${priceRange}`);
    console.log(`   Цвета: ${colors.join(', ')}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
