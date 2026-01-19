import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Исправление цен вариантов памяти для смартфонов...\n');

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

  for (const product of products) {
    const basePrice = product.basePrice;
    
    // Определяем правильные цены для вариантов памяти
    let price256 = 999;
    let price512 = 1149;
    
    if (product.model.includes('Galaxy S25 Ultra')) {
      price256 = 1449;
      price512 = 1649;
    } else if (product.model.includes('Galaxy S25+')) {
      price256 = 1199;
      price512 = 1349;
    } else if (product.model.includes('Galaxy S25') && !product.model.includes('Ultra') && !product.model.includes('+')) {
      price256 = 999;
      price512 = 1149;
    } else if (product.model.includes('Galaxy S24 Ultra')) {
      price256 = 1349;
      price512 = 1549;
    } else if (product.model.includes('Galaxy Flip 7')) {
      price256 = 1199;
      price512 = 1349;
    }

    console.log(`${product.model} (базовая: ${basePrice} €):`);

    // Обновляем варианты
    for (const variant of product.variants) {
      let newPriceModifier = 0;
      
      if (variant.memory === '256GB') {
        newPriceModifier = price256 - basePrice;
      } else if (variant.memory === '512GB') {
        newPriceModifier = price512 - basePrice;
      }

      const oldPrice = basePrice + (variant.priceModifier || 0);
      const newPrice = basePrice + newPriceModifier;

      if (variant.priceModifier !== newPriceModifier) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            priceModifier: newPriceModifier,
          },
        });
        console.log(`  ✅ ${variant.memory}: ${oldPrice} → ${newPrice} €`);
      } else {
        console.log(`  ℹ️  ${variant.memory}: ${newPrice} € (без изменений)`);
      }
    }
    console.log('');
  }

  console.log('✅ Готово! Цены вариантов обновлены.');
  await prisma.$disconnect();
}

main().catch(console.error);
