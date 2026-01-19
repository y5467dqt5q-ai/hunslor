import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Полное удаление всех 3 товаров Apple Watch Series 10...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // Ищем все товары, которые содержат нужные части названий
  const searchTerms = [
    'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)',
    'Apple Watch Series 10 GPS + LTE, 42mm Natural Titanium Case with Natural Milanese Loop (MWXF3)',
    'Apple Watch Series 10 GPS + LTE, 42mm Slate Titanium Case with Slate Milanese Loop (MX053)',
  ];

  let totalDeleted = 0;
  let totalVariantsDeleted = 0;

  for (const searchTerm of searchTerms) {
    console.log(`🔍 Поиск товаров с: ${searchTerm.substring(0, 50)}...`);

    // Ищем ВСЕ товары, которые содержат эту строку
    const watches = await prisma.product.findMany({
      where: {
        model: {
          contains: searchTerm,
        },
      },
      include: {
        variants: true,
      },
    });

    console.log(`   Найдено товаров: ${watches.length}`);

    for (const watch of watches) {
      console.log(`   🗑️  Удаление: ${watch.model}`);
      console.log(`      Slug: ${watch.slug}`);
      console.log(`      Вариантов: ${watch.variants.length}`);

      // Удаляем все варианты
      if (watch.variants.length > 0) {
        const deletedVariants = await prisma.productVariant.deleteMany({
          where: {
            productId: watch.id,
          },
        });
        totalVariantsDeleted += deletedVariants.count;
        console.log(`      ✅ Удалено вариантов: ${deletedVariants.count}`);
      }

      // Удаляем сам товар
      await prisma.product.delete({
        where: {
          id: watch.id,
        },
      });

      totalDeleted++;
      console.log(`      ✅ Товар удален\n`);
    }
  }

  console.log(`📊 ИТОГО:`);
  console.log(`   Удалено товаров: ${totalDeleted}`);
  console.log(`   Удалено вариантов: ${totalVariantsDeleted}`);

  // Финальная проверка - проверяем по slug
  const slugsToCheck = [
    'apple-watch-series-10-gps-lte-42mm-gold-titanium-case-with-gold-milanese-loop-mx083',
    'apple-watch-series-10-gps---lte--42mm-gold-titanium-case-with-gold-milanese-loop--mx083-',
    'apple-watch-series-10-gps-lte-42mm-natural-titanium-case-with-natural-milanese-loop-mwxf3',
    'apple-watch-series-10-gps---lte--42mm-natural-titanium-case-with-natural-milanese-loop--mwxf3-',
    'apple-watch-series-10-gps-lte-42mm-slate-titanium-case-with-slate-milanese-loop-mx053',
    'apple-watch-series-10-gps---lte--42mm-slate-titanium-case-with-slate-milanese-loop--mx053-',
  ];

  console.log(`\n🔍 Финальная проверка по slug...`);
  let remainingCount = 0;
  
  for (const slug of slugsToCheck) {
    const watch = await prisma.product.findUnique({
      where: { slug },
    });
    
    if (watch) {
      remainingCount++;
      console.log(`   ⚠️  Найден товар со slug: ${slug}`);
    }
  }

  if (remainingCount === 0) {
    console.log(`\n✅ ГОТОВО! Все 3 товара полностью удалены из БД.`);
  } else {
    console.log(`\n⚠️  В БД еще осталось товаров: ${remainingCount}`);
    console.log(`   Нужно удалить их вручную`);
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
