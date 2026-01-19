import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Удаление ноутбука Acer Aspire 5 A515-58PT-59VW...\n');

  // Находим товар
  const laptop = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Acer Aspire 5 A515-58PT-59VW',
      },
      category: {
        slug: 'laptops',
      },
    },
    include: {
      variants: true,
    },
  });

  if (!laptop) {
    console.log('❌ Ноутбук не найден');
    return;
  }

  console.log(`✅ Найден товар: ${laptop.model}`);
  console.log(`   ID: ${laptop.id}`);
  console.log(`   Slug: ${laptop.slug}`);
  console.log(`   Вариантов: ${laptop.variants.length}\n`);

  // Удаляем все варианты
  if (laptop.variants.length > 0) {
    console.log('🗑️ Удаление вариантов...');
    const deletedVariants = await prisma.productVariant.deleteMany({
      where: {
        productId: laptop.id,
      },
    });
    console.log(`   ✅ Удалено вариантов: ${deletedVariants.count}`);
  }

  // Удаляем сам товар
  console.log('\n🗑️ Удаление товара...');
  await prisma.product.delete({
    where: {
      id: laptop.id,
    },
  });

  console.log(`   ✅ Товар удален: ${laptop.model}`);

  // Проверяем, что товар удален
  const check = await prisma.product.findUnique({
    where: {
      id: laptop.id,
    },
  });

  if (!check) {
    console.log(`\n✅✅✅ ТОВАР ПОЛНОСТЬЮ УДАЛЕН ✅✅✅`);
  } else {
    console.log(`\n⚠️ ВНИМАНИЕ: Товар все еще существует!`);
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
