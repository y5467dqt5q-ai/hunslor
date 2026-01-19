import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const categories = await prisma.category.findMany({
    orderBy: { order: 'asc' },
  });
  
  console.log('Категории в базе:');
  categories.forEach(c => {
    console.log(`  - ${c.name} (slug: ${c.slug}, order: ${c.order || 'null'})`);
  });
  
  await prisma.$disconnect();
}

main().catch(console.error);
