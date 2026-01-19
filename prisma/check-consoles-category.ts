import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка категории консолей...\n');

  // Проверяем категорию consoles
  const categoryConsoles = await prisma.category.findFirst({
    where: { slug: 'consoles' },
    include: {
      products: {
        select: {
          model: true,
        },
      },
    },
  });

  if (categoryConsoles) {
    console.log(`✅ Категория найдена: ${categoryConsoles.name} (slug: ${categoryConsoles.slug})`);
    console.log(`   Товаров: ${categoryConsoles.products.length}`);
    categoryConsoles.products.slice(0, 5).forEach(p => {
      console.log(`   - ${p.model}`);
    });
  } else {
    console.log('❌ Категория "consoles" не найдена');
  }

  // Проверяем категорию game-consoles
  const categoryGameConsoles = await prisma.category.findFirst({
    where: { slug: 'game-consoles' },
  });

  if (categoryGameConsoles) {
    console.log(`\n✅ Категория найдена: ${categoryGameConsoles.name} (slug: ${categoryGameConsoles.slug})`);
  } else {
    console.log('\n❌ Категория "game-consoles" не найдена');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
