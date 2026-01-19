import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';
const NEW_MAIN_IMAGE = 'C:\\Users\\Вітання!\\Desktop\\_main.jpg.webp';

async function main() {
  console.log('🖼️  Замена главного изображения для всех ноутбуков...\n');

  // Проверяем, существует ли новый файл главного изображения
  if (!fs.existsSync(NEW_MAIN_IMAGE)) {
    console.log(`❌ Файл не найден: ${NEW_MAIN_IMAGE}`);
    return;
  }

  console.log(`✅ Найден файл главного изображения: ${NEW_MAIN_IMAGE}\n`);

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

  let successCount = 0;
  let errorCount = 0;

  for (const laptop of laptops) {
    try {
      // Получаем variantPath из варианта
      if (laptop.variants.length === 0) {
        console.log(`⚠️ ${laptop.model}: нет вариантов`);
        errorCount++;
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
          errorCount++;
          continue;
        }
      }

      if (!variantPath) {
        console.log(`⚠️ ${laptop.model}: нет variantPath`);
        errorCount++;
        continue;
      }

      const folderPath = path.join(LAPTOPS_PATH, variantPath);

      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ ${laptop.model}: папка не найдена: ${folderPath}`);
        errorCount++;
        continue;
      }

      console.log(`📦 Обработка: ${laptop.model.substring(0, 60)}...`);

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

      // Копируем новый файл главного изображения как 00_main.webp
      try {
        fs.copyFileSync(NEW_MAIN_IMAGE, targetMainPath);
        console.log(`   ✅ Главное изображение заменено на ${path.basename(NEW_MAIN_IMAGE)}`);
        successCount++;
      } catch (err) {
        console.log(`   ❌ Не удалось скопировать главное изображение: ${err}`);
        errorCount++;
      }

    } catch (error: any) {
      console.error(`   ❌ Ошибка при обработке ${laptop.model}:`, error.message);
      errorCount++;
    }
  }

  console.log(`\n✅ Замена завершена!`);
  console.log(`   Успешно: ${successCount} ноутбуков`);
  if (errorCount > 0) {
    console.log(`   Ошибок: ${errorCount}`);
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
