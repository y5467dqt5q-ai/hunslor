import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка вариантов iPhone на наличие storage...\n');

  const iphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      variants: {
        orderBy: [
          { memory: 'asc' },
          { color: 'asc' },
        ],
      },
    },
  });

  for (const iphone of iphones) {
    console.log(`\n📱 ${iphone.model}:`);
    
    const variantsWithStorage = iphone.variants.filter(v => v.storage);
    const variantsWithMemory = iphone.variants.filter(v => v.memory);
    const variantsWithoutStorage = iphone.variants.filter(v => !v.storage && !v.memory);
    
    console.log(`   Всего вариантов: ${iphone.variants.length}`);
    console.log(`   С storage: ${variantsWithStorage.length}`);
    console.log(`   С memory: ${variantsWithMemory.length}`);
    console.log(`   Без storage/memory: ${variantsWithoutStorage.length}`);
    
    if (variantsWithMemory.length > 0 && variantsWithStorage.length === 0) {
      console.log(`   ⚠️ ВНИМАНИЕ: Варианты используют memory вместо storage!`);
      console.log(`   Примеры вариантов:`);
      iphone.variants.slice(0, 3).forEach(v => {
        console.log(`      - ${v.color || 'нет'} ${v.memory || v.storage || 'нет'}: storage=${v.storage}, memory=${v.memory}`);
      });
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
