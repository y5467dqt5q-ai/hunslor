import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Исправленные цены на основе реальных рыночных данных
const tvPrices: Record<string, number> = {
  'Samsung 55 QE55Q7F': 799,      // QLED 55" - средний класс
  'Samsung 55 QE55QN90D': 1499,   // Neo QLED 55" - премиум
  'Samsung 65 QE65QN80F': 1599,   // Neo QLED 65" - средний класс
  'Samsung 65 QE65S85F': 2299,    // QD-OLED 65" - премиум (близко к UVP 2899€)
  'Samsung 65 QE85Q7F': 1099,     // QLED 65" - средний класс
  'Samsung 75 QE75QN80F': 2199,   // Neo QLED 75" - большой размер
  'Samsung 75 QE85Q7F': 1899,     // QLED 75" - большой размер
  'Samsung 77 QE65S85F': 3499,    // QD-OLED 77" - премиум большой размер
  'Samsung 83 QE65S85F': 4499,    // QD-OLED 83" - премиум очень большой
  'Samsung 85 QE75QN80F': 2999,   // Neo QLED 85" - очень большой размер
  'Samsung 85 QE85Q7F': 2499,     // QLED 85" - очень большой размер
  'Samsung 100 QE75QN80F': 5999,  // Neo QLED 100" - эксклюзивный размер
};

async function main() {
  console.log('📺 Исправление цен на TV товары...\n');

  let updated = 0;
  let notFound = 0;

  for (const [modelName, price] of Object.entries(tvPrices)) {
    try {
      // Ищем товар по части модели (без "Samsung")
      const modelPart = modelName.replace('Samsung ', '');
      
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { model: { contains: modelPart } },
            { model: { equals: modelName } },
          ],
          category: {
            slug: 'tv',
          },
        },
      });

      if (!product) {
        console.log(`⚠️  Товар не найден: ${modelName}`);
        notFound++;
        continue;
      }

      const oldPrice = product.basePrice;
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: price,
        },
      });

      console.log(`✅ ${product.model}`);
      console.log(`   Старая цена: ${oldPrice} € → Новая цена: ${price} €`);
      updated++;
    } catch (error) {
      console.error(`❌ Ошибка при обновлении ${modelName}:`, error);
    }
  }

  console.log(`\n✅ Обновление завершено!`);
  console.log(`   Обновлено: ${updated}`);
  console.log(`   Не найдено: ${notFound}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
