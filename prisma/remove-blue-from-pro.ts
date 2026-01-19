import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Удаление цвета Blue из iPhone 17 Pro...\n');

  const iphone17Pro = await prisma.product.findFirst({
    where: {
      OR: [
        { model: 'iPhone 17 Pro' },
        { slug: 'iphone-17-pro' },
      ],
    },
    include: {
      variants: true,
    },
  });

  if (!iphone17Pro) {
    console.error('❌ iPhone 17 Pro не найден!');
    return;
  }

  console.log(`📱 Найден: ${iphone17Pro.model}`);
  console.log(`   Вариантов до удаления: ${iphone17Pro.variants.length}\n`);

  // Находим варианты с цветом Blue
  const variantsToDelete = iphone17Pro.variants.filter(v => 
    v.color === 'Blue' || 
    v.color?.toLowerCase() === 'blue'
  );

  console.log(`   Найдено вариантов для удаления: ${variantsToDelete.length}`);
  variantsToDelete.forEach(v => {
    console.log(`      - ${v.color} ${v.storage || v.memory} (ID: ${v.id})`);
  });

  if (variantsToDelete.length > 0) {
    await prisma.productVariant.deleteMany({
      where: {
        id: { in: variantsToDelete.map(v => v.id) },
      },
    });
    console.log(`\n✅ Удалено вариантов: ${variantsToDelete.length}`);
  }

  // Проверяем итоговое состояние
  const final = await prisma.product.findUnique({
    where: { id: iphone17Pro.id },
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
    const colors = Array.from(new Set(final.variants.map(v => v.color).filter(Boolean)));
    console.log(`\n📊 Итоговое состояние:`);
    console.log(`   Вариантов: ${final.variants.length}`);
    console.log(`   Цвета: ${colors.join(', ')}`);
    
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
