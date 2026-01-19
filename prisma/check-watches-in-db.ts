import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('⌚ Проверка часов в базе данных...\n');

  const watches = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartwatches',
      },
    },
    select: {
      id: true,
      model: true,
      slug: true,
      basePrice: true,
      brand: true,
    },
  });

  console.log(`Найдено часов: ${watches.length}\n`);
  
  watches.forEach(w => {
    console.log(`- ${w.brand} ${w.model}: ${w.basePrice} €`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
