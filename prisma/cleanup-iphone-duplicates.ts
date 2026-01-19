import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Очистка дубликатов iPhone и удаление отдельных товаров...\n');

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

  // Основные модели, которые нужно сохранить (только по одному экземпляру)
  const mainModels = {
    'iPhone 17': null as any,
    'iPhone 17 Pro': null as any,
    'iPhone 17 Pro Max': null as any,
    'iPhone 17 Air': null as any,
  };

  for (const iphone of allIphones) {
    const model = iphone.model;
    
    // Проверяем, является ли это основной моделью
    const isMainModel = 
      model === 'iPhone 17' ||
      model === 'iPhone 17 Pro' ||
      model === 'iPhone 17 Pro Max' ||
      model === 'iPhone 17 Air';

    // Проверяем, содержит ли название конкретную память и цвет
    const hasSpecificMemoryColor = 
      model.includes('256GB') ||
      model.includes('512GB') ||
      model.includes('1TB') ||
      model.includes('2TB') ||
      (model.includes('(') && model.match(/\d+GB\s*\(/));

    if (isMainModel && !hasSpecificMemoryColor) {
      // Это основная модель - сохраняем лучший экземпляр (с большим количеством вариантов или из категории iphone)
      const key = model as keyof typeof mainModels;
      if (!mainModels[key] || 
          iphone.variants.length > mainModels[key].variants.length ||
          (iphone.variants.length === mainModels[key].variants.length && iphone.category.slug === 'iphone')) {
        if (mainModels[key]) {
          toDelete.push(mainModels[key]);
        }
        mainModels[key] = iphone;
      } else {
        toDelete.push(iphone);
      }
    } else {
      // Это отдельный товар с конкретной памятью/цветом - удаляем
      toDelete.push(iphone);
    }
  }

  // Добавляем сохраненные модели в список
  Object.values(mainModels).forEach(model => {
    if (model) {
      toKeep.push(model);
    }
  });

  console.log(`📊 Итого:`);
  console.log(`   ✅ Сохранить: ${toKeep.length} товаров`);
  console.log(`   ❌ Удалить: ${toDelete.length} товаров\n`);

  // Показываем что сохраняем
  console.log(`✅ Товары для сохранения:`);
  toKeep.forEach(p => {
    console.log(`   - ${p.model} (${p.category.slug}, ${p.variants.length} вариантов)`);
  });

  console.log(`\n❌ Удаление ${toDelete.length} товаров...\n`);

  // Удаляем товары
  let deletedCount = 0;
  let errorCount = 0;

  for (const product of toDelete) {
    try {
      // Удаляем варианты
      if (product.variants.length > 0) {
        await prisma.productVariant.deleteMany({
          where: {
            productId: product.id,
          },
        });
      }

      // Удаляем товар
      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });

      deletedCount++;
      if (deletedCount % 10 === 0) {
        console.log(`   Удалено: ${deletedCount}/${toDelete.length}...`);
      }
    } catch (error) {
      errorCount++;
      console.error(`   ❌ Ошибка при удалении ${product.model}:`, error);
    }
  }

  console.log(`\n✅ Удаление завершено!`);
  console.log(`   Удалено товаров: ${deletedCount}`);
  if (errorCount > 0) {
    console.log(`   Ошибок: ${errorCount}`);
  }

  // Проверяем результат
  const remaining = await prisma.product.findMany({
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
  });

  console.log(`\n📊 Итоговое количество iPhone 17: ${remaining.length}`);
  remaining.forEach(p => {
    console.log(`   - ${p.model} (${p.category.slug}, ${p.variants.length} вариантов)`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
