import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Удаление всех товаров, кроме iPhone 17 моделей...\n');

  const allProducts = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
  });

  // Определяем товары iPhone 17, которые нужно сохранить
  const iphone17Models = [
    'iPhone 17 Pro',
    'iPhone 17 Pro Max',
    'iPhone 17',
    'iPhone 17 Air',
  ];

  const productsToKeep: any[] = [];
  const productsToDelete: any[] = [];

  for (const product of allProducts) {
    const model = product.model;
    const isIphone17 = iphone17Models.some(iphoneModel => 
      model.includes(iphoneModel) || model.includes(iphoneModel.replace(' ', ''))
    );

    if (isIphone17) {
      productsToKeep.push(product);
    } else {
      productsToDelete.push(product);
    }
  }

  console.log(`📊 Статистика:`);
  console.log(`   ✅ Сохранить: ${productsToKeep.length} товаров`);
  console.log(`   ❌ Удалить: ${productsToDelete.length} товаров\n`);

  if (productsToDelete.length === 0) {
    console.log('✅ Нет товаров для удаления.');
    return;
  }

  // Показываем список товаров для удаления
  console.log('📋 Товары для удаления (первые 10):');
  for (const product of productsToDelete.slice(0, 10)) {
    console.log(`   - ${product.model} (ID: ${product.id})`);
  }
  if (productsToDelete.length > 10) {
    console.log(`   ... и еще ${productsToDelete.length - 10} товаров`);
  }
  console.log('');

  // Показываем список товаров для сохранения
  console.log('✅ Товары для сохранения:');
  const uniqueIphoneModels = new Set(productsToKeep.map(p => {
    const model = p.model;
    if (model.includes('iPhone 17 Pro Max')) return 'iPhone 17 Pro Max';
    if (model.includes('iPhone 17 Pro')) return 'iPhone 17 Pro';
    if (model.includes('iPhone 17 Air')) return 'iPhone 17 Air';
    if (model.includes('iPhone 17')) return 'iPhone 17';
    return model;
  }));
  for (const model of uniqueIphoneModels) {
    console.log(`   - ${model}`);
  }
  console.log('');

  // Подтверждение
  console.log('⚠️  ВНИМАНИЕ: Будут удалены все товары, кроме iPhone 17 моделей!');
  console.log('Начинаю удаление...\n');

  // Удаляем товары (варианты удалятся автоматически из-за каскадного удаления)
  let deletedCount = 0;
  let errorCount = 0;

  for (const product of productsToDelete) {
    try {
      // Сначала удаляем все варианты
      await prisma.productVariant.deleteMany({
        where: {
          productId: product.id,
        },
      });

      // Затем удаляем сам товар
      await prisma.product.delete({
        where: {
          id: product.id,
        },
      });

      deletedCount++;
      if (deletedCount % 10 === 0) {
        console.log(`   Удалено: ${deletedCount}/${productsToDelete.length}...`);
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
  console.log(`   Сохранено товаров: ${productsToKeep.length}`);

  // Проверяем результат
  const remainingProducts = await prisma.product.findMany({
    include: {
      category: true,
    },
  });

  console.log(`\n📊 Итоговое количество товаров в БД: ${remainingProducts.length}`);

  const remainingIphone17 = remainingProducts.filter(p => {
    const model = p.model;
    return iphone17Models.some(iphoneModel => 
      model.includes(iphoneModel) || model.includes(iphoneModel.replace(' ', ''))
    );
  });

  console.log(`   iPhone 17 товаров: ${remainingIphone17.length}`);
  console.log(`   Других товаров: ${remainingProducts.length - remainingIphone17.length}`);

  if (remainingProducts.length - remainingIphone17.length > 0) {
    console.log(`\n⚠️  ВНИМАНИЕ: Остались товары, которые не являются iPhone 17!`);
    for (const product of remainingProducts) {
      const model = product.model;
      const isIphone17 = iphone17Models.some(iphoneModel => 
        model.includes(iphoneModel) || model.includes(iphoneModel.replace(' ', ''))
      );
      if (!isIphone17) {
        console.log(`   - ${product.model} (ID: ${product.id})`);
      }
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
