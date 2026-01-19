import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('🔍 Глубокий анализ проблемы с изображением...\n');

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

  // Получаем ВСЕ файлы с детальной информацией
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
        isMain: file.name === '00_main.webp',
      };
    })
    .filter(item => {
      const ext = path.extname(item.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  console.log(`📸 Все изображения в папке (${allFiles.length}):`);
  allFiles.forEach((file, index) => {
    const marker = file.isMain ? ' ⭐ ГЛАВНОЕ' : '';
    console.log(`   ${index + 1}. ${file.name}${marker}`);
    console.log(`      Размер: ${(file.size / 1024).toFixed(2)} KB`);
    console.log(`      Изменено: ${file.mtime.toLocaleString()}`);
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
    
    // Проверяем, что это правильное изображение
    const targetImage = allFiles.find(f => f.name === '758utyj.jpg-1397x1397.jpg.webp');
    if (targetImage) {
      console.log(`\n📊 Сравнение с целевым изображением:`);
      console.log(`   Целевое: ${targetImage.name} (${(targetImage.size / 1024).toFixed(2)} KB)`);
      console.log(`   Текущее: 00_main.webp (${(stats.size / 1024).toFixed(2)} KB)`);
      
      if (Math.abs(stats.size - targetImage.size) < 100) {
        console.log(`   ✅ Размеры совпадают - это правильное изображение!`);
      } else {
        console.log(`   ❌ Размеры НЕ совпадают! Это НЕ то изображение!`);
        console.log(`   Разница: ${Math.abs(stats.size - targetImage.size)} байт`);
      }
    }
  }

  // Проверяем, что будет возвращать API
  const sortedForAPI = [...allFiles]
    .map(f => f.name)
    .sort((a, b) => {
      if (a === '00_main.webp') return -1;
      if (b === '00_main.webp') return 1;
      return a.localeCompare(b);
    });

  console.log(`\n📊 Что вернет API (первые 3):`);
  sortedForAPI.slice(0, 3).forEach((name, index) => {
    console.log(`   ${index + 1}. ${name}${index === 0 ? ' ⭐ БУДЕТ ГЛАВНЫМ' : ''}`);
  });

  // Проверяем, что файл действительно правильный
  if (mainExists) {
    const stats = fs.statSync(mainImagePath);
    const targetImage = allFiles.find(f => f.name === '758utyj.jpg-1397x1397.jpg.webp');
    
    if (targetImage && Math.abs(stats.size - targetImage.size) > 100) {
      console.log(`\n⚠️ ПРОБЛЕМА: 00_main.webp НЕ совпадает с целевым изображением!`);
      console.log(`   Нужно перезаписать файл.`);
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
