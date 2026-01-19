import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Официальные цены на Samsung Galaxy (в евро, Германия/ЕС)
// Источники: Samsung.com/de, официальные магазины
const officialPrices: Record<string, { base: number; memory256: number; memory512: number }> = {
  'Samsung Galaxy S25': { base: 899, memory256: 999, memory512: 1149 },
  'Samsung Galaxy S25+': { base: 1099, memory256: 1199, memory512: 1349 },
  'Samsung Galaxy S25 Ultra': { base: 1349, memory256: 1449, memory512: 1649 },
  'Samsung Galaxy S24 Ultra': { base: 1249, memory256: 1349, memory512: 1549 },
  'Samsung Galaxy Flip 7': { base: 1099, memory256: 1199, memory512: 1349 },
};

async function main() {
  console.log('🔍 Перепроверка и обновление цен на смартфоны...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartphones',
      },
      brand: {
        not: 'Apple',
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`Найдено смартфонов: ${products.length}\n`);

  for (const product of products) {
    let newBasePrice = product.basePrice;
    let newPrice256 = 999;
    let newPrice512 = 1149;

    // Определяем правильные цены на основе модели
    if (product.model.includes('Galaxy S25 Ultra')) {
      newBasePrice = 1349;
      newPrice256 = 1449;
      newPrice512 = 1649;
    } else if (product.model.includes('Galaxy S25+')) {
      newBasePrice = 1099;
      newPrice256 = 1199;
      newPrice512 = 1349;
    } else if (product.model.includes('Galaxy S25') && !product.model.includes('Ultra') && !product.model.includes('+')) {
      newBasePrice = 899;
      newPrice256 = 999;
      newPrice512 = 1149;
    } else if (product.model.includes('Galaxy S24 Ultra')) {
      newBasePrice = 1249;
      newPrice256 = 1349;
      newPrice512 = 1549;
    } else if (product.model.includes('Galaxy Flip 7')) {
      newBasePrice = 1099;
      newPrice256 = 1199;
      newPrice512 = 1349;
    }

    // Обновляем базовую цену товара
    if (newBasePrice !== product.basePrice) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: newBasePrice,
        },
      });
      console.log(`✅ ${product.model}`);
      console.log(`   Базовая цена: ${product.basePrice} → ${newBasePrice} €`);
    } else {
      console.log(`ℹ️  ${product.model}`);
      console.log(`   Базовая цена: ${newBasePrice} € (без изменений)`);
    }

    // Обновляем цены вариантов
    for (const variant of product.variants) {
      let newPriceModifier = 0;
      
      if (variant.memory === '256GB') {
        newPriceModifier = newPrice256 - newBasePrice;
      } else if (variant.memory === '512GB') {
        newPriceModifier = newPrice512 - newBasePrice;
      }

      if (variant.priceModifier !== newPriceModifier) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            priceModifier: newPriceModifier,
          },
        });
        const oldPrice = product.basePrice + (variant.priceModifier || 0);
        const newPrice = newBasePrice + newPriceModifier;
        console.log(`   ${variant.memory}: ${oldPrice} → ${newPrice} €`);
      }
    }
    console.log('');
  }

  console.log('✅ Готово! Цены обновлены по официальным источникам.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
