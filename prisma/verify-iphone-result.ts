import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Проверка результата очистки iPhone...\n');

  const remaining = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      category: true,
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

  console.log(`📦 Осталось iPhone 17 товаров: ${remaining.length}\n`);

  const expectedModels = ['iPhone 17', 'iPhone 17 Pro', 'iPhone 17 Pro Max', 'iPhone 17 Air'];

  for (const product of remaining) {
    const isExpected = expectedModels.includes(product.model);
    console.log(`${isExpected ? '✅' : '❌'} ${product.model}`);
    console.log(`   Category: ${product.category.slug}`);
    console.log(`   Вариантов: ${product.variants.length}`);
    
    // Проверяем, есть ли варианты с разной памятью (для диапазона цен)
    const memories = new Set(product.variants.map(v => v.memory).filter(Boolean));
    const colors = new Set(product.variants.map(v => v.color).filter(Boolean));
    
    console.log(`   Память: ${Array.from(memories).join(', ') || 'нет'}`);
    console.log(`   Цвета: ${Array.from(colors).join(', ') || 'нет'}`);
    
    if (product.variants.length > 0) {
      const prices = product.variants.map(v => product.basePrice + v.priceModifier);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      console.log(`   Цена: ${minPrice === maxPrice ? `${minPrice} €` : `${minPrice} - ${maxPrice} €`}`);
    }
    console.log(``);
  }

  // Проверяем, что нет товаров с конкретной памятью в названии
  const hasSpecificMemory = remaining.filter(p => 
    p.model.includes('256GB') ||
    p.model.includes('512GB') ||
    p.model.includes('1TB') ||
    p.model.includes('2TB')
  );

  if (hasSpecificMemory.length > 0) {
    console.log(`\n⚠️ ВНИМАНИЕ: Найдены товары с конкретной памятью в названии:`);
    hasSpecificMemory.forEach(p => {
      console.log(`   - ${p.model}`);
    });
  } else {
    console.log(`\n✅ Все товары - основные модели без конкретной памяти в названии`);
  }

  console.log(`\n✅ Проверка завершена.`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
