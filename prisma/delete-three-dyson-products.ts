import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Удаление 3 товаров Dyson...\n');

  // Названия товаров для удаления
  const productsToDelete = [
    'Dyson Supersonic Nural (Vinca BlueTopaz)',
    'Dyson Supersonic Nural (Ceramic PatinaTopaz)',
    'Dyson Airwrap i.d. (Blau)',
  ];

  for (const productName of productsToDelete) {
    console.log(`🔍 Поиск товара: ${productName}...`);

    const product = await prisma.product.findFirst({
      where: {
        OR: [
          { model: { contains: productName } },
          { model: { equals: productName } },
        ],
        brand: 'Dyson',
      },
      include: {
        variants: true,
      },
    });

    if (!product) {
      // Попробуем найти по части названия
      const partialMatch = await prisma.product.findFirst({
        where: {
          model: {
            contains: productName.split('(')[0].trim(),
          },
          brand: 'Dyson',
        },
        include: {
          variants: true,
        },
      });

      if (partialMatch) {
        console.log(`   ✅ Найден товар: ${partialMatch.model}`);
        console.log(`   📦 Вариантов: ${partialMatch.variants.length}`);

        // Удаляем все варианты
        for (const variant of partialMatch.variants) {
          await prisma.productVariant.delete({
            where: { id: variant.id },
          });
          console.log(`   🗑️  Удален вариант: ${variant.id}`);
        }

        // Удаляем товар
        await prisma.product.delete({
          where: { id: partialMatch.id },
        });
        console.log(`   ✅ Товар удален: ${partialMatch.model}\n`);
      } else {
        console.log(`   ⚠️  Товар не найден: ${productName}\n`);
      }
      continue;
    }

    console.log(`   ✅ Найден товар: ${product.model}`);
    console.log(`   📦 Вариантов: ${product.variants.length}`);

    // Удаляем все варианты
    for (const variant of product.variants) {
      await prisma.productVariant.delete({
        where: { id: variant.id },
      });
      console.log(`   🗑️  Удален вариант: ${variant.id}`);
    }

    // Удаляем товар
    await prisma.product.delete({
      where: { id: product.id },
    });
    console.log(`   ✅ Товар удален: ${product.model}\n`);
  }

  console.log('✅ Готово! Все указанные товары удалены.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
