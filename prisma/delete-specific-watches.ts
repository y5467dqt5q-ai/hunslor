import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Модели часов для удаления (по SKU или части названия)
const watchesToDelete = [
  'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
  'Apple Watch Series 10 GPS + LTE, 42mm Natural Titanium Case with Natural Milanese Loop (MWXF3)',
  'Apple Watch Series 10 GPS + LTE, 42mm Slate Titanium Case with Slate Milanese Loop (MX053)',
  'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)',
];

async function main() {
  console.log('🗑️ Удаление указанных часов...\n');

  for (const watchName of watchesToDelete) {
    console.log(`🔍 Поиск: ${watchName}`);

    // Ищем товар по model
    const product = await prisma.product.findFirst({
      where: {
        model: {
          contains: watchName,
        },
        category: {
          slug: 'smartwatches',
        },
      },
      include: {
        variants: true,
      },
    });

    if (product) {
      console.log(`   ✅ Найден: ${product.model}`);
      console.log(`   📦 Вариантов: ${product.variants.length}`);

      // Удаляем варианты
      if (product.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            productId: product.id,
          },
        });
        console.log(`   ✅ Варианты удалены`);
      }

      // Удаляем товар
      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });
      console.log(`   ✅ Товар удален\n`);
    } else {
      console.log(`   ⚠️  Не найден\n`);
    }
  }

  console.log('✅ Готово! Указанные часы удалены.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
