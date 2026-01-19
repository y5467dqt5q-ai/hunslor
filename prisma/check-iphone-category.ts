import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка категорий iPhone...\n');

  // Проверяем категорию Smartphones
  const smartphonesCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'smartphones' },
        { name: { contains: 'Smartphone' } },
      ],
    },
    include: {
      products: {
        where: {
          OR: [
            { model: { contains: 'iPhone' } },
            { model: { contains: 'iphone' } },
          ],
        },
      },
    },
  });

  if (smartphonesCategory) {
    console.log(`📱 Категория: ${smartphonesCategory.name} (${smartphonesCategory.slug})`);
    console.log(`   iPhone в этой категории: ${smartphonesCategory.products.length}`);
    smartphonesCategory.products.forEach(p => {
      console.log(`      - ${p.model} (slug: ${p.slug})`);
    });
  } else {
    console.log('❌ Категория Smartphones не найдена!');
  }

  // Проверяем все iPhone и их категории
  console.log(`\n📦 Все iPhone и их категории:\n`);
  const allIphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      category: true,
    },
  });

  for (const iphone of allIphones) {
    console.log(`   ${iphone.model}`);
    console.log(`      Категория: ${iphone.category.name} (${iphone.category.slug})`);
    console.log(`      Slug: ${iphone.slug}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
