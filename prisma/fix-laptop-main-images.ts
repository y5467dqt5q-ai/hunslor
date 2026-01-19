import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('🔧 Исправление главных изображений ноутбуков...\n');

  // Получаем все ноутбуки
  const laptops = await prisma.product.findMany({
    where: {
      category: {
        slug: 'laptops',
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`📦 Найдено ноутбуков: ${laptops.length}\n`);

  for (const laptop of laptops) {
    try {
      // Получаем variantPath из варианта
      if (laptop.variants.length === 0) {
        console.log(`⚠️ ${laptop.model}: нет вариантов`);
        continue;
      }

      const variant = laptop.variants[0];
      let variantPath: string | null = null;

      if (variant.images) {
        try {
          const imagesData = JSON.parse(variant.images as string);
          variantPath = imagesData.variantPath;
        } catch (e) {
          console.log(`⚠️ ${laptop.model}: ошибка парсинга images`);
          continue;
        }
      }

      if (!variantPath) {
        console.log(`⚠️ ${laptop.model}: нет variantPath`);
        continue;
      }

      const folderPath = path.join(LAPTOPS_PATH, variantPath);

      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ ${laptop.model}: папка не найдена: ${folderPath}`);
        continue;
      }

      console.log(`📦 Обработка: ${laptop.model}`);
      console.log(`   Папка: ${variantPath}`);

      // Получаем все изображения
      const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      // Находим главное изображение (__main.jpeg или __main.jpeg.webp)
      const mainImageFile = allFiles.find(f => {
        const lower = f.toLowerCase();
        return lower === '__main.jpeg' || 
               lower === '__main.jpeg.webp' ||
               lower.includes('__main.jpeg');
      });

      if (!mainImageFile) {
        console.log(`   ⚠️ Главное изображение __main.jpeg не найдено`);
        continue;
      }

      console.log(`   📸 Найдено главное изображение: ${mainImageFile}`);

      // Удаляем старый 00_main.webp, если он существует
      const targetMainPath = path.join(folderPath, '00_main.webp');
      if (fs.existsSync(targetMainPath)) {
        try {
          fs.unlinkSync(targetMainPath);
          console.log(`   🗑️ Удален старый 00_main.webp`);
        } catch (err) {
          console.log(`   ⚠️ Не удалось удалить старый 00_main.webp: ${err}`);
        }
      }

      // Копируем главное изображение как 00_main.webp
      const mainImagePath = path.join(folderPath, mainImageFile);
      try {
        fs.copyFileSync(mainImagePath, targetMainPath);
        console.log(`   ✅ Главное изображение "${mainImageFile}" скопировано как 00_main.webp\n`);
      } catch (err) {
        console.log(`   ❌ Не удалось скопировать главное изображение: ${err}\n`);
      }

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${laptop.model}:`, error.message);
    }
  }

  console.log('✅ Исправление завершено!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
