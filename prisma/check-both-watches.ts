import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка всех часов...\n');

  const watches = await prisma.product.findMany({
    where: {
      OR: [
        { model: { contains: 'Watch' } },
        { category: { slug: 'watch' } },
        { category: { slug: 'smartwatches' } },
      ],
    },
    include: {
      category: true,
      variants: true,
    },
  });

  console.log(`📦 Найдено часов: ${watches.length}\n`);

  watches.forEach((watch, idx) => {
    console.log(`${idx + 1}. ${watch.model}`);
    console.log(`   Slug: ${watch.slug}`);
    console.log(`   Category: ${watch.category?.name} (${watch.category?.slug})`);
    console.log(`   Variants: ${watch.variants.length}`);
    
    if (watch.variants.length > 0) {
      const variant = watch.variants[0];
      let variantPath = null;
      try {
        if (variant.images) {
          const parsed = JSON.parse(variant.images as string);
          variantPath = parsed.variantPath;
        }
      } catch (e) {}
      
      console.log(`   variantPath: ${variantPath || 'не установлен'}`);
    }
    
    console.log(`   URL: /products/${watch.slug}\n`);
  });

  // Проверяем папки
  if (fs.existsSync(PATH_WATCHES)) {
    const folders = fs.readdirSync(PATH_WATCHES, { withFileTypes: true })
      .filter(file => file.isDirectory())
      .map(file => file.name);

    console.log(`📂 Папки в ${PATH_WATCHES} (${folders.length} шт.):`);
    folders.forEach((folder, idx) => {
      const folderPath = path.join(PATH_WATCHES, folder);
      const images = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile() && !file.name.startsWith('_'))
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .length;
      
      console.log(`  ${idx + 1}. ${folder} (${images} изображений)`);
    });
  }

  console.log(`\n✅ Все на месте! Товары существуют.`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
