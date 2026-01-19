import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Поиск и удаление ВСЕХ товаров Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)...\n');

  // Находим ВСЕ товары с таким названием
  const watches = await prisma.product.findMany({
    where: {
      model: {
        contains: 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`📦 Найдено товаров: ${watches.length}\n`);

  if (watches.length === 0) {
    console.log('✅ Товаров не найдено - уже все удалены');
    return;
  }

  // Удаляем каждый товар
  for (const watch of watches) {
    console.log(`🗑️  Удаление товара #${watches.indexOf(watch) + 1}:`);
    console.log(`   Model: ${watch.model}`);
    console.log(`   Slug: ${watch.slug}`);
    console.log(`   ID: ${watch.id}`);
    console.log(`   Вариантов: ${watch.variants.length}`);

    // Удаляем все варианты
    if (watch.variants.length > 0) {
      const deletedVariants = await prisma.productVariant.deleteMany({
        where: {
          productId: watch.id,
        },
      });
      console.log(`   ✅ Удалено вариантов: ${deletedVariants.count}`);
    }

    // Удаляем сам товар
    await prisma.product.delete({
      where: {
        id: watch.id,
      },
    });
    console.log(`   ✅ Товар удален\n`);
  }

  // Финальная проверка
  const remaining = await prisma.product.count({
    where: {
      model: {
        contains: 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
      },
    },
  });

  if (remaining === 0) {
    console.log(`✅ ГОТОВО! Все товары удалены. Осталось в БД: ${remaining}`);
  } else {
    console.log(`⚠️  Предупреждение: В БД еще осталось товаров: ${remaining}`);
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
