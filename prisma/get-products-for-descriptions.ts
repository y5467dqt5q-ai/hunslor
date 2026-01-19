import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📦 Получение списка продуктов для добавления описаний...\n');

  // Получаем ноутбуки
  const laptops = await prisma.product.findMany({
    where: {
      category: {
        slug: 'laptops',
      },
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`Ноутбуков: ${laptops.length}`);
  laptops.forEach(l => {
    console.log(`   - ${l.model}`);
  });

  // Получаем iPhone
  const iphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`\niPhone: ${iphones.length}`);
  iphones.forEach(i => {
    console.log(`   - ${i.model}`);
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
