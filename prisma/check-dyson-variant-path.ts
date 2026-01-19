import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка variantPath для Dyson Supersonic Nural (Ceramic PatinaTopaz)...\n');

  const product = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Supersonic Nural',
      },
      brand: 'Dyson',
    },
    include: {
      variants: true,
    },
  });

  if (!product) {
    console.log('❌ Товар не найден');
    return;
  }

  console.log(`✅ Найден товар: ${product.model}`);
  console.log(`   Slug: ${product.slug}`);
  console.log(`   Вариантов: ${product.variants.length}\n`);

  product.variants.forEach((variant, index) => {
    console.log(`📦 Вариант ${index + 1}:`);
    console.log(`   ID: ${variant.id}`);
    console.log(`   SKU: ${variant.sku}`);
    console.log(`   Color: ${variant.color || 'N/A'}`);
    console.log(`   Images: ${variant.images || 'N/A'}`);
    
    if (variant.images) {
      try {
        const parsed = JSON.parse(variant.images as string);
        console.log(`   Parsed images:`, JSON.stringify(parsed, null, 2));
        if (parsed.variantPath) {
          console.log(`   ✅ variantPath: ${parsed.variantPath}`);
        } else {
          console.log(`   ⚠️  variantPath не найден в images JSON`);
        }
      } catch (e) {
        console.log(`   ❌ Ошибка парсинга images: ${e}`);
      }
    }
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
