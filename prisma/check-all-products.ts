import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка всех товаров в БД...\n');

  const allProducts = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`📦 Всего товаров: ${allProducts.length}\n`);

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
      console.log(`✅ СОХРАНИТЬ: ${product.model}`);
      console.log(`   Category: ${product.category.name} (${product.category.slug})`);
      console.log(`   Вариантов: ${product.variants.length}`);
      console.log(`   ID: ${product.id}`);
      console.log(``);
    } else {
      productsToDelete.push(product);
      console.log(`❌ УДАЛИТЬ: ${product.model}`);
      console.log(`   Category: ${product.category.name} (${product.category.slug})`);
      console.log(`   Вариантов: ${product.variants.length}`);
      console.log(`   ID: ${product.id}`);
      console.log(``);
    }
  }

  console.log(`\n📊 Итого:`);
  console.log(`   ✅ Сохранить: ${productsToKeep.length} товаров`);
  console.log(`   ❌ Удалить: ${productsToDelete.length} товаров`);

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
