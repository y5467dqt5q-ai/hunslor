import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка товара...\n');

  // Проверяем товар
  const watch = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
      },
    },
    include: {
      variants: true,
      category: true,
    },
  });

  if (!watch) {
    console.log('❌ ТОВАР НЕ НАЙДЕН В БД!');
    console.log('Нужно восстановить товар!');
    return;
  }

  console.log(`✅ Товар найден:`);
  console.log(`   ID: ${watch.id}`);
  console.log(`   Model: ${watch.model}`);
  console.log(`   Slug: ${watch.slug}`);
  console.log(`   Category: ${watch.category.name} (${watch.category.slug})`);
  console.log(`   Вариантов: ${watch.variants.length}\n`);

  if (watch.variants.length > 0) {
    const variant = watch.variants[0];
    console.log(`✅ Вариант найден:`);
    console.log(`   ID: ${variant.id}`);
    console.log(`   Images: ${variant.images}`);
    console.log(`   SKU: ${variant.sku}`);
    console.log(`   InStock: ${variant.inStock}\n`);
  } else {
    console.log('❌ Вариантов нет!');
  }

  // Проверяем папку
  const variantPath = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, variantPath);
  
  console.log(`📂 Папка: ${folderPath}`);
  console.log(`   Существует: ${fs.existsSync(folderPath)}\n`);

  if (fs.existsSync(folderPath)) {
    const images = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile() && !file.name.startsWith('_'))
      .map(file => file.name)
      .filter(name => {
        const ext = path.extname(name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .sort();

    console.log(`📸 Изображения в папке (${images.length} шт.):`);
    images.forEach((img, idx) => {
      console.log(`  ${idx + 1}. ${img}`);
    });
  }

  console.log(`\n✅ Все на месте! Товар существует.`);
  console.log(`   URL должен быть: /products/${watch.slug}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
