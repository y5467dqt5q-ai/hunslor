import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка передачи category.slug для часов...\n');

  // Находим один товар часов
  const watch = await prisma.product.findFirst({
    where: {
      OR: [
        { category: { slug: 'smartwatches' } },
        { category: { slug: 'watch' } },
      ],
    },
    include: {
      category: true,
      variants: true,
    },
  });

  if (!watch) {
    console.log('❌ Часы не найдены');
    return;
  }

  console.log(`📱 Товар: ${watch.model}`);
  console.log(`   Category Slug (прямо): ${watch.category.slug}`);
  console.log(`   Category Slug (из БД): ${watch.category.slug}`);
  
  // Имитируем JSON.parse(JSON.stringify(...))
  const serialized = JSON.parse(JSON.stringify(watch));
  console.log(`   Category Slug (после JSON): ${serialized.category?.slug}`);
  console.log(`   Category Slug (проверка): ${serialized.category?.slug === 'smartwatches' || serialized.category?.slug === 'watch' ? 'ДА' : 'НЕТ'}`);
  
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
