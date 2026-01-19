import fs from 'fs';
import path from 'path';

const FOLDER_PATH = 'C:\\Users\\Вітання!\\Desktop\\dyson\\Dyson Supersonic Nural Hair Dryer (Ceramic PatinaTopaz) (515182-01515276-01)';
const SOURCE_IMAGE = path.join(FOLDER_PATH, '_main.jpeg.webp');
const TARGET_MAIN = path.join(FOLDER_PATH, '00_main.webp');

async function main() {
  console.log('🔄 Принудительная замена главного изображения...\n');

  if (!fs.existsSync(SOURCE_IMAGE)) {
    console.error(`❌ Исходное изображение не найдено: ${SOURCE_IMAGE}`);
    return;
  }

  console.log(`📸 Исходное изображение: ${SOURCE_IMAGE}`);
  console.log(`🎯 Целевое главное изображение: ${TARGET_MAIN}\n`);

  try {
    // Удаляем старое главное изображение, если оно есть
    if (fs.existsSync(TARGET_MAIN)) {
      fs.unlinkSync(TARGET_MAIN);
      console.log('🗑️  Удалено старое главное изображение');
    }

    // Копируем новое изображение как главное
    const imageBuffer = fs.readFileSync(SOURCE_IMAGE);
    fs.writeFileSync(TARGET_MAIN, imageBuffer);
    
    // Обновляем время модификации для принудительного обновления кеша
    const now = new Date();
    fs.utimesSync(TARGET_MAIN, now, now);

    // Также обновляем время модификации исходного файла
    fs.utimesSync(SOURCE_IMAGE, now, now);

    const stats = fs.statSync(TARGET_MAIN);
    console.log('✅ Главное изображение успешно заменено!');
    console.log(`   Файл: ${TARGET_MAIN}`);
    console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Время модификации: ${stats.mtime.toLocaleString()}`);

    // Проверяем все файлы в папке
    const files = fs.readdirSync(FOLDER_PATH)
      .filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      })
      .sort();

    console.log('\n📁 Все изображения в папке:');
    files.forEach((file, index) => {
      const isMain = file === '00_main.webp';
      const filePath = path.join(FOLDER_PATH, file);
      const fileStats = fs.statSync(filePath);
      console.log(`   ${isMain ? '⭐' : '  '} ${index + 1}. ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`);
    });

    console.log('\n✅ Проверка: файл успешно создан и готов к использованию');
    console.log('\n💡 Следующие шаги:');
    console.log('   1. Очистить кеш браузера (Ctrl+Shift+Delete или Hard Refresh Ctrl+F5)');
    console.log('   2. Перезапустить dev server');
    console.log('   3. Обновить страницу в браузере');

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
