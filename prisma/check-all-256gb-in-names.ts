import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка всех товаров на наличие "256GB" в названии...\n');

  // Находим все товары с "256GB" в названии
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: '256GB' } },
        { model: { contains: '256 GB' } },
        { model: { contains: '256GB' } },
      ],
    },
    include: {
      category: true,
    },
  });

  console.log(`📦 Найдено товаров с "256GB": ${products.length}\n`);

  const iphones: any[] = [];
  const others: any[] = [];

  for (const product of products) {
    const isIPhone = product.model.toLowerCase().includes('iphone');
    if (isIPhone) {
      iphones.push(product);
    } else {
      others.push(product);
    }
  }

  if (iphones.length > 0) {
    console.log(`📱 iPhone (не трогаем): ${iphones.length}`);
    iphones.forEach(p => {
      console.log(`   - ${p.model}`);
    });
  }

  if (others.length > 0) {
    console.log(`\n📦 Другие товары (нужно исправить): ${others.length}`);
    others.forEach(p => {
      console.log(`   - ${p.model} (${p.category.slug})`);
    });
  } else {
    console.log(`\n✅ Все товары с "256GB" - это iPhone, ничего исправлять не нужно.`);
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
