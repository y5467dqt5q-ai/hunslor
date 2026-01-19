import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('🔍 Проверка дубликатов изображений Blue для iPhone 17 Air...\n');

  const variants = await prisma.productVariant.findMany({
    where: {
      sku: { startsWith: 'IP17AIR' },
      color: 'Blue',
    },
  });

  if (variants.length === 0) {
    console.log('❌ Варианты Blue для iPhone 17 Air не найдены');
    return;
  }

  for (const variant of variants) {
    try {
      let variantPath: string | null = null;
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }

      if (!variantPath) continue;

      const folderPath = path.join(IMAGES_BASE_PATH, variantPath);
      if (!fs.existsSync(folderPath)) continue;

      console.log(`📱 ${variant.sku} (${variant.memory}):`);

      // Получаем все изображения
      const images = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
        .map(file => {
          const imgPath = path.join(folderPath, file.name);
          const stats = fs.statSync(imgPath);
          return {
            name: file.name,
            size: stats.size,
            path: imgPath,
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));

      console.log(`   📸 Всего изображений: ${images.length}`);
      images.forEach((img, idx) => {
        const isMain = idx === 0 ? ' ⭐ ЗАГЛАВНАЯ' : '';
        console.log(`   ${idx + 1}. ${img.name} (${img.size} байт)${isMain}`);
      });

      // Ищем дубликаты по размеру
      const sizeGroups: { [key: number]: string[] } = {};
      images.forEach(img => {
        if (!sizeGroups[img.size]) {
          sizeGroups[img.size] = [];
        }
        sizeGroups[img.size].push(img.name);
      });

      // Проверяем, есть ли дубликаты
      let hasDuplicates = false;
      for (const size in sizeGroups) {
        const group = sizeGroups[size];
        if (group.length > 1) {
          hasDuplicates = true;
          console.log(`   ⚠️ Найдены дубликаты (размер ${size} байт): ${group.join(', ')}`);
          
          // Удаляем все кроме первого (заглавной мы не трогаем если она не в группе)
          group.sort();
          const toKeep = group[0]; // Оставляем первое по алфавиту
          const toDelete = group.slice(1);
          
          for (const duplicate of toDelete) {
            // Не удаляем если это заглавная (первое изображение по алфавиту)
            const isMainImage = images[0].name === duplicate;
            if (!isMainImage) {
              const duplicatePath = path.join(folderPath, duplicate);
              fs.unlinkSync(duplicatePath);
              console.log(`   🗑️  Удален дубликат: ${duplicate}`);
            }
          }
        }
      }

      if (!hasDuplicates) {
        console.log(`   ✅ Дубликатов не найдено`);
      }

      console.log();

    } catch (error: any) {
      console.error(`❌ Ошибка:`, error.message);
    }
  }

  console.log('✅ Проверка завершена.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
