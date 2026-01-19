import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Поиск товаров с "256GB" в названии (кроме iPhone)...\n');

  // Находим все товары с "256GB" в названии, исключая iPhone
  const products = await prisma.product.findMany({
    where: {
      AND: [
        {
          OR: [
            { model: { contains: '256GB' } },
            { model: { contains: '256 GB' } },
            { model: { contains: '256GB' } },
          ],
        },
        {
          NOT: {
            OR: [
              { model: { contains: 'iPhone' } },
              { model: { contains: 'iphone' } },
            ],
          },
        },
      ],
    },
  });

  console.log(`📦 Найдено товаров: ${products.length}\n`);

  if (products.length === 0) {
    console.log('✅ Товаров с "256GB" в названии (кроме iPhone) не найдено.');
    return;
  }

  let updated = 0;

  for (const product of products) {
    // Удаляем "256GB" и "256 GB" из названия
    let newModel = product.model
      .replace(/\s*256\s*GB\s*/gi, ' ')
      .replace(/\s*256GB\s*/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    // Убираем лишние пробелы и скобки, если остались пустые
    newModel = newModel.replace(/\s*\(\s*\)/g, '').trim();

    if (newModel !== product.model) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          model: newModel,
        },
      });
      console.log(`✅ ${product.model}`);
      console.log(`   → ${newModel}`);
      updated++;
    }
  }

  console.log(`\n📊 Итого обновлено: ${updated}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
