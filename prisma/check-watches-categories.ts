import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка категорий часов...\n');

  const watches = await prisma.product.findMany({
    where: {
      OR: [
        { category: { slug: 'smartwatches' } },
        { category: { slug: 'watch' } },
        { category: { slug: 'smartwatch' } },
      ],
    },
    include: {
      category: true,
      variants: {
        take: 1,
      },
    },
    take: 5,
  });

  console.log(`📦 Найдено часов (первые 5): ${watches.length}\n`);

  for (const watch of watches) {
    console.log(`📱 ${watch.model.substring(0, 50)}...`);
    console.log(`   Category Slug: "${watch.category.slug}"`);
    console.log(`   Category Name: "${watch.category.name}"`);
    console.log(`   Is Watch: ${watch.category.slug === 'smartwatches' || watch.category.slug === 'watch' || watch.category.slug === 'smartwatch'}`);
    console.log(``);
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
