import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('🔥 УЛЬТИМАТИВНОЕ исправление главного изображения...\n');

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
  console.log(`📁 Папка: ${folderPath}\n`);

  // Находим целевое изображение
  const targetImageName = '758utyj.jpg-1397x1397.jpg.webp';
  const sourceImagePath = path.join(folderPath, targetImageName);
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Исходное изображение не найдено: ${sourceImagePath}`);
    return;
  }

  console.log(`✅ Найдено исходное изображение: ${targetImageName}`);

  // ШАГ 1: Удаляем ВСЕ возможные варианты главного изображения
  const mainImageVariants = [
    '00_main.webp',
    '__main.jpeg.webp',
    '__main.jpeg',
    '_main.jpg.webp',
    '_main.jpg',
    'main.webp',
    'main.jpg',
  ];

  console.log(`\n🗑️ ШАГ 1: Удаление всех старых главных изображений...`);
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

  // ШАГ 2: Ждем немного, чтобы файловая система обновилась
  await new Promise(resolve => setTimeout(resolve, 500));

  // ШАГ 3: Читаем исходный файл в буфер и записываем новый
  console.log(`\n📋 ШАГ 2: Копирование изображения через буфер...`);
  try {
    // Читаем исходный файл полностью
    const sourceBuffer = fs.readFileSync(sourceImagePath);
    const sourceStats = fs.statSync(sourceImagePath);
    
    console.log(`   Исходный файл прочитан: ${(sourceBuffer.length / 1024).toFixed(2)} KB`);
    
    // Записываем в новый файл
    const targetMainPath = path.join(folderPath, '00_main.webp');
    fs.writeFileSync(targetMainPath, sourceBuffer);
    
    // Проверяем результат
    if (fs.existsSync(targetMainPath)) {
      const targetStats = fs.statSync(targetMainPath);
      
      if (sourceBuffer.length === targetStats.size) {
        console.log(`   ✅ Файл записан успешно!`);
        console.log(`   Размер: ${(targetStats.size / 1024).toFixed(2)} KB`);
        
        // Устанавливаем время модификации на текущее время, чтобы обновить кэш
        const now = new Date();
        fs.utimesSync(targetMainPath, now, now);
        console.log(`   ✅ Время модификации обновлено: ${now.toLocaleString()}`);
      } else {
        console.log(`   ❌ Размеры не совпадают!`);
        return;
      }
    } else {
      console.log(`   ❌ Файл не был создан!`);
      return;
    }
  } catch (err) {
    console.log(`   ❌ Ошибка при копировании: ${err}`);
    return;
  }

  // ШАГ 4: Проверяем финальное состояние
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
  const mainPath = path.join(folderPath, '00_main.webp');
  const mainStats = fs.statSync(mainPath);
  
  console.log(`   Файл 00_main.webp существует: ✅`);
  console.log(`   Позиция в списке: ${mainIndex + 1} из ${allFiles.length}`);
  console.log(`   Размер: ${(mainStats.size / 1024).toFixed(2)} KB`);
  console.log(`   Время модификации: ${mainStats.mtime.toLocaleString()}`);
  
  if (mainIndex === 0) {
    console.log(`   ✅ 00_main.webp будет первым в API!`);
  } else {
    console.log(`   ⚠️ 00_main.webp НЕ первый!`);
  }

  console.log(`\n✅ Готово! Главное изображение заменено через буфер.`);
  console.log(`\n⚠️ ВАЖНО: Теперь нужно:`);
  console.log(`   1. Очистить кэш Next.js`);
  console.log(`   2. Перезапустить dev server`);
  console.log(`   3. В браузере: Ctrl+Shift+Delete → очистить весь кэш`);
  console.log(`   4. Открыть страницу в режиме инкогнито (Ctrl+Shift+N)`);
  console.log(`   5. Сделать жесткое обновление: Ctrl+F5`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
