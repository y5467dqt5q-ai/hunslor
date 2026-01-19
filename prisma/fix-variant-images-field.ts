import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔧 ИСПРАВЛЕНИЕ поля images в варианте товара...\n');

  // Находим товар
  const watch = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
      },
    },
    include: {
      variants: true,
    },
  });

  if (!watch || watch.variants.length === 0) {
    console.log('❌ Товар или вариант не найден');
    return;
  }

  const variant = watch.variants[0];
  
  console.log(`✅ Найден товар: ${watch.model}`);
  console.log(`   Variant ID: ${variant.id}`);
  console.log(`   Старое images: ${variant.images}\n`);

  // Правильный variantPath
  const variantPath = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  
  // Проверяем, что папка существует
  const folderPath = path.join(PATH_WATCHES, variantPath);
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  console.log(`✅ Папка найдена: ${folderPath}`);

  // Обновляем поле images
  const newImages = JSON.stringify({
    variantPath: variantPath,
  });

  console.log(`\n📝 Обновление поля images в БД...`);
  console.log(`   Новое значение: ${newImages}\n`);

  await prisma.productVariant.update({
    where: { id: variant.id },
    data: {
      images: newImages,
    },
  });

  console.log(`✅ Поле images обновлено!`);

  // Проверяем после обновления
  const updatedVariant = await prisma.productVariant.findUnique({
    where: { id: variant.id },
    select: { images: true },
  });

  console.log(`\n📋 Проверка после обновления:`);
  console.log(`   Images в БД: ${updatedVariant?.images}`);

  try {
    const parsed = JSON.parse(updatedVariant?.images as string);
    console.log(`   variantPath: ${parsed.variantPath}`);
    
    if (parsed.variantPath === variantPath) {
      console.log(`   ✅ variantPath правильный!`);
    } else {
      console.log(`   ❌ variantPath не совпадает!`);
    }
  } catch (e) {
    console.log(`   ❌ Ошибка парсинга: ${e}`);
  }

  // Проверяем файлы в папке
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Файлы в папке (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const is8473647 = img === '01_8473647.webp' ? ' ✅ ЭТО ТА КАРТИНКА' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${is8473647}`);
  });

  console.log(`\n✅ ГОТОВО! Поле images исправлено.`);
  console.log('💡 Теперь API сможет найти папку с изображениями!');
  console.log('💡 Обновите страницу с Ctrl+F5');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
