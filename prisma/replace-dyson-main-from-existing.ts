import fs from 'fs';
import path from 'path';

const SOURCE_IMAGE = 'C:\\Users\\Вітання!\\Desktop\\dyson\\Dyson Supersonic Nural Hair Dryer (Ceramic PatinaTopaz) (515182-01515276-01)\\_main.jpeg.webp';
const TARGET_MAIN = 'C:\\Users\\Вітання!\\Desktop\\dyson\\Dyson Supersonic Nural Hair Dryer (Ceramic PatinaTopaz) (515182-01515276-01)\\00_main.webp';

async function main() {
  console.log('🔄 Замена главного изображения для Dyson Supersonic Nural (Ceramic PatinaTopaz)...\n');

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

    const stats = fs.statSync(TARGET_MAIN);
    console.log('✅ Главное изображение успешно заменено!');
    console.log(`   Файл: ${TARGET_MAIN}`);
    console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log(`   Время модификации: ${stats.mtime.toLocaleString()}`);

    // Проверяем, что файл действительно создан
    if (fs.existsSync(TARGET_MAIN)) {
      console.log('\n✅ Проверка: файл успешно создан и готов к использованию');
    } else {
      console.error('\n❌ Ошибка: файл не был создан');
      process.exit(1);
    }

    console.log('\n💡 Следующие шаги:');
    console.log('   1. Очистить кеш Next.js (удалить папку .next)');
    console.log('   2. Перезапустить dev server');
    console.log('   3. Обновить страницу в браузере (Ctrl+F5 или Hard Refresh)');

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
