import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Проверка результата удаления...\n');

  const allProducts = await prisma.product.findMany({
    include: {
      category: true,
      variants: true,
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`📦 Всего товаров в БД: ${allProducts.length}\n`);

  const iphone17Models = [
    'iPhone 17 Pro',
    'iPhone 17 Pro Max',
    'iPhone 17',
    'iPhone 17 Air',
  ];

  const iphoneProducts: any[] = [];
  const otherProducts: any[] = [];

  for (const product of allProducts) {
    const model = product.model;
    const isIphone17 = iphone17Models.some(iphoneModel => 
      model.includes(iphoneModel) || model.includes(iphoneModel.replace(' ', ''))
    );

    if (isIphone17) {
      iphoneProducts.push(product);
    } else {
      otherProducts.push(product);
    }
  }

  console.log(`✅ iPhone 17 товаров: ${iphoneProducts.length}`);
  console.log(`❌ Других товаров: ${otherProducts.length}\n`);

  if (otherProducts.length > 0) {
    console.log('⚠️  ВНИМАНИЕ: Найдены товары, которые не являются iPhone 17:');
    for (const product of otherProducts) {
      console.log(`   - ${product.model} (ID: ${product.id})`);
    }
  } else {
    console.log('✅ Отлично! Все товары являются iPhone 17 моделями.\n');
  }

  // Группируем по моделям
  const grouped: { [key: string]: number } = {};
  for (const product of iphoneProducts) {
    const model = product.model;
    let key = 'iPhone 17';
    if (model.includes('iPhone 17 Pro Max')) key = 'iPhone 17 Pro Max';
    else if (model.includes('iPhone 17 Pro')) key = 'iPhone 17 Pro';
    else if (model.includes('iPhone 17 Air')) key = 'iPhone 17 Air';
    else if (model.includes('iPhone 17')) key = 'iPhone 17';
    
    grouped[key] = (grouped[key] || 0) + 1;
  }

  console.log('📊 Распределение по моделям:');
  for (const [model, count] of Object.entries(grouped)) {
    console.log(`   ${model}: ${count} товаров`);
  }

  // Проверяем варианты
  let totalVariants = 0;
  for (const product of iphoneProducts) {
    totalVariants += product.variants.length;
  }
  console.log(`\n📦 Всего вариантов iPhone 17: ${totalVariants}`);

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
