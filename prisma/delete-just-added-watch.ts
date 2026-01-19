import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Удаление только что добавленного товара...\n');

  // Находим товар по slug, который мы только что создали
  const watch = await prisma.product.findFirst({
    where: {
      slug: 'apple-watch-ultra-2-49mm-gps-plus-lte-black-titanium-case-with-black-ocean-band-mx4p3',
    },
    include: {
      variants: true,
    },
  });

  if (!watch) {
    console.log('❌ Товар не найден');
    return;
  }

  console.log(`✅ Найден товар: ${watch.model}`);
  console.log(`   Slug: ${watch.slug}`);
  console.log(`   ID: ${watch.id}`);
  console.log(`   Вариантов: ${watch.variants.length}\n`);

  // Удаляем все варианты
  if (watch.variants.length > 0) {
    console.log(`🗑️  Удаление вариантов...`);
    const deletedVariants = await prisma.productVariant.deleteMany({
      where: {
        productId: watch.id,
      },
    });
    console.log(`   ✅ Удалено вариантов: ${deletedVariants.count}`);
  }

  // Удаляем сам товар
  console.log(`\n🗑️  Удаление товара...`);
  await prisma.product.delete({
    where: {
      id: watch.id,
    },
  });

  console.log(`   ✅ Товар удален: ${watch.model}`);

  // Проверяем, что товар удален
  const check = await prisma.product.findUnique({
    where: { id: watch.id },
  });

  if (!check) {
    console.log(`\n✅ Подтверждение: товар полностью удален из БД`);
  } else {
    console.log(`\n⚠️  Предупреждение: товар все еще существует!`);
  }

  console.log(`\n✅ ГОТОВО! Товар удален.`);
  console.log('💡 Папка с изображениями НЕ удалена - она останется для повторного использования.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
