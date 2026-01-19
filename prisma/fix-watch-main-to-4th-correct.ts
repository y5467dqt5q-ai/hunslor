import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔧 Исправление заглавной фотки: делаем 4-е изображение заглавной...\n');

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

  // Получаем все изображения, отсортированные по алфавиту (как их видит API)
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`📸 Всего изображений: ${images.length}\n`);

  console.log('Текущий порядок изображений (как их видит API):');
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ЗАГЛАВНАЯ' : '';
    const is4th = idx === 3 ? ' 🎯 4-Е (ЭТО ДОЛЖНО БЫТЬ ЗАГЛАВНЫМ)' : '';
    console.log(`   ${idx + 1}. ${img}${isMain}${is4th}`);
  });

  if (images.length < 4) {
    console.log(`\n❌ В галерее меньше 4 изображений (есть ${images.length})`);
    return;
  }

  const targetImage = images[3]; // 4-е изображение (индекс 3)
  const currentMain = images[0]; // Текущая заглавная

  console.log(`\n🔄 Замена:`);
  console.log(`   Текущая заглавная (1-я): ${currentMain}`);
  console.log(`   Новая заглавная (4-я): ${targetImage}`);

  if (targetImage === currentMain) {
    console.log(`\n✅ 4-е изображение уже является заглавной`);
    return;
  }

  // Сохраняем расширение целевого изображения
  const targetExt = path.extname(targetImage);
  const newMainName = `00_main${targetExt}`;
  const newMainPath = path.join(folderPath, newMainName);
  const targetImagePath = path.join(folderPath, targetImage);
  const currentMainPath = path.join(folderPath, currentMain);

  // Если текущая заглавная - это 00_main.webp или 00_main.*, удаляем её
  if (currentMain.startsWith('00_main') && currentMainPath !== targetImagePath) {
    fs.unlinkSync(currentMainPath);
    console.log(`   🗑️  Удалена старая заглавная: ${currentMain}`);
  }

  // Переименовываем 4-е изображение в новое имя (заглавная)
  fs.renameSync(targetImagePath, newMainPath);
  console.log(`   ✅ Перемещено: ${targetImage} -> ${newMainName} (теперь заглавная)`);

  console.log(`\n✅ Готово! 4-е изображение стало заглавной.`);
  console.log('💡 Обновите страницу с Ctrl+F5 (без кеша), чтобы увидеть изменения.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
