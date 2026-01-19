import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('🔍 Поиск папок с изображениями Blue для iPhone 17 Air...\n');

  const variants = await prisma.productVariant.findMany({
    where: {
      sku: { startsWith: 'IP17AIR' },
      color: 'Blue',
    },
  });

  if (variants.length === 0) {
    console.log('❌ Варианты Blue для iPhone 17 Air не найдены');
    return;
  }

  console.log(`✅ Найдено вариантов Blue: ${variants.length}\n`);

  for (const variant of variants) {
    let variantPath: string | null = null;
    try {
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }
    } catch (e) {
      console.log('⚠️ Не удалось распарсить images JSON');
    }

    if (variantPath) {
      const folderPath = path.join(IMAGES_BASE_PATH, variantPath);
      
      if (fs.existsSync(folderPath)) {
        const images = fs.readdirSync(folderPath, { withFileTypes: true })
          .filter(file => file.isFile())
          .map(file => file.name)
          .filter(name => {
            const ext = path.extname(name).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          })
          .sort();

        console.log(`📱 ${variant.sku} (${variant.memory}):`);
        console.log(`   Папка: ${variantPath}`);
        console.log(`   Полный путь: ${folderPath}`);
        
        if (images.length > 0) {
          const mainImage = images[0];
          const mainImagePath = path.join(folderPath, mainImage);
          console.log(`   🖼️  Заглавная фотка: ${mainImage}`);
          console.log(`   Полный путь к файлу: ${mainImagePath}`);
        } else {
          console.log(`   ⚠️ Нет изображений в папке`);
        }
        console.log();
      } else {
        console.log(`⚠️ Папка не найдена: ${folderPath}`);
      }
    } else {
      console.log(`⚠️ variantPath не найден для ${variant.sku}`);
    }
  }

  console.log('💡 Чтобы заменить заглавную фотку:');
  console.log('   1. Сохраните новое изображение на рабочий стол: iphone17air-blue-new.jpg');
  console.log('   2. Запустите: npx tsx prisma/replace-blue-main-air.ts');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
