import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Полное исправление всех iPhone...\n');

  const iphones = await prisma.product.findMany({
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

  console.log(`📦 Найдено iPhone: ${iphones.length}\n`);

  for (const iphone of iphones) {
    console.log(`\n📱 Обработка: ${iphone.model} (slug: ${iphone.slug})`);

    // Исправляем slug если нужно
    const expectedSlug = iphone.model.toLowerCase().replace(/\s+/g, '-');
    if (iphone.slug !== expectedSlug) {
      await prisma.product.update({
        where: { id: iphone.id },
        data: { slug: expectedSlug },
      });
      console.log(`   ✅ Исправлен slug: ${expectedSlug}`);
    }

    // Удаляем дубликаты вариантов
    const variantMap = new Map<string, string>();
    const variantsToDelete: string[] = [];

    for (const variant of iphone.variants) {
      const key = `${variant.color || 'no-color'}-${variant.storage || variant.memory || 'no-storage'}`;
      
      if (variantMap.has(key)) {
        variantsToDelete.push(variant.id);
      } else {
        variantMap.set(key, variant.id);
      }
    }

    if (variantsToDelete.length > 0) {
      await prisma.productVariant.deleteMany({
        where: { id: { in: variantsToDelete } },
      });
      console.log(`   ✅ Удалено дубликатов: ${variantsToDelete.length}`);
    }

    // Исправляем priceModifier и storage
    const remainingVariants = await prisma.productVariant.findMany({
      where: { productId: iphone.id },
    });

    let updated = 0;
    for (const variant of remainingVariants) {
      const updates: any = {};
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

    if (updated > 0) {
      console.log(`   ✅ Обновлено вариантов: ${updated}`);
    }

    // Проверяем итоговое состояние
    const final = await prisma.product.findUnique({
      where: { id: iphone.id },
      include: { variants: true },
    });

    if (final) {
      const colors = Array.from(new Set(final.variants.map(v => v.color).filter(Boolean)));
      const prices = final.variants.map(v => final.basePrice + v.priceModifier);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      console.log(`   📊 Итого: ${final.variants.length} вариантов, ${colors.length} цветов, цена: ${minPrice} - ${maxPrice} €`);
    }
  }

  console.log(`\n✅ Все iPhone исправлены!`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
