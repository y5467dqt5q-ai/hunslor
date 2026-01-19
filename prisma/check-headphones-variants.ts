import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎧 Проверка вариантов наушников...\n');

  const headphones = await prisma.product.findMany({
    where: {
      category: {
        slug: 'headphones',
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`Найдено товаров: ${headphones.length}\n`);

  headphones.forEach((product) => {
    console.log(`📦 ${product.model}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Вариантов: ${product.variants.length}`);
    
    product.variants.forEach((variant) => {
      console.log(`   Вариант:`);
      console.log(`     ID: ${variant.id}`);
      console.log(`     SKU: ${variant.sku}`);
      console.log(`     Color: ${variant.color || 'N/A'}`);
      console.log(`     Images: ${variant.images || 'N/A'}`);
      
      if (variant.images) {
        try {
          const parsed = JSON.parse(variant.images as string);
          if (parsed.variantPath) {
            console.log(`     ✅ variantPath: ${parsed.variantPath}`);
          } else {
            console.log(`     ⚠️  variantPath не найден`);
          }
        } catch (e) {
          console.log(`     ❌ Ошибка парсинга: ${e}`);
        }
      }
    });
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
