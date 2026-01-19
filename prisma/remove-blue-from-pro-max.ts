import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Удаление цвета Blue из iPhone 17 Pro Max...\n');

  const iphone17ProMax = await prisma.product.findFirst({
    where: {
      OR: [
        { model: 'iPhone 17 Pro Max' },
        { slug: 'iphone-17-pro-max' },
      ],
    },
    include: {
      variants: true,
    },
  });

  if (!iphone17ProMax) {
    console.error('❌ iPhone 17 Pro Max не найден!');
    return;
  }

  console.log(`📱 Найден: ${iphone17ProMax.model}`);
  console.log(`   Вариантов до удаления: ${iphone17ProMax.variants.length}\n`);

  // Находим варианты с цветом Blue
  const variantsToDelete = iphone17ProMax.variants.filter(v => 
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
    where: { id: iphone17ProMax.id },
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
