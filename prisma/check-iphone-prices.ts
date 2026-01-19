import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('💰 Проверка цен iPhone...\n');

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
    orderBy: {
      model: 'asc',
    },
  });

  for (const iphone of iphones) {
    console.log(`📱 ${iphone.model}`);
    console.log(`   Базовая цена: ${iphone.basePrice} €`);
    console.log(`   Вариантов: ${iphone.variants.length}`);
    
    if (iphone.variants.length > 0) {
      const prices = iphone.variants.map(v => iphone.basePrice + v.priceModifier);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      
      console.log(`   Диапазон цен: ${minPrice} - ${maxPrice} €`);
      
      if (minPrice === maxPrice) {
        console.log(`   ⚠️ Все варианты имеют одинаковую цену!`);
        console.log(`   Проверка priceModifier:`);
        const modifiers = new Set(iphone.variants.map(v => v.priceModifier));
        console.log(`   Уникальные priceModifier: ${Array.from(modifiers).join(', ')}`);
      }
      
      // Показываем примеры вариантов
      console.log(`   Примеры вариантов:`);
      iphone.variants.slice(0, 3).forEach(v => {
        const price = iphone.basePrice + v.priceModifier;
        console.log(`      - ${v.memory || 'нет'} ${v.color || 'нет'}: ${price} € (modifier: ${v.priceModifier})`);
      });
    }
    console.log(``);
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
