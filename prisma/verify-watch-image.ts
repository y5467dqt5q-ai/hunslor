import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка изображений для Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)...\n');

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

  if (!watch) {
    console.log('❌ Товар не найден');
    return;
  }

  let variantPath: string | null = null;
  if (watch.variants.length > 0 && watch.variants[0].images) {
    try {
      const parsed = JSON.parse(watch.variants[0].images as string);
      variantPath = parsed.variantPath || null;
    } catch (e) {}
  }

  if (!variantPath) {
    variantPath = watch.folderName || null;
  }

  if (!variantPath) {
    console.log('❌ Не найден variantPath');
    return;
  }

  const folderPath = path.join(PATH_WATCHES, variantPath);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`📁 Папка: ${variantPath}`);
  console.log(`📸 Всего изображений: ${images.length}\n`);

  console.log('Список изображений по порядку:');
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ЗАГЛАВНАЯ (будет загружена первой)' : '';
    const is4th = idx === 3 ? ' 🎯 ЭТО ДОЛЖНО БЫТЬ ЗАГЛАВНОЙ' : '';
    console.log(`   ${idx + 1}. ${img}${isMain}${is4th}`);
  });

  // Проверяем, что 4-е изображение (индекс 3) действительно Untitled8
  if (images.length >= 4) {
    const fourthImage = images[3];
    const firstImage = images[0];
    
    console.log(`\n📊 Анализ:`);
    console.log(`   Текущая заглавная (1-я): ${firstImage}`);
    console.log(`   4-е изображение: ${fourthImage}`);
    
    if (firstImage === '00_main.webp' && fourthImage && !fourthImage.includes('Untitled8')) {
      console.log(`\n⚠️ Проблема: Заглавная переименована в 00_main.webp, но 4-е изображение не Untitled8!`);
      console.log(`   Возможно, нужно найти правильное 4-е изображение или оно уже было перемещено.`);
    }
    
    // Если 4-е изображение - это не то, что должно быть заглавной, исправим
    if (fourthImage && fourthImage.includes('Untitled8')) {
      console.log(`\n✅ 4-е изображение найдено: ${fourthImage}`);
      console.log(`   Если заглавная НЕ ${fourthImage}, нужно заменить.`);
    }
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
