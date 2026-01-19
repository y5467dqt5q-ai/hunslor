import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('Замена заглавной фотки Blue для iPhone 17...\n');

  // Находим все варианты Blue для iPhone 17
  const variants = await prisma.productVariant.findMany({
    where: {
      sku: { startsWith: 'IP17STD-BLU' },
    },
  });

  if (variants.length === 0) {
    console.log('❌ Варианты Blue для iPhone 17 не найдены');
    return;
  }

  console.log(`✅ Найдено вариантов Blue: ${variants.length}`);

  for (const variant of variants) {
    console.log(`\n📱 Вариант: ${variant.sku} (${variant.memory})`);

    // Получаем variantPath из images JSON
    let variantPath: string | null = null;
    try {
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }
    } catch (e) {
      console.log('⚠️ Не удалось распарсить images JSON');
      continue;
    }

    if (!variantPath) {
      console.log('❌ variantPath не найден в БД');
      continue;
    }

    const folderPath = path.join(IMAGES_BASE_PATH, variantPath);
    
    if (!fs.existsSync(folderPath)) {
      console.log(`❌ Папка не найдена: ${folderPath}`);
      continue;
    }

    // Находим текущее заглавное изображение
    const images = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name)
      .filter(name => {
        const ext = path.extname(name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .sort();

    if (images.length === 0) {
      console.log(`❌ Нет изображений в папке: ${folderPath}`);
      continue;
    }

    const mainImage = images[0];
    const mainImagePath = path.join(folderPath, mainImage);

    console.log(`📁 Папка: ${variantPath}`);
    console.log(`🖼️  Текущая заглавная фотка: ${mainImage}`);
    console.log(`   Полный путь: ${mainImagePath}`);

    // Инструкция для пользователя
    console.log(`\n💡 Чтобы заменить заглавную фотку:`);
    console.log(`   1. Сохраните новое изображение в папку: ${folderPath}`);
    console.log(`   2. Переименуйте новое изображение в: ${mainImage}`);
    console.log(`   3. Или замените файл ${mainImagePath} на новое изображение`);
    console.log(`   4. После замены обновите страницу сайта`);
  }

  console.log('\n✅ Инструкция подготовлена');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
