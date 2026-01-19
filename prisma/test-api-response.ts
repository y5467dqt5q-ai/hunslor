import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const LAPTOPS_PATH = 'C:\\Users\\Вітання!\\Desktop\\Laptop';

async function main() {
  console.log('🧪 Тестирование API ответа...\n');

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

  // Имитируем логику API
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      if (name.startsWith('_backup_')) {
        return false;
      }
      if (name.startsWith('__main') && name.includes('.webp')) {
        return false;
      }
      if (name.startsWith('_') && !name.startsWith('__main')) {
        return false;
      }
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

  // Сортируем как в API
  const sortedImages = [...images].sort((a, b) => {
    if (a === '00_main.webp') return -1;
    if (b === '00_main.webp') return 1;
    return a.localeCompare(b);
  });

  console.log(`📊 Результат API (первые 3):`);
  sortedImages.slice(0, 3).forEach((name, index) => {
    const filePath = path.join(folderPath, name);
    const stats = fs.statSync(filePath);
    console.log(`   ${index + 1}. ${name} ⭐${index === 0 ? ' ГЛАВНОЕ' : ''}`);
    console.log(`      Размер: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`      URL: /api/images/${encodeURIComponent(variantPath!)}/${encodeURIComponent(name)}`);
    console.log(``);
  });

  // Проверяем, что первое изображение правильное
  if (sortedImages[0] === '00_main.webp') {
    const mainPath = path.join(folderPath, '00_main.webp');
    const targetPath = path.join(folderPath, '758utyj.jpg-1397x1397.jpg.webp');
    
    if (fs.existsSync(targetPath)) {
      const mainStats = fs.statSync(mainPath);
      const targetStats = fs.statSync(targetPath);
      
      if (Math.abs(mainStats.size - targetStats.size) < 100) {
        console.log(`✅ ПРОВЕРКА: Главное изображение правильное!`);
        console.log(`   Размеры совпадают: ${(mainStats.size / 1024).toFixed(2)} KB`);
      } else {
        console.log(`❌ ПРОВЕРКА: Главное изображение НЕ правильное!`);
        console.log(`   Ожидалось: ${(targetStats.size / 1024).toFixed(2)} KB`);
        console.log(`   Получено: ${(mainStats.size / 1024).toFixed(2)} KB`);
      }
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
