import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Исправление вариантов iPhone: добавление storage на основе memory...\n');

  const iphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      variants: true,
    },
  });

  let updated = 0;

  for (const iphone of iphones) {
    console.log(`\n📱 ${iphone.model}:`);
    
    for (const variant of iphone.variants) {
      // Если есть memory, но нет storage - копируем memory в storage
      if (variant.memory && !variant.storage) {
        await prisma.productVariant.update({
          where: { id: variant.id },
          data: {
            storage: variant.memory as any, // Копируем memory в storage
          },
        });
        updated++;
        console.log(`   ✅ Обновлен вариант: ${variant.color || 'нет'} ${variant.memory} -> storage=${variant.memory}`);
      }
    }
  }

  console.log(`\n✅ Обновлено вариантов: ${updated}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
