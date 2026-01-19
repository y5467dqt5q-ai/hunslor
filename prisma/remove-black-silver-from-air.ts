import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Удаление цветов Black и Silver из iPhone 17 Air...\n');

  const iphone17Air = await prisma.product.findFirst({
    where: {
      OR: [
        { model: 'iPhone 17 Air' },
        { slug: 'iphone-17-air' },
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

  console.log(`📱 Найден: ${iphone17Air.model}`);
  console.log(`   Вариантов до удаления: ${iphone17Air.variants.length}\n`);

  // Находим варианты с цветами Black и Silver
  const variantsToDelete = iphone17Air.variants.filter(v => 
    v.color === 'Black' || 
    v.color === 'Silver' ||
    v.color?.toLowerCase() === 'black' ||
    v.color?.toLowerCase() === 'silver'
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
