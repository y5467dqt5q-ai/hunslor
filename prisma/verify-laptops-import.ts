import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('✅ Проверка импорта ноутбуков...\n');

  const laptops = await prisma.product.findMany({
    where: {
      category: {
        slug: 'laptops',
      },
    },
    include: {
      category: true,
      variants: true,
    },
  });

  console.log(`📦 Всего ноутбуков: ${laptops.length}\n`);

  for (const laptop of laptops) {
    console.log(`💻 ${laptop.model}`);
    console.log(`   Category: ${laptop.category.slug}`);
    console.log(`   Вариантов: ${laptop.variants.length}`);
    
    if (laptop.variants.length > 0) {
      const v = laptop.variants[0];
      console.log(`   Первый вариант:`);
      console.log(`      color: ${v.color || 'null'}`);
      console.log(`      memory: ${v.memory || 'null'}`);
      console.log(`      storage: ${v.storage || 'null'}`);
      console.log(`      inStock: ${v.inStock}`);
      console.log(`      stock: ${v.stock}`);
      
      // Проверяем images JSON
      if (v.images) {
        try {
          const imagesData = JSON.parse(v.images as string);
          console.log(`      variantPath: ${imagesData.variantPath || 'не найден'}`);
        } catch (e) {
          console.log(`      images: ${v.images}`);
        }
      }
    }
    console.log(``);
  }

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
