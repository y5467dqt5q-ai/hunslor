import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка памяти у часов (пустые строки)...\n');

  const watches = await prisma.product.findMany({
    where: {
      OR: [
        { category: { slug: 'smartwatches' } },
        { category: { slug: 'watch' } },
      ],
    },
    include: {
      variants: true,
      category: true,
    },
  });

  console.log(`📦 Найдено часов: ${watches.length}\n`);

  let foundEmptyStrings = false;

  for (const watch of watches) {
    for (const variant of watch.variants) {
      if (variant.memory === '' || variant.storage === '') {
        foundEmptyStrings = true;
        console.log(`⚠️  Найден вариант с пустой строкой:`);
        console.log(`   Товар: ${watch.model.substring(0, 50)}...`);
        console.log(`   Вариант ID: ${variant.id}`);
        console.log(`   memory: "${variant.memory}"`);
        console.log(`   storage: "${variant.storage}"`);
        console.log(``);
      }
    }
  }

  if (!foundEmptyStrings) {
    console.log(`✅ У всех часов память null или не указана.`);
  } else {
    console.log(`\n⚠️  Найдены варианты с пустыми строками - нужно заменить на null.`);
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
