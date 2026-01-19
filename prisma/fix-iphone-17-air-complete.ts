import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Полное исправление iPhone 17 Air...\n');

  // Находим iPhone 17 Air
  const iphone17Air = await prisma.product.findFirst({
    where: {
      OR: [
        { model: 'iPhone 17 Air' },
        { model: 'iphone 17 air' },
        { slug: 'iphone-17-air' },
        { slug: 'apple-iphone-17-air' },
      ],
    },
    include: {
      variants: true,
    },
  });

  if (!iphone17Air) {
    console.error('❌ iPhone 17 Air не найден!');
    return;
  }

  console.log(`📱 Найден: ${iphone17Air.model} (slug: ${iphone17Air.slug})\n`);

  // Исправляем slug если нужно
  if (iphone17Air.slug !== 'iphone-17-air') {
    await prisma.product.update({
      where: { id: iphone17Air.id },
      data: {
        slug: 'iphone-17-air',
        model: 'iPhone 17 Air',
      },
    });
    console.log(`✅ Исправлен slug: iphone-17-air`);
  }

  // Группируем варианты по цвету и памяти, удаляем дубликаты
  const variantMap = new Map<string, any>();
  const variantsToDelete: string[] = [];

  for (const variant of iphone17Air.variants) {
    const key = `${variant.color || 'no-color'}-${variant.storage || variant.memory || 'no-storage'}`;
    
    if (variantMap.has(key)) {
      // Дубликат - удаляем
      variantsToDelete.push(variant.id);
      console.log(`   ⚠️ Дубликат: ${variant.color} ${variant.storage || variant.memory} (ID: ${variant.id})`);
    } else {
      variantMap.set(key, variant);
    }
  }

  // Удаляем дубликаты
  if (variantsToDelete.length > 0) {
    await prisma.productVariant.deleteMany({
      where: {
        id: { in: variantsToDelete },
      },
    });
    console.log(`✅ Удалено дубликатов: ${variantsToDelete.length}`);
  }

  // Обновляем оставшиеся варианты: добавляем model: 'Air' и исправляем priceModifier
  const remainingVariants = await prisma.productVariant.findMany({
    where: { productId: iphone17Air.id },
  });

  let updated = 0;
  for (const variant of remainingVariants) {
    const updates: any = {};

    // Исправляем priceModifier на основе памяти
    const memory = variant.storage || variant.memory;
    let correctPriceModifier = 0;
    if (memory === '1TB') {
      correctPriceModifier = 500;
    } else if (memory === '512GB') {
      correctPriceModifier = 200;
    } else if (memory === '256GB') {
      correctPriceModifier = 0;
    }

    if (variant.priceModifier !== correctPriceModifier) {
      updates.priceModifier = correctPriceModifier;
    }

    // Убеждаемся, что storage заполнен
    if (variant.memory && !variant.storage) {
      updates.storage = variant.memory;
    }

    if (Object.keys(updates).length > 0) {
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: updates,
      });
      updated++;
    }
  }

  console.log(`✅ Обновлено вариантов: ${updated}`);

  // Проверяем итоговое состояние
  const final = await prisma.product.findUnique({
    where: { id: iphone17Air.id },
    include: {
      variants: {
        orderBy: [
          { color: 'asc' },
          { storage: 'asc' },
        ],
      },
    },
  });

  if (final) {
    console.log(`\n📊 Итоговое состояние:`);
    console.log(`   Модель: ${final.model}`);
    console.log(`   Slug: ${final.slug}`);
    console.log(`   Вариантов: ${final.variants.length}`);
    
    const colors = Array.from(new Set(final.variants.map(v => v.color).filter(Boolean)));
    console.log(`   Уникальных цветов: ${colors.length}`);
    console.log(`   Цвета: ${colors.join(', ')}`);
    
    const models = new Set(final.variants.map(v => (v as any).model || 'нет'));
    console.log(`   Модели в вариантах: ${Array.from(models).join(', ')}`);
    
    const prices = final.variants.map(v => final.basePrice + v.priceModifier);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    console.log(`   Цена: ${minPrice} - ${maxPrice} €`);
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
