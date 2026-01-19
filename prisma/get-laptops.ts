import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Получение списка ноутбуков...\n');

  const laptops = await prisma.product.findMany({
    where: {
      category: {
        slug: 'laptops',
      },
    },
    include: {
      variants: true,
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`Найдено ноутбуков: ${laptops.length}\n`);

  for (const laptop of laptops) {
    const prices = laptop.variants.map(v => laptop.basePrice + v.priceModifier);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const priceRange = minPrice === maxPrice ? `${minPrice} €` : `${minPrice} - ${maxPrice} €`;
    
    console.log(`📱 ${laptop.model}`);
    console.log(`   Текущая цена: ${priceRange}`);
    console.log(`   Вариантов: ${laptop.variants.length}`);
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
