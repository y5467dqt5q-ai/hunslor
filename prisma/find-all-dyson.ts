import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Поиск всех товаров Dyson...\n');

  const allDyson = await prisma.product.findMany({
    where: { brand: 'Dyson' },
    include: {
      variants: {
        select: {
          id: true,
          color: true,
          images: true,
        },
      },
    },
    orderBy: { model: 'asc' },
  });

  console.log(`Найдено товаров: ${allDyson.length}\n`);

  allDyson.forEach((product, index) => {
    console.log(`${index + 1}. ${product.model}`);
    console.log(`   Slug: ${product.slug}`);
    console.log(`   Вариантов: ${product.variants.length}`);
    
    product.variants.forEach((variant) => {
      if (variant.images) {
        try {
          const parsed = JSON.parse(variant.images as string);
          if (parsed.variantPath) {
            console.log(`   📁 variantPath: ${parsed.variantPath}`);
          }
        } catch (e) {
          // ignore
        }
      }
    });
    console.log('');
  });

  // Ищем товар с "PatinaTopaz" или "Patina Topaz"
  const targetProduct = allDyson.find(p => 
    p.model.toLowerCase().includes('patina') && 
    (p.model.toLowerCase().includes('topaz') || p.model.toLowerCase().includes('ceramic'))
  );

  if (targetProduct) {
    console.log('\n🎯 Найден целевой товар:');
    console.log(`   Model: ${targetProduct.model}`);
    console.log(`   Slug: ${targetProduct.slug}`);
    if (targetProduct.variants[0]?.images) {
      try {
        const parsed = JSON.parse(targetProduct.variants[0].images as string);
        if (parsed.variantPath) {
          console.log(`   variantPath: ${parsed.variantPath}`);
        }
      } catch (e) {
        // ignore
      }
    }
  } else {
    console.log('\n⚠️  Товар с "PatinaTopaz" не найден в базе данных');
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
