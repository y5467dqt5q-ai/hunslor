import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Исправление категории консолей...\n');

  // Находим обе категории
  const categoryConsoles = await prisma.category.findFirst({
    where: { slug: 'consoles' },
    include: {
      products: true,
    },
  });

  const categoryGameConsoles = await prisma.category.findFirst({
    where: { slug: 'game-consoles' },
  });

  if (categoryConsoles && categoryConsoles.products.length > 0) {
    console.log(`Найдено товаров в категории "consoles": ${categoryConsoles.products.length}`);

    if (categoryGameConsoles) {
      // Перемещаем товары в game-consoles
      console.log('Перемещение товаров в категорию "game-consoles"...');
      await prisma.product.updateMany({
        where: {
          categoryId: categoryConsoles.id,
        },
        data: {
          categoryId: categoryGameConsoles.id,
        },
      });
      console.log('✅ Товары перемещены');

      // Удаляем старую категорию
      await prisma.category.delete({
        where: { id: categoryConsoles.id },
      });
      console.log('✅ Старая категория "consoles" удалена');
    } else {
      // Переименовываем категорию
      console.log('Переименование категории "consoles" в "game-consoles"...');
      await prisma.category.update({
        where: { id: categoryConsoles.id },
        data: {
          slug: 'game-consoles',
          name: 'Game Consoles',
        },
      });
      console.log('✅ Категория переименована');
    }
  } else if (categoryGameConsoles) {
    console.log('✅ Категория "game-consoles" уже существует');
  } else {
    console.log('❌ Категории не найдены');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
