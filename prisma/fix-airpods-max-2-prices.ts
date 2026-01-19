import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎧 Исправление цен на Apple AirPods Max 2...\n');

  // Официальная цена Apple AirPods Max 2 в Германии: 599 €
  const officialPrice = 599;

  // Находим все товары AirPods Max 2
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'headphones',
      },
      model: {
        contains: 'AirPods Max 2',
      },
    },
  });

  console.log(`Найдено товаров AirPods Max 2: ${products.length}\n`);

  for (const product of products) {
    const oldPrice = product.basePrice;
    
    if (oldPrice !== officialPrice) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: officialPrice,
        },
      });

      console.log(`✅ Обновлен: ${product.model}`);
      console.log(`   Цена: ${oldPrice} € → ${officialPrice} €`);
    } else {
      console.log(`ℹ️  ${product.model}: ${oldPrice} € (уже правильная цена)`);
    }
  }

  console.log('\n✅ Готово! Все цены на AirPods Max 2 обновлены до 599 €');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
