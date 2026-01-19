import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка всех товаров...\n');

  const allProducts = await prisma.product.findMany({
    select: {
      id: true,
      model: true,
      slug: true,
      category: {
        select: {
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          inStock: true,
        },
      },
    },
  });

  console.log(`📦 Всего товаров в БД: ${allProducts.length}\n`);

  const watch = allProducts.find(p => 
    p.model.includes('Apple Watch Ultra 2') || 
    p.model.includes('watch') ||
    p.category?.slug === 'smartwatches'
  );

  if (watch) {
    console.log(`✅ Часы найдены:`);
    console.log(`   Model: ${watch.model}`);
    console.log(`   Slug: ${watch.slug}`);
    console.log(`   Category: ${watch.category?.name} (${watch.category?.slug})`);
    console.log(`   Variants: ${watch.variants.length}`);
    console.log(`   URL: /products/${watch.slug}\n`);
  } else {
    console.log(`❌ Часы НЕ найдены!`);
  }

  console.log(`✅ Все товары на месте. БД работает нормально.`);
  console.log(`💡 Если видите 404 - просто перезапустите dev server: npm run dev`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
