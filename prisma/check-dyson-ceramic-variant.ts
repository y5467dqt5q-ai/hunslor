import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка variantPath для Dyson Supersonic Nural (Ceramic PatinaTopaz)...\n');

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { model: { contains: 'Ceramic PatinaTopaz' } },
        { model: { contains: 'Ceramic Patina' } },
        { slug: { contains: 'ceramic' } },
      ],
      brand: 'Dyson',
    },
    include: {
      variants: true,
    },
  });

  if (!product) {
    console.log('❌ Товар не найден. Ищем все товары Dyson...\n');
    const allDyson = await prisma.product.findMany({
      where: { brand: 'Dyson' },
      select: { model: true, slug: true },
    });
    console.log('Все товары Dyson:');
    allDyson.forEach(p => console.log(`   - ${p.model} (${p.slug})`));
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
    
    if (variant.images) {
      try {
        const parsed = JSON.parse(variant.images as string);
        if (parsed.variantPath) {
          console.log(`   ✅ variantPath: ${parsed.variantPath}`);
          
          // Проверяем, существует ли папка
          const folderPath = `C:\\Users\\Вітання!\\Desktop\\dyson\\${parsed.variantPath}`;
          const fs = require('fs');
          if (fs.existsSync(folderPath)) {
            console.log(`   ✅ Папка существует: ${folderPath}`);
            const files = fs.readdirSync(folderPath)
              .filter((f: string) => f.includes('main') || f.startsWith('00_'))
              .sort();
            console.log(`   📸 Главные изображения: ${files.join(', ')}`);
          } else {
            console.log(`   ❌ Папка не найдена: ${folderPath}`);
          }
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
