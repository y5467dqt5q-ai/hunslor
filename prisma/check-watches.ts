import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const watches = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartwatches',
      },
    },
    include: {
      variants: true,
      category: true,
    },
  });

  console.log(`Всего часов в БД: ${watches.length}\n`);
  
  watches.slice(0, 10).forEach((w, idx) => {
    console.log(`${idx + 1}. ${w.model}`);
    console.log(`   Slug: ${w.slug}`);
    console.log(`   Category: ${w.category.slug} (${w.category.name})`);
    console.log(`   Вариантов: ${w.variants.length}`);
    console.log(`   InStock: ${w.inStock}`);
    if (w.variants.length > 0) {
      const variant = w.variants[0];
      const images = JSON.parse(variant.images as string || '{}');
      console.log(`   variantPath: ${images.variantPath || 'не найден'}`);
    }
    console.log();
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
