import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Исправление поля inStock для вариантов часов...\n');

  // Находим все часы с вариантами
  const watches = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartwatches',
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`Найдено часов: ${watches.length}`);

  let updatedCount = 0;
  
  // Обновляем поле inStock для всех вариантов часов
  for (const watch of watches) {
    if (watch.variants.length > 0) {
      const updated = await prisma.productVariant.updateMany({
        where: {
          productId: watch.id,
        },
        data: {
          inStock: true,
          stock: 20, // Устанавливаем запас
        },
      });
      updatedCount += updated.count;
      console.log(`   ${watch.model}: обновлено ${updated.count} вариантов`);
    }
  }

  console.log(`\n✅ Обновлено вариантов: ${updatedCount}`);
  console.log('✅ Готово! Поле inStock установлено для всех вариантов часов.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
