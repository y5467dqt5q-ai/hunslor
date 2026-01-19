import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🏠 Создание категории Smart Home...\n');

  // Создаем или обновляем категорию
  const category = await prisma.category.upsert({
    where: { slug: 'smart-home' },
    update: {
      name: 'Smart Home',
      icon: '🏠',
      order: 10,
    },
    create: {
      name: 'Smart Home',
      slug: 'smart-home',
      icon: '🏠',
      order: 10,
    },
  });

  console.log(`✅ Категория создана: ${category.name} (slug: ${category.slug})`);

  await prisma.$disconnect();
}

main().catch(console.error);
