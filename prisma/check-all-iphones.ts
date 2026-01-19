import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка всех iPhone 17...\n');

  // Находим все iPhone 17
  const allIphones = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'iPhone 17' } },
        { model: { contains: 'iphone 17' } },
      ],
    },
    include: {
      category: true,
      variants: true,
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`📦 Всего iPhone 17 товаров: ${allIphones.length}\n`);

  const toKeep: any[] = [];
  const toDelete: any[] = [];

  for (const iphone of allIphones) {
    // Проверяем, является ли это основной моделью (Pro, Pro Max, Standard, Air)
    const isMainModel = 
      iphone.model === 'iPhone 17 Pro' ||
      iphone.model === 'iPhone 17 Pro Max' ||
      iphone.model === 'iPhone 17' ||
      iphone.model === 'iPhone 17 Air' ||
      iphone.model.toLowerCase() === 'iphone 17 pro' ||
      iphone.model.toLowerCase() === 'iphone 17 pro max' ||
      iphone.model.toLowerCase() === 'iphone 17' ||
      iphone.model.toLowerCase() === 'iphone 17 air';

    // Проверяем, содержит ли название конкретную память и цвет (например, "256GB (Lavender)")
    const hasSpecificMemoryColor = 
      iphone.model.includes('256GB') ||
      iphone.model.includes('512GB') ||
      iphone.model.includes('1TB') ||
      iphone.model.includes('2TB') ||
      (iphone.model.includes('(') && iphone.model.includes(')'));

    if (isMainModel && !hasSpecificMemoryColor) {
      toKeep.push(iphone);
      console.log(`✅ СОХРАНИТЬ: ${iphone.model}`);
      console.log(`   Category: ${iphone.category.slug}`);
      console.log(`   Вариантов: ${iphone.variants.length}`);
      console.log(`   ID: ${iphone.id}`);
      console.log(``);
    } else {
      toDelete.push(iphone);
      console.log(`❌ УДАЛИТЬ: ${iphone.model}`);
      console.log(`   Category: ${iphone.category.slug}`);
      console.log(`   Вариантов: ${iphone.variants.length}`);
      console.log(`   ID: ${iphone.id}`);
      console.log(``);
    }
  }

  console.log(`\n📊 Итого:`);
  console.log(`   ✅ Сохранить: ${toKeep.length} товаров`);
  console.log(`   ❌ Удалить: ${toDelete.length} товаров`);

  // Показываем список для сохранения
  console.log(`\n✅ Товары для сохранения:`);
  toKeep.forEach(p => {
    console.log(`   - ${p.model} (${p.variants.length} вариантов)`);
  });

  // Показываем первые 10 для удаления
  console.log(`\n❌ Товары для удаления (первые 10):`);
  toDelete.slice(0, 10).forEach(p => {
    console.log(`   - ${p.model}`);
  });
  if (toDelete.length > 10) {
    console.log(`   ... и еще ${toDelete.length - 10} товаров`);
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
