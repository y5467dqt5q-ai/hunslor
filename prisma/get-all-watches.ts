import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const watches = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartwatches',
      },
    },
    select: {
      id: true,
      model: true,
      basePrice: true,
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`Всего часов: ${watches.length}\n`);
  watches.forEach(w => {
    console.log(`${w.model}: ${w.basePrice} €`);
  });

  await prisma.$disconnect();
}

main().catch(console.error);
