import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Удаление выбора памяти у всех часов...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // Находим все часы
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

  let updatedCount = 0;
  let deletedVariantsCount = 0;

  for (const watch of watches) {
    console.log(`📱 ${watch.model.substring(0, 60)}...`);
    console.log(`   Вариантов: ${watch.variants.length}`);

    // Проверяем, есть ли варианты с памятью
    const variantsWithMemory = watch.variants.filter(v => 
      v.memory || v.storage || (v.sku && (v.sku.includes('256') || v.sku.includes('512') || v.sku.includes('1TB')))
    );

    if (variantsWithMemory.length === 0) {
      console.log(`   ✅ Память уже не указана, пропускаем\n`);
      continue;
    }

    // Если есть несколько вариантов с разной памятью - оставляем только один
    if (watch.variants.length > 1) {
      // Оставляем первый вариант, остальные удаляем
      const firstVariant = watch.variants[0];
      const variantsToDelete = watch.variants.slice(1);

      console.log(`   🗑️  Удаление ${variantsToDelete.length} вариантов с памятью...`);
      
      for (const variant of variantsToDelete) {
        await prisma.productVariant.delete({
          where: { id: variant.id },
        });
        deletedVariantsCount++;
      }

      // Обновляем оставшийся вариант - убираем память
      await prisma.productVariant.update({
        where: { id: firstVariant.id },
        data: {
          memory: null,
          storage: null,
        },
      });
      console.log(`   ✅ Обновлен вариант: память убрана`);
    } else if (watch.variants.length === 1) {
      // Если только один вариант - просто убираем память
      const variant = watch.variants[0];
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          memory: null,
          storage: null,
        },
      });
      console.log(`   ✅ Обновлен вариант: память убрана`);
    }

    updatedCount++;
    console.log(``);
  }

  console.log(`📊 РЕЗУЛЬТАТ:`);
  console.log(`   Обновлено товаров: ${updatedCount}`);
  console.log(`   Удалено вариантов: ${deletedVariantsCount}`);

  // Финальная проверка
  const watchesWithMemory = await prisma.product.findMany({
    where: {
      OR: [
        { category: { slug: 'smartwatches' } },
        { category: { slug: 'watch' } },
      ],
    },
    include: {
      variants: {
        where: {
          OR: [
            { memory: { not: null } },
            { storage: { not: null } },
          ],
        },
      },
    },
  });

  const watchesStillWithMemory = watchesWithMemory.filter(w => w.variants.length > 0);

  if (watchesStillWithMemory.length === 0) {
    console.log(`\n✅ ГОТОВО! У всех часов убран выбор памяти.`);
  } else {
    console.log(`\n⚠️  Еще осталось часов с памятью: ${watchesStillWithMemory.length}`);
    watchesStillWithMemory.forEach(w => {
      console.log(`   - ${w.model}`);
    });
  }

  console.log(`\n⚠️ iPhone НЕ ТРОНУТЫ - они работают как раньше!`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
