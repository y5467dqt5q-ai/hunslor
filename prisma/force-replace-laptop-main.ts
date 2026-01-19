import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('🔄 Принудительная замена главного изображения...\n');

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

  // Находим нужное изображение (758utyj.jpg-1397x1397.jpg.webp)
  const targetImageName = '758utyj.jpg-1397x1397.jpg.webp';
  const sourceImagePath = path.join(folderPath, targetImageName);
  
  if (!fs.existsSync(sourceImagePath)) {
    console.log(`❌ Исходное изображение не найдено: ${sourceImagePath}`);
    return;
  }

  console.log(`✅ Найдено исходное изображение: ${targetImageName}`);

  // Удаляем ВСЕ возможные варианты главного изображения
  const mainImageVariants = [
    '00_main.webp',
    '__main.jpeg.webp',
    '__main.jpeg',
    '_main.jpg.webp',
    '_main.jpg',
  ];

  for (const variant of mainImageVariants) {
    const variantPath = path.join(folderPath, variant);
    if (fs.existsSync(variantPath)) {
      try {
        fs.unlinkSync(variantPath);
        console.log(`   🗑️ Удален: ${variant}`);
      } catch (err) {
        console.log(`   ⚠️ Не удалось удалить ${variant}: ${err}`);
      }
    }
  }

  // Копируем новое изображение как 00_main.webp
  const targetMainPath = path.join(folderPath, '00_main.webp');
  
  try {
    // Убеждаемся, что файл не существует
    if (fs.existsSync(targetMainPath)) {
      fs.unlinkSync(targetMainPath);
    }
    
    // Копируем с проверкой
    fs.copyFileSync(sourceImagePath, targetMainPath);
    
    // Проверяем, что файл скопирован правильно
    if (fs.existsSync(targetMainPath)) {
      const sourceStats = fs.statSync(sourceImagePath);
      const targetStats = fs.statSync(targetMainPath);
      
      if (sourceStats.size === targetStats.size) {
        console.log(`   ✅ Файл скопирован успешно!`);
        console.log(`   Размер: ${(targetStats.size / 1024).toFixed(2)} KB`);
        console.log(`   Время изменения: ${targetStats.mtime.toLocaleString()}`);
      } else {
        console.log(`   ⚠️ Размеры не совпадают!`);
      }
    } else {
      console.log(`   ❌ Файл не был создан!`);
      return;
    }
  } catch (err) {
    console.log(`   ❌ Ошибка при копировании: ${err}`);
    return;
  }

  // Проверяем сортировку - убеждаемся, что 00_main.webp будет первым
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  const mainIndex = allFiles.indexOf('00_main.webp');
  console.log(`\n📊 Проверка сортировки:`);
  console.log(`   Всего файлов: ${allFiles.length}`);
  console.log(`   Позиция 00_main.webp: ${mainIndex + 1}`);
  console.log(`   Первый файл в списке: ${allFiles[0]}`);
  
  if (mainIndex === 0) {
    console.log(`   ✅ 00_main.webp будет первым в API!`);
  } else {
    console.log(`   ⚠️ 00_main.webp НЕ первый! Нужно переименовать.`);
  }

  console.log(`\n✅ Готово! Главное изображение заменено.`);
  console.log(`\n⚠️ ВАЖНО: Очистите кэш Next.js:`);
  console.log(`   1. Остановите dev server (Ctrl+C)`);
  console.log(`   2. Удалите папку .next: rmdir /s /q .next`);
  console.log(`   3. Запустите dev server снова: npm run dev`);
  console.log(`   4. В браузере: Ctrl+Shift+Delete → очистите кэш`);
  console.log(`   5. Или откройте страницу в режиме инкогнито`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
