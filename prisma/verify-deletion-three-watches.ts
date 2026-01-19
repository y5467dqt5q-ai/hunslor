import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка удаления 3 товаров...\n');

  const modelsToCheck = [
    'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)',
    'Apple Watch Series 10 GPS + LTE, 42mm Natural Titanium Case with Natural Milanese Loop (MWXF3)',
    'Apple Watch Series 10 GPS + LTE, 42mm Slate Titanium Case with Slate Milanese Loop (MX053)',
  ];

  for (const model of modelsToCheck) {
    const watches = await prisma.product.findMany({
      where: {
        model: {
          contains: model,
        },
      },
      include: {
        variants: true,
      },
    });

    if (watches.length === 0) {
      console.log(`✅ ${model.substring(0, 50)}... - удален`);
    } else {
      console.log(`❌ ${model.substring(0, 50)}... - НЕ удален (найдено: ${watches.length})`);
      for (const watch of watches) {
        console.log(`   Slug: ${watch.slug}`);
        console.log(`   Category: ${watch.categoryId}`);
      }
    }
  }

  console.log(`\n✅ Проверка завершена.`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
