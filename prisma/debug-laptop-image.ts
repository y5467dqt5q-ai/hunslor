import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('🔍 Полная проверка главного изображения ноутбука...\n');

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

  console.log(`✅ Ноутбук: ${laptop.model}\n`);

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

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не существует!`);
    return;
  }

  // Получаем все файлы
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => {
      const filePath = path.join(folderPath, file.name);
      const stats = fs.statSync(filePath);
      return {
        name: file.name,
        path: filePath,
        size: stats.size,
        mtime: stats.mtime,
        exists: true,
      };
    })
    .filter(item => {
      const ext = path.extname(item.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort((a, b) => a.name.localeCompare(b.name)); // Сортируем по имени

  console.log(`📸 Все изображения в папке (${allFiles.length}):`);
  allFiles.forEach((file, index) => {
    const isMain = file.name === '00_main.webp';
    console.log(`   ${index + 1}. ${file.name} ${isMain ? '⭐ ГЛАВНОЕ' : ''} (${(file.size / 1024).toFixed(2)} KB)`);
  });

  // Проверяем 00_main.webp
  const mainImagePath = path.join(folderPath, '00_main.webp');
  const mainExists = fs.existsSync(mainImagePath);
  
  console.log(`\n🔍 Проверка главного изображения:`);
  console.log(`   Файл 00_main.webp существует: ${mainExists ? '✅ ДА' : '❌ НЕТ'}`);
  
  if (mainExists) {
    const stats = fs.statSync(mainImagePath);
    console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Изменено: ${stats.mtime.toLocaleString()}`);
    
    // Проверяем, что это действительно нужное изображение
    const expectedImage = allFiles.find(f => f.name.includes('758utyj'));
    if (expectedImage) {
      console.log(`\n📊 Сравнение:`);
      console.log(`   Ожидаемое изображение: ${expectedImage.name} (${(expectedImage.size / 1024).toFixed(2)} KB)`);
      console.log(`   Текущее главное: 00_main.webp (${(stats.size / 1024).toFixed(2)} KB)`);
      
      if (Math.abs(stats.size - expectedImage.size) < 100) {
        console.log(`   ✅ Размеры совпадают - изображение правильное!`);
      } else {
        console.log(`   ⚠️ Размеры не совпадают - возможно, неправильное изображение`);
      }
    }
  }

  // Проверяем сортировку - 00_main.webp должен быть первым
  const sortedFiles = allFiles.map(f => f.name).sort();
  const mainIndex = sortedFiles.indexOf('00_main.webp');
  console.log(`\n📊 Сортировка файлов:`);
  console.log(`   Позиция 00_main.webp в отсортированном списке: ${mainIndex + 1} из ${sortedFiles.length}`);
  if (mainIndex === 0) {
    console.log(`   ✅ 00_main.webp будет первым в списке`);
  } else {
    console.log(`   ⚠️ 00_main.webp НЕ будет первым! Первый файл: ${sortedFiles[0]}`);
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
