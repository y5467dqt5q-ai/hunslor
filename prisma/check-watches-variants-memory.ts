import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка вариантов часов с памятью...\n');

  const watches = await prisma.product.findMany({
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
    take: 5,
  });

  console.log(`📦 Найдено часов (первые 5): ${watches.length}\n`);

  for (const watch of watches) {
    console.log(`📱 ${watch.model.substring(0, 50)}...`);
    console.log(`   Category: "${watch.category.slug}"`);
    console.log(`   Вариантов: ${watch.variants.length}`);
    
    for (const variant of watch.variants) {
      const hasMemory = variant.memory && variant.memory !== null && variant.memory !== '';
      const hasStorage = variant.storage && variant.storage !== null && variant.storage !== '';
      
      if (hasMemory || hasStorage) {
        console.log(`   ⚠️  Вариант ID ${variant.id}:`);
        console.log(`      memory: "${variant.memory}"`);
        console.log(`      storage: "${variant.storage}"`);
        console.log(`      SKU: ${variant.sku}`);
      }
    }
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
