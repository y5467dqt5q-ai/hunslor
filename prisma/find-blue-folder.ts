import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';
const PATH_17_AIR = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';

async function main() {
  console.log('Поиск папки с изображениями Blue для iPhone 17...\n');

  // Находим вариант Blue для iPhone 17
  const variant = await prisma.productVariant.findFirst({
    where: {
      sku: { startsWith: 'IP17STD-BLU' },
    },
    include: {
      product: {
        select: { slug: true },
      },
    },
  });

  if (!variant) {
    console.log('❌ Вариант Blue для iPhone 17 не найден');
    return;
  }

  console.log('✅ Найден вариант:');
  console.log('   SKU:', variant.sku);
  console.log('   Цвет:', variant.color);
  console.log('   Память:', variant.memory);

  // Получаем variantPath из images JSON
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
    console.log('\n📁 variantPath из БД:', variantPath);

    // Ищем папку в разных местах
    let folderPath: string | null = null;

    // Проверяем в IMAGES_BASE_PATH
    const path1 = path.join(IMAGES_BASE_PATH, variantPath);
    if (fs.existsSync(path1)) {
      folderPath = path1;
      console.log('✅ Папка найдена в IMAGES_BASE_PATH:', folderPath);
    } else {
      // Проверяем в PATH_17_AIR
      const path2 = path.join(PATH_17_AIR, variantPath);
      if (fs.existsSync(path2)) {
        folderPath = path2;
        console.log('✅ Папка найдена в PATH_17_AIR:', folderPath);
      }
    }

    if (folderPath) {
      const images = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      console.log(`\n📸 Изображения в папке (${images.length} шт.):`);
      images.forEach((img, idx) => {
        const isMain = idx === 0 ? ' ⭐ ЗАГЛАВНАЯ' : '';
        console.log(`   ${idx + 1}. ${img}${isMain}`);
      });

      if (images.length > 0) {
        const mainImage = images[0];
        const mainImagePath = path.join(folderPath, mainImage);
        console.log(`\n🖼️  Текущая заглавная фотка: ${mainImage}`);
        console.log(`   Полный путь: ${mainImagePath}`);
        console.log(`\n💡 Чтобы заменить заглавную фотку:`);
        console.log(`   1. Сохраните новое изображение с именем: ${mainImage}`);
        console.log(`   2. Или переименуйте существующие изображения`);
        console.log(`   3. Или замените файл ${mainImagePath} на новое изображение`);
      }
    } else {
      console.log('❌ Папка не найдена ни в IMAGES_BASE_PATH, ни в PATH_17_AIR');
      console.log('   Проверьте, скопированы ли папки в pictr');
    }
  } else {
    console.log('❌ variantPath не найден в БД');
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
