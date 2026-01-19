import fs from 'fs';
import path from 'path';

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка замены заглавной фотки...\n');

  // Проверяем исходный файл на рабочем столе
  const sourceFile = path.join(DESKTOP_PATH, '8473647.webp');
  console.log(`📁 Исходный файл на рабочем столе:`);
  if (fs.existsSync(sourceFile)) {
    const stats = fs.statSync(sourceFile);
    console.log(`   ✅ Найден: 8473647.webp`);
    console.log(`   Размер: ${stats.size} байт (${(stats.size / 1024).toFixed(2)} KB)`);
    console.log(`   Дата: ${stats.mtime.toISOString()}\n`);
  } else {
    console.log(`   ❌ Не найден: 8473647.webp\n`);
  }

  // Проверяем файл в папке товара
  const folderName = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, folderName);
  const targetFile = path.join(folderPath, '00_main.webp');

  console.log(`📁 Файл в папке товара:`);
  if (fs.existsSync(targetFile)) {
    const stats = fs.statSync(targetFile);
    console.log(`   ✅ Найден: 00_main.webp`);
    console.log(`   Размер: ${stats.size} байт (${(stats.size / 1024).toFixed(2)} KB)`);
    console.log(`   Дата: ${stats.mtime.toISOString()}\n`);
  } else {
    console.log(`   ❌ Не найден: 00_main.webp\n`);
  }

  // Сравниваем файлы
  if (fs.existsSync(sourceFile) && fs.existsSync(targetFile)) {
    const sourceStats = fs.statSync(sourceFile);
    const targetStats = fs.statSync(targetFile);
    
    console.log(`📊 Сравнение файлов:`);
    if (sourceStats.size === targetStats.size) {
      console.log(`   ✅ Размеры совпадают: ${sourceStats.size} байт`);
      
      // Сравниваем содержимое файлов
      const sourceContent = fs.readFileSync(sourceFile);
      const targetContent = fs.readFileSync(targetFile);
      
      if (sourceContent.equals(targetContent)) {
        console.log(`   ✅ Содержимое файлов ИДЕНТИЧНО - файлы одинаковые`);
      } else {
        console.log(`   ⚠️ Содержимое файлов РАЗЛИЧАЕТСЯ - файлы разные!`);
      }
    } else {
      console.log(`   ⚠️ Размеры РАЗЛИЧАЮТСЯ!`);
      console.log(`   Исходный: ${sourceStats.size} байт`);
      console.log(`   В папке: ${targetStats.size} байт`);
    }
  }

  // Проверяем все файлы в папке
  if (fs.existsSync(folderPath)) {
    const images = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile() && !file.name.startsWith('_backup_'))
      .map(file => ({
        name: file.name,
        path: path.join(folderPath, file.name),
        stats: fs.statSync(path.join(folderPath, file.name)),
      }))
      .filter(f => {
        const ext = path.extname(f.name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    console.log(`\n📸 Все изображения в папке (${images.length} шт.):`);
    images.forEach((img, idx) => {
      const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ (API вернет это первым)' : '';
      const size = (img.stats.size / 1024).toFixed(2);
      console.log(`  ${idx + 1}. ${img.name} (${size} KB)${isMain}`);
    });

    if (images.length > 0) {
      const firstImage = images[0];
      console.log(`\n📋 API вернет первым: ${firstImage.name}`);
      console.log(`   Путь: /api/images/${encodeURIComponent(folderName)}/${encodeURIComponent(firstImage.name)}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
