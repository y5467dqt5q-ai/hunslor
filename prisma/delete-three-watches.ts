import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Удаление 3 товаров Apple Watch Series 10...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  const modelsToDelete = [
    'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)',
    'Apple Watch Series 10 GPS + LTE, 42mm Natural Titanium Case with Natural Milanese Loop (MWXF3)',
    'Apple Watch Series 10 GPS + LTE, 42mm Slate Titanium Case with Slate Milanese Loop (MX053)',
  ];

  let deletedCount = 0;
  let variantCount = 0;

  for (const model of modelsToDelete) {
    console.log(`🔍 Поиск товара: ${model.substring(0, 60)}...`);

    const watch = await prisma.product.findFirst({
      where: {
        model: {
          contains: model,
        },
      },
      include: {
        variants: true,
      },
    });

    if (!watch) {
      console.log(`   ⚠️  Товар не найден, пропускаем\n`);
      continue;
    }

    console.log(`   ✅ Найден: ${watch.model}`);
    console.log(`   Slug: ${watch.slug}`);
    console.log(`   Вариантов: ${watch.variants.length}`);

    // Удаляем все варианты
    if (watch.variants.length > 0) {
      const deletedVariants = await prisma.productVariant.deleteMany({
        where: {
          productId: watch.id,
        },
      });
      variantCount += deletedVariants.count;
      console.log(`   🗑️  Удалено вариантов: ${deletedVariants.count}`);
    }

    // Удаляем сам товар
    await prisma.product.delete({
      where: {
        id: watch.id,
      },
    });

    deletedCount++;
    console.log(`   ✅ Товар удален\n`);
  }

  console.log(`📊 РЕЗУЛЬТАТ:`);
  console.log(`   Удалено товаров: ${deletedCount} из ${modelsToDelete.length}`);
  console.log(`   Удалено вариантов: ${variantCount}`);

  // Финальная проверка
  const remaining = await prisma.product.count({
    where: {
      OR: modelsToDelete.map(model => ({
        model: {
          contains: model,
        },
      })),
    },
  });

  if (remaining === 0) {
    console.log(`\n✅ ГОТОВО! Все 3 товара полностью удалены из БД.`);
  } else {
    console.log(`\n⚠️  В БД еще осталось товаров: ${remaining}`);
  }

  console.log('\n💡 Папки с изображениями НЕ удалены - они останутся для повторного использования.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
