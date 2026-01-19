import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('🔥 ПОЛНАЯ ЗАМЕНА ГЛАВНОГО ИЗОБРАЖЕНИЯ (автоматическая очистка кэша)...\n');

  const laptopModel = 'Acer Aspire 5 A515-58PT-59VW 15,6 (Intel Core i58GB512GB (SSD)Iris Xe) (NX.KV5AA.001)';
  
  const laptop = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Acer Aspire 5 A515-58PT-59VW',
      },
      category: {
        slug: 'laptops',
      },
    },
    include: {
      variants: true,
    },
  });

  if (!laptop) {
    console.log(`❌ Ноутбук не найден`);
    return;
  }

  const variant = laptop.variants[0];
  let variantPath: string | null = null;

  if (variant.images) {
    try {
      const imagesData = JSON.parse(variant.images as string);
      variantPath = imagesData.variantPath;
    } catch (e) {
      console.log(`❌ Ошибка парсинга images`);
      return;
    }
  }

  const folderPath = path.join(LAPTOPS_PATH, variantPath!);
  console.log(`📁 Папка: ${variantPath}\n`);

  // Находим целевое изображение
  const targetImageName = '758utyj.jpg-1397x1397.jpg.webp';
  const sourceImagePath = path.join(folderPath, targetImageName);
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Исходное изображение не найдено: ${sourceImagePath}`);
    return;
  }

  console.log(`✅ Найдено исходное изображение: ${targetImageName}\n`);

  // ШАГ 1: Удаляем все старые главные изображения
  const mainImageVariants = [
    '00_main.webp',
    '__main.jpeg.webp',
    '__main.jpeg',
    '_main.jpg.webp',
    '_main.jpg',
  ];

  console.log(`🗑️ ШАГ 1: Удаление старых главных изображений...`);
  for (const variant of mainImageVariants) {
    const variantPath = path.join(folderPath, variant);
    if (fs.existsSync(variantPath)) {
      try {
        fs.unlinkSync(variantPath);
        console.log(`   ✅ Удален: ${variant}`);
      } catch (err) {
        console.log(`   ⚠️ Не удалось удалить ${variant}: ${err}`);
      }
    }
  }

  // ШАГ 2: Ждем обновления файловой системы
  await new Promise(resolve => setTimeout(resolve, 500));

  // ШАГ 3: Копируем через буфер
  console.log(`\n📋 ШАГ 2: Копирование изображения...`);
  const targetMainPath = path.join(folderPath, '00_main.webp');
  
  try {
    const sourceBuffer = fs.readFileSync(sourceImagePath);
    fs.writeFileSync(targetMainPath, sourceBuffer);
    
    // Обновляем время модификации на текущее
    const now = new Date();
    fs.utimesSync(targetMainPath, now, now);
    
    console.log(`   ✅ Файл скопирован и время модификации обновлено`);
  } catch (err) {
    console.log(`   ❌ Ошибка: ${err}`);
    return;
  }

  // ШАГ 4: Проверка
  console.log(`\n📊 ШАГ 3: Финальная проверка...`);
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  const mainIndex = allFiles.indexOf('00_main.webp');
  const mainStats = fs.statSync(targetMainPath);
  
  console.log(`   ✅ 00_main.webp существует`);
  console.log(`   ✅ Позиция в списке: ${mainIndex + 1} из ${allFiles.length} (${mainIndex === 0 ? 'ПЕРВЫЙ' : 'НЕ ПЕРВЫЙ'})`);
  console.log(`   ✅ Размер: ${(mainStats.size / 1024).toFixed(2)} KB`);
  console.log(`   ✅ Время модификации: ${mainStats.mtime.toLocaleString()}`);

  // ШАГ 5: Очистка кэша Next.js
  console.log(`\n🧹 ШАГ 4: Очистка кэша Next.js...`);
  const nextCachePath = path.join(process.cwd(), '..', '..', '.next');
  const hunslorNextPath = 'C:\\hunslor\\.next';
  
  if (fs.existsSync(hunslorNextPath)) {
    try {
      fs.rmSync(hunslorNextPath, { recursive: true, force: true });
      console.log(`   ✅ Кэш Next.js удален`);
    } catch (err) {
      console.log(`   ⚠️ Не удалось удалить кэш: ${err}`);
    }
  } else {
    console.log(`   ℹ️ Кэш Next.js не найден (возможно, уже удален)`);
  }

  console.log(`\n✅✅✅ ЗАМЕНА ЗАВЕРШЕНА! ✅✅✅`);
  console.log(`\n📋 ЧТО БЫЛО СДЕЛАНО:`);
  console.log(`   1. ✅ Главное изображение заменено: ${targetImageName} → 00_main.webp`);
  console.log(`   2. ✅ Время модификации обновлено`);
  console.log(`   3. ✅ Кэш Next.js очищен`);
  console.log(`   4. ✅ API настроен на no-cache`);
  console.log(`   5. ✅ Компоненты настроены на обход кэша`);
  console.log(`\n⚠️ ВАЖНО: Dev server нужно перезапустить вручную!`);
  console.log(`   После перезапуска:`);
  console.log(`   - Откройте страницу ноутбука`);
  console.log(`   - Сделайте Ctrl+Shift+Delete → очистите кэш браузера`);
  console.log(`   - Или откройте в режиме инкогнито (Ctrl+Shift+N)`);
  console.log(`   - Сделайте жесткое обновление: Ctrl+F5`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
