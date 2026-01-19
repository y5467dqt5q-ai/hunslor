import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const IMAGES_BASE_PATH = 'C:\\Users\\Вітання!\\Desktop\\pictr';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔄 Реорганизация изображений часов: последние -> заглавные...\n');
  console.log('ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // Находим все часы
  const watches = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartwatches',
      },
    },
    include: {
      variants: true,
    },
  });

  if (watches.length === 0) {
    console.log('❌ Часы не найдены');
    return;
  }

  console.log(`✅ Найдено часов: ${watches.length}\n`);

  for (const watch of watches) {
    try {
      // Получаем variantPath из варианта
      let variantPath: string | null = null;
      if (watch.variants.length > 0 && watch.variants[0].images) {
        try {
          const parsed = JSON.parse(watch.variants[0].images as string);
          variantPath = parsed.variantPath || null;
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
      }

      if (!variantPath) {
        // Если нет variantPath, используем folderName из товара
        variantPath = watch.folderName || null;
      }

      if (!variantPath) {
        console.log(`⚠️ Не найден variantPath для ${watch.model}, пропускаем`);
        continue;
      }

      // Ищем папку в PATH_WATCHES
      let folderPath = path.join(PATH_WATCHES, variantPath);
      if (!fs.existsSync(folderPath)) {
        // Если не найдено в PATH_WATCHES, пробуем IMAGES_BASE_PATH
        folderPath = path.join(IMAGES_BASE_PATH, variantPath);
      }

      if (!fs.existsSync(folderPath)) {
        console.log(`⚠️ Папка не найдена для ${watch.model}: ${variantPath}`);
        continue;
      }

      // Получаем все изображения (исключая резервные копии)
      const images = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      if (images.length === 0) {
        console.log(`⚠️ Нет изображений в папке для ${watch.model}`);
        continue;
      }

      // Находим текущее заглавное (первое по алфавиту)
      const currentMain = images[0];
      
      // Находим последнее изображение
      const lastImage = images[images.length - 1];

      // Если последнее уже является заглавной, пропускаем
      if (currentMain === lastImage) {
        console.log(`ℹ️ ${watch.model.substring(0, 50)}... - последнее уже заглавная, пропускаем`);
        continue;
      }

      console.log(`📱 ${watch.model.substring(0, 60)}...`);
      console.log(`   Текущая заглавная: ${currentMain}`);
      console.log(`   Последнее изображение: ${lastImage}`);

      // Переименовываем последнее изображение так, чтобы оно было первым по алфавиту
      // Используем префикс "00_" чтобы гарантировать первое место
      const lastExt = path.extname(lastImage);
      const lastNameWithoutExt = path.basename(lastImage, lastExt);
      
      // Создаем имя для нового заглавного изображения
      const newMainName = `00_main${lastExt}`;
      const newMainPath = path.join(folderPath, newMainName);
      const lastImagePath = path.join(folderPath, lastImage);

      // Если уже есть файл с таким именем (старая заглавная), удаляем его
      if (fs.existsSync(newMainPath) && newMainPath !== lastImagePath) {
        fs.unlinkSync(newMainPath);
        console.log(`   🗑️  Удалена старая заглавная: ${newMainName}`);
      }

      // Переименовываем последнее изображение в новое имя (заглавная)
      fs.renameSync(lastImagePath, newMainPath);
      console.log(`   ✅ Перемещено: ${lastImage} -> ${newMainName} (теперь заглавная)\n`);

    } catch (error: any) {
      console.error(`❌ Ошибка при обработке ${watch.model}:`, error.message);
    }
  }

  console.log('✅ Готово! Последние изображения перемещены на первое место.');
  console.log('💡 Обновите страницу сайта, чтобы увидеть изменения.');
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
