import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка текущих цен на камеры:\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'camera',
      },
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`Найдено камер: ${products.length}\n`);
  console.log('Текущие цены:');
  console.log('─'.repeat(80));
  
  products.forEach((product, index) => {
    console.log(`${(index + 1).toString().padStart(2, ' ')}. ${product.model}`);
    console.log(`    Цена: ${product.basePrice} €`);
    console.log('');
  });

  console.log('─'.repeat(80));
  console.log(`Всего камер: ${products.length}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
