import fs from 'fs';
import path from 'path';

const PATH_DYSON = 'C:\\Users\\Вітання!\\Desktop\\dyson';
const TARGET_FOLDER = 'Dyson Supersonic Nural Hair Dryer (Ceramic PatinaTopaz) (515182-01515276-01)';

// Путь к новому изображению - пользователь должен указать
// Если изображение на рабочем столе, укажите имя файла
const NEW_IMAGE_PATH = process.argv[2] || '';

async function main() {
  console.log('🔄 Замена главного изображения для Dyson Supersonic Nural (Ceramic PatinaTopaz)...\n');

  if (!NEW_IMAGE_PATH) {
    console.log('❌ Укажите путь к новому изображению:');
    console.log('   Пример: npx tsx replace-dyson-main-image.ts "C:\\Users\\Вітання!\\Desktop\\new-image.webp"');
    console.log('\n📁 Проверьте рабочую папку товара:');
    const folderPath = path.join(PATH_DYSON, TARGET_FOLDER);
    if (fs.existsSync(folderPath)) {
      const files = fs.readdirSync(folderPath)
        .filter(f => {
          const ext = path.extname(f).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
        });
      console.log(`   ${folderPath}`);
      console.log(`   Доступные изображения: ${files.length}`);
    }
    return;
  }

  // Проверяем, существует ли новое изображение
  let sourceImagePath = NEW_IMAGE_PATH;
  
  // Если указан только имя файла, проверяем на рабочем столе
  if (!path.isAbsolute(NEW_IMAGE_PATH)) {
    const desktopPath = path.join('C:\\Users\\Вітання!\\Desktop', NEW_IMAGE_PATH);
    if (fs.existsSync(desktopPath)) {
      sourceImagePath = desktopPath;
    } else {
      console.error(`❌ Файл не найден: ${NEW_IMAGE_PATH}`);
      console.error(`   Проверено: ${desktopPath}`);
      return;
    }
  }

  if (!fs.existsSync(sourceImagePath)) {
    console.error(`❌ Файл не найден: ${sourceImagePath}`);
    return;
  }

  const folderPath = path.join(PATH_DYSON, TARGET_FOLDER);
  if (!fs.existsSync(folderPath)) {
    console.error(`❌ Папка товара не найдена: ${folderPath}`);
    return;
  }

  const targetMainImage = path.join(folderPath, '00_main.webp');
  const oldMainImage = path.join(folderPath, '_main.jpeg.webp');

  console.log(`📂 Папка товара: ${folderPath}`);
  console.log(`📸 Новое изображение: ${sourceImagePath}`);
  console.log(`🎯 Целевое главное изображение: ${targetMainImage}\n`);

  try {
    // Копируем новое изображение как главное
    const imageBuffer = fs.readFileSync(sourceImagePath);
    fs.writeFileSync(targetMainImage, imageBuffer);
    
    // Обновляем время модификации для принудительного обновления кеша
    const now = new Date();
    fs.utimesSync(targetMainImage, now, now);

    console.log('✅ Главное изображение успешно заменено!');
    console.log(`   Файл: ${targetMainImage}`);
    console.log(`   Размер: ${(imageBuffer.length / 1024).toFixed(2)} KB`);
    console.log('\n💡 Теперь нужно:');
    console.log('   1. Очистить кеш Next.js (удалить папку .next)');
    console.log('   2. Перезапустить dev server');
    console.log('   3. Обновить страницу в браузере (Ctrl+F5)');

    // Удаляем старое _main.jpeg.webp если оно есть
    if (fs.existsSync(oldMainImage)) {
      fs.unlinkSync(oldMainImage);
      console.log(`\n🗑️  Удалено старое изображение: ${oldMainImage}`);
    }

  } catch (error) {
    console.error('❌ Ошибка при замене изображения:', error);
    process.exit(1);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
