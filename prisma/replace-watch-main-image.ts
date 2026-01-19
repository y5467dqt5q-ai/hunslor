import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔄 Замена заглавной фотки для Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // Находим товар по slug или модели
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

  console.log(`✅ Найден товар: ${watch.model}`);

  // Получаем variantPath из варианта
  let variantPath: string | null = null;
  if (watch.variants.length > 0 && watch.variants[0].images) {
    try {
      const parsed = JSON.parse(watch.variants[0].images as string);
      variantPath = parsed.variantPath || null;
    } catch (e) {
      // Игнорируем ошибки парсинга
    }
  }

  if (!variantPath) {
    variantPath = watch.folderName || null;
  }

  if (!variantPath) {
    console.log('❌ Не найден variantPath для товара');
    return;
  }

  console.log(`📁 variantPath: ${variantPath}`);

  // Ищем папку в PATH_WATCHES
  let folderPath = path.join(PATH_WATCHES, variantPath);
  if (!fs.existsSync(folderPath)) {
    // Если не найдено в PATH_WATCHES, пробуем IMAGES_BASE_PATH
    folderPath = path.join(IMAGES_BASE_PATH, variantPath);
  }

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${variantPath}`);
    return;
  }

  console.log(`✅ Папка найдена: ${folderPath}\n`);

  // Получаем все изображения (исключая резервные копии)
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  if (images.length === 0) {
    console.log('❌ Нет изображений в папке');
    return;
  }

  console.log(`📸 Всего изображений: ${images.length}`);
  images.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ЗАГЛАВНАЯ' : '';
    const isTarget = idx === 3 ? ' 🎯 ЦЕЛЕВАЯ (4-я)' : '';
    console.log(`   ${idx + 1}. ${img}${isMain}${isTarget}`);
  });

  // Проверяем, есть ли 4-е изображение (индекс 3)
  if (images.length < 4) {
    console.log(`\n❌ В галерее меньше 4 изображений (есть ${images.length})`);
    return;
  }

  const targetImage = images[3]; // 4-е изображение (индекс 3)
  const currentMain = images[0]; // Текущая заглавная

  console.log(`\n🔄 Замена:`);
  console.log(`   Текущая заглавная: ${currentMain}`);
  console.log(`   Новая заглавная (4-я): ${targetImage}`);

  // Если целевое изображение уже является заглавной, ничего не делаем
  if (targetImage === currentMain) {
    console.log(`\nℹ️ 4-е изображение уже является заглавной, ничего не делаем`);
    return;
  }

  // Сохраняем расширение целевого изображения
  const targetExt = path.extname(targetImage);

  // Создаем имя для нового заглавного изображения (00_main с правильным расширением)
  const newMainName = `00_main${targetExt}`;
  const newMainPath = path.join(folderPath, newMainName);
  const targetImagePath = path.join(folderPath, targetImage);

  // Если уже есть файл с таким именем (старая заглавная), удаляем его
  if (fs.existsSync(newMainPath) && newMainPath !== targetImagePath) {
    fs.unlinkSync(newMainPath);
    console.log(`   🗑️  Удалена старая заглавная: ${newMainName}`);
  }

  // Переименовываем 4-е изображение в новое имя (заглавная)
  fs.renameSync(targetImagePath, newMainPath);
  console.log(`   ✅ Перемещено: ${targetImage} -> ${newMainName} (теперь заглавная)`);

  console.log(`\n✅ Готово! Заглавная фотка заменена на 4-е изображение.`);
  console.log('💡 Обновите страницу сайта, чтобы увидеть изменения.');
  console.log('⚠️ iPhone НЕ ТРОНУТЫ - они работают как раньше!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
