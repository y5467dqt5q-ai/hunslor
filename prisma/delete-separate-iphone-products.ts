import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Удаление отдельных товаров iPhone с конкретной памятью и цветом...\n');

  // Находим все iPhone 17 товары
  const allIphones = await prisma.product.findMany({
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

  console.log(`📦 Всего iPhone 17 товаров: ${allIphones.length}\n`);

  const toDelete: any[] = [];

  for (const iphone of allIphones) {
    const model = iphone.model;
    
    // Проверяем, является ли это отдельным товаром (с конкретной памятью и цветом в названии)
    const hasSpecificMemoryColor = 
      (model.includes('256GB') || model.includes('512GB') || model.includes('1TB') || model.includes('2TB')) &&
      model.includes('(') && model.includes(')');

    if (hasSpecificMemoryColor) {
      toDelete.push(iphone);
      console.log(`   ❌ К удалению: ${model}`);
    } else {
      console.log(`   ✅ Оставить: ${model} (${iphone.variants.length} вариантов)`);
    }
  }

  console.log(`\n🗑️ Удаление ${toDelete.length} товаров...\n`);

  for (const product of toDelete) {
    try {
      // Удаляем варианты
      if (product.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            productId: product.id,
          },
        });
      }

      // Удаляем товар
      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });

      console.log(`   ✅ Удален: ${product.model}`);
    } catch (error) {
      console.error(`   ❌ Ошибка при удалении ${product.model}:`, error);
    }
  }

  console.log(`\n✅ Удаление завершено!`);

  // Проверяем результат
  const remaining = await prisma.product.findMany({
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

  console.log(`\n📊 Итоговое количество iPhone 17: ${remaining.length}`);
  remaining.forEach(p => {
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
