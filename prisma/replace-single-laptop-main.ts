import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';
const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';

async function main() {
  console.log('🖼️  Замена главного изображения для конкретного ноутбука...\n');

  // Находим ноутбук по модели
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
    console.log(`❌ Ноутбук не найден: ${laptopModel}`);
    return;
  }

  console.log(`✅ Найден ноутбук: ${laptop.model}\n`);

  // Получаем variantPath
  if (laptop.variants.length === 0) {
    console.log(`❌ Нет вариантов для ноутбука`);
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

  if (!variantPath) {
    console.log(`❌ Нет variantPath`);
    return;
  }

  const folderPath = path.join(LAPTOPS_PATH, variantPath);
  console.log(`📁 Папка ноутбука: ${folderPath}\n`);

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  // Ищем новое изображение - проверяем несколько возможных мест
  let newImagePath: string | null = null;
  
  // Вариант 1: Ищем в папке ноутбука изображение, которое может быть новым главным
  // (например, самое большое по размеру или последнее измененное)
  const imagesInFolder = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => {
      const filePath = path.join(folderPath, file.name);
      const stats = fs.statSync(filePath);
      return {
        name: file.name,
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
      };
    })
    .filter(item => {
      const ext = path.extname(item.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort((a, b) => b.mtime.getTime() - a.mtime.getTime()); // Сортируем по времени изменения (новые первыми)

  // Вариант 2: Проверяем, есть ли на рабочем столе новое изображение
  const desktopFiles = fs.readdirSync(DESKTOP_PATH, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

  console.log(`📸 Изображения в папке ноутбука: ${imagesInFolder.length}`);
  console.log(`📸 Изображения на рабочем столе: ${desktopFiles.length}\n`);

  // Если есть изображения в папке, используем самое новое (кроме __main.jpeg.webp и 00_main.webp)
  const candidateImages = imagesInFolder.filter(img => 
    !img.name.includes('__main') && 
    img.name !== '00_main.webp' &&
    !img.name.startsWith('_')
  );

  if (candidateImages.length > 0) {
    // Берем самое новое изображение
    newImagePath = candidateImages[0].path;
    console.log(`✅ Найдено новое изображение в папке: ${candidateImages[0].name}`);
  } else {
    // Ищем на рабочем столе
    const desktopImages = desktopFiles.filter(name => 
      !name.includes('_main') && 
      name !== '_main.jpg.webp'
    );
    
    if (desktopImages.length > 0) {
      // Берем последнее изображение на рабочем столе
      newImagePath = path.join(DESKTOP_PATH, desktopImages[desktopImages.length - 1]);
      console.log(`✅ Найдено новое изображение на рабочем столе: ${desktopImages[desktopImages.length - 1]}`);
    }
  }

  if (!newImagePath || !fs.existsSync(newImagePath)) {
    console.log(`\n⚠️ Новое изображение не найдено автоматически.`);
    console.log(`Пожалуйста, укажите путь к новому изображению или поместите его в папку ноутбука.`);
    console.log(`\nТекущие изображения в папке:`);
    imagesInFolder.forEach(img => {
      console.log(`   - ${img.name} (${(img.size / 1024).toFixed(2)} KB, изменено: ${img.mtime.toLocaleString()})`);
    });
    return;
  }

  console.log(`\n📦 Замена главного изображения...`);
  console.log(`   Старое: 00_main.webp`);
  console.log(`   Новое: ${path.basename(newImagePath)}\n`);

  // Удаляем старый 00_main.webp
  const targetMainPath = path.join(folderPath, '00_main.webp');
  if (fs.existsSync(targetMainPath)) {
    try {
      fs.unlinkSync(targetMainPath);
      console.log(`   🗑️ Удален старый 00_main.webp`);
    } catch (err) {
      console.log(`   ⚠️ Не удалось удалить старый 00_main.webp: ${err}`);
    }
  }

  // Копируем новое изображение как 00_main.webp
  try {
    fs.copyFileSync(newImagePath, targetMainPath);
    console.log(`   ✅ Главное изображение заменено!`);
    console.log(`   Новый файл: ${path.basename(newImagePath)} → 00_main.webp\n`);
  } catch (err) {
    console.log(`   ❌ Не удалось скопировать изображение: ${err}`);
    return;
  }

  console.log(`✅ Готово! Главное изображение заменено для ноутбука "${laptop.model}"`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
