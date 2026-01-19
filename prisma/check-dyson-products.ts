import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка товаров Dyson...\n');

  const dysonProducts = await prisma.product.findMany({
    where: {
      brand: 'Dyson',
    },
    include: {
      variants: true,
    },
  });

  console.log(`📦 Найдено товаров Dyson: ${dysonProducts.length}\n`);

  for (const product of dysonProducts) {
    console.log(`📱 ${product.model}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Вариантов: ${product.variants.length}`);
    
    if (product.variants.length > 0) {
      const variant = product.variants[0];
      console.log(`   Вариант: color=${variant.color}, memory=${variant.memory}, storage=${variant.storage}`);
    }
    console.log(``);
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
