import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔄 Замена заглавной фотки из файла на рабочем столе...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // Ищем файл на рабочем столе
  const sourceImagePath = path.join(DESKTOP_PATH, '00_main.webp');
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Файл не найден на рабочем столе: ${sourceImagePath}`);
    return;
  }

  console.log(`✅ Найден файл на рабочем столе: 00_main.webp`);

  // Находим товар
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

  // Получаем variantPath
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

  console.log(`✅ Папка найдена: ${folderPath}\n`);

  const targetImagePath = path.join(folderPath, '00_main.webp');

  // Проверяем, существует ли уже заглавная фотка
  if (fs.existsSync(targetImagePath)) {
    // Создаем резервную копию старой заглавной
    const backupPath = path.join(folderPath, `_backup_${Date.now()}_00_main.webp`);
    fs.copyFileSync(targetImagePath, backupPath);
    console.log(`📦 Создана резервная копия старой заглавной: ${path.basename(backupPath)}`);
    
    // Удаляем старую заглавную
    fs.unlinkSync(targetImagePath);
    console.log(`🗑️  Удалена старая заглавная: 00_main.webp`);
  }

  // Копируем новый файл с рабочего стола в папку товара
  fs.copyFileSync(sourceImagePath, targetImagePath);
  console.log(`✅ Скопирован новый файл: ${sourceImagePath} -> ${targetImagePath}`);

  console.log(`\n✅ Готово! Заглавная фотка заменена.`);
  console.log('💡 Обновите страницу с Ctrl+F5 (без кеша), чтобы увидеть изменения.');
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
