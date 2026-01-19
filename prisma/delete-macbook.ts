import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️ Deleting all MacBook products...');

  // Удаляем все продукты с MacBook в названии
  const deletedProducts = await prisma.product.deleteMany({
    where: {
      OR: [
        { model: { contains: 'MacBook' } },
        { model: { contains: 'macbook' } },
        { slug: { contains: 'macbook' } },
        { slug: { contains: 'MacBook' } },
        { folderName: { contains: 'MacBook' } },
        { folderName: { contains: 'macbook' } },
      ],
    },
  });

  console.log(`✅ Deleted ${deletedProducts.count} MacBook products`);

  // Удаляем категории MacBook
  const deletedCategories = await prisma.category.deleteMany({
    where: {
      OR: [
        { slug: { contains: 'macbook' } },
        { slug: { contains: 'MacBook' } },
        { name: { contains: 'MacBook' } },
        { name: { contains: 'macbook' } },
      ],
    },
  });

  console.log(`✅ Deleted ${deletedCategories.count} MacBook categories`);
}

main()
  .catch((e) => {
    console.error('❌ Error deleting MacBook:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
