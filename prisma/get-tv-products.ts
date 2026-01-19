import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📺 Получение всех TV товаров...\n');

  const tvProducts = await prisma.product.findMany({
    where: {
      category: {
        slug: 'tv',
      },
    },
    include: {
      variants: true,
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`Найдено товаров: ${tvProducts.length}\n`);

  tvProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product.model}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Цена: ${product.basePrice} €`);
    console.log(`   Вариантов: ${product.variants.length}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
