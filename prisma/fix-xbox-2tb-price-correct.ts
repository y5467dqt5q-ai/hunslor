import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Исправление цены для Xbox Series X 2TB...\n');

  const product = await prisma.product.findFirst({
    where: {
      model: {
        contains: '2TB',
      },
      category: {
        slug: 'consoles',
      },
    },
  });

  if (product) {
    console.log(`Найден товар: ${product.model}`);
    console.log(`Текущая цена: ${product.basePrice} €`);
    
    await prisma.product.update({
      where: { id: product.id },
      data: {
        basePrice: 799, // Официальная цена для 2TB Galaxy Black
      },
    });
    console.log(`✅ Обновлена цена: ${product.basePrice} → 799 €`);
  } else {
    console.log('❌ Товар не найден');
  }

  await prisma.$disconnect();
}

main().catch(console.error);
