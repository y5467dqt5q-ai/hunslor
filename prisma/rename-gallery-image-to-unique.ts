import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔧 Переименование 8473647.webp для уникальности...\n');

  // 1. Проверяем исходный файл
  const sourceImagePath = path.join(DESKTOP_PATH, '8473647.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Исходный файл не найден`);
    return;
  }

  // 2. Находим товар
  const watch = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)',
      },
      category: {
        slug: 'smartwatches',
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

  // 3. Получаем variantPath
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

  const folderPath = path.join(PATH_WATCHES, variantPath!);
  const oldGalleryPath = path.join(folderPath, '8473647.webp');
  const newGalleryPath = path.join(folderPath, '01_8473647.webp');

  // 4. Удаляем старый файл в галерее если есть
  if (fs.existsSync(oldGalleryPath)) {
    fs.unlinkSync(oldGalleryPath);
    console.log(`🗑️  Удален старый: 8473647.webp`);
  }

  // 5. Копируем с новым именем (01_8473647.webp - будет вторым после 00_main.webp)
  fs.copyFileSync(sourceImagePath, newGalleryPath);
  console.log(`✅ Скопирован как: 01_8473647.webp`);

  // 6. Проверяем порядок
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Финальный список (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const is8473647 = img === '01_8473647.webp' ? ' ✅ ЭТО ТА КАРТИНКА' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}${is8473647}`);
  });

  if (images[0] === '00_main.webp' && images[1] === '01_8473647.webp') {
    console.log(`\n✅ Правильный порядок: 00_main.webp -> 01_8473647.webp`);
  }

  console.log(`\n✅ Готово! Файл переименован для уникальности.`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
