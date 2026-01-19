import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('🔄 Реорганизация изображений Blue для iPhone 17 Air...\n');

  // Находим варианты Blue для iPhone 17 Air
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

  console.log(`✅ Найдено вариантов Blue: ${variants.length}\n`);

  for (const variant of variants) {
    try {
      // Получаем variantPath из images JSON
      let variantPath: string | null = null;
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }

      if (!variantPath) {
        console.log(`⚠️ variantPath не найден для ${variant.sku}`);
        continue;
      }

      const folderPath = path.join(IMAGES_BASE_PATH, variantPath);
      
      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ Папка не найдена: ${folderPath}`);
        continue;
      }

      console.log(`📱 ${variant.sku} (${variant.memory}):`);
      console.log(`   Папка: ${variantPath}`);

      // Получаем все изображения (кроме резервных копий)
      const images = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      if (images.length === 0) {
        console.log(`   ⚠️ Нет изображений в папке`);
        continue;
      }

      console.log(`   📸 Всего изображений: ${images.length}`);
      
      // Находим текущее заглавное изображение (первое по алфавиту)
      const currentMain = images[0];
      console.log(`   🖼️  Текущая заглавная: ${currentMain}`);

      // Находим последнее изображение
      const lastImage = images[images.length - 1];
      console.log(`   🖼️  Последнее изображение: ${lastImage}`);

      // Проверяем, не является ли последнее изображение уже заглавной
      if (currentMain === lastImage) {
        console.log(`   ℹ️ Последнее изображение уже является заглавной, пропускаем\n`);
        continue;
      }

      // Ищем дубликаты (изображения с одинаковым содержанием или похожими именами)
      // Проверяем размеры файлов для поиска потенциальных дубликатов
      const imageStats = images.map(img => {
        const imgPath = path.join(folderPath, img);
        const stats = fs.statSync(imgPath);
        return {
          name: img,
          path: imgPath,
          size: stats.size,
        };
      });

      // Группируем изображения по размеру (одинаковый размер = возможный дубликат)
      const sizeGroups: { [key: number]: string[] } = {};
      imageStats.forEach(img => {
        if (!sizeGroups[img.size]) {
          sizeGroups[img.size] = [];
        }
        sizeGroups[img.size].push(img.name);
      });

      // Удаляем дубликаты (оставляем только первое по алфавиту в группе одинаковых размеров)
      let deletedCount = 0;
      for (const size in sizeGroups) {
        const group = sizeGroups[size];
        if (group.length > 1) {
          // Сортируем по имени и оставляем первое, остальные удаляем
          group.sort();
          const toKeep = group[0];
          const toDelete = group.slice(1);
          
          for (const duplicate of toDelete) {
            const duplicatePath = path.join(folderPath, duplicate);
            // Не удаляем последнее изображение, даже если это дубликат (мы его переместим)
            if (duplicate !== lastImage) {
              fs.unlinkSync(duplicatePath);
              console.log(`   🗑️  Удален дубликат: ${duplicate} (размер: ${parseInt(size)} байт, как у ${toKeep})`);
              deletedCount++;
            }
          }
        }
      }

      // Теперь перемещаем последнее изображение на первое место
      // Переименовываем его так, чтобы оно было первым по алфавиту
      const lastImagePath = path.join(folderPath, lastImage);
      const lastExt = path.extname(lastImage);
      const lastNameWithoutExt = path.basename(lastImage, lastExt);
      
      // Создаем имя, которое будет первым по алфавиту (например, "00_" или "0_")
      const newMainName = `00_main${lastExt}`;
      const newMainPath = path.join(folderPath, newMainName);

      // Если уже есть файл с таким именем, удаляем его (это старая заглавная)
      if (fs.existsSync(newMainPath) && newMainPath !== lastImagePath) {
        fs.unlinkSync(newMainPath);
        console.log(`   🗑️  Удалена старая заглавная: ${newMainName}`);
      }

      // Переименовываем последнее изображение в новое имя
      fs.renameSync(lastImagePath, newMainPath);
      console.log(`   ✅ Перемещено: ${lastImage} -> ${newMainName} (теперь заглавная)`);

      console.log(`   ✅ Готово: ${deletedCount} дубликатов удалено, заглавная обновлена\n`);

    } catch (error: any) {
      console.error(`❌ Ошибка при обработке ${variant.sku}:`, error.message);
    }
  }

  console.log('✅ Готово! Изображения реорганизованы.');
  console.log('💡 Обновите страницу сайта, чтобы увидеть изменения.');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
