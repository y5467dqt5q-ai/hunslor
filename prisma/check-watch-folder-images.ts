import fs from 'fs';
import path from 'path';

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка всех изображений в папке часов...\n');

  const folderName = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, folderName);

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  // Получаем ВСЕ файлы в папке (включая скрытые)
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => ({
      name: file.name,
      path: path.join(folderPath, file.name),
      stats: fs.statSync(path.join(folderPath, file.name)),
    }));

  // Сортируем по алфавиту
  allFiles.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`📁 Папка: ${folderPath}`);
  console.log(`📊 Всего файлов в папке: ${allFiles.length}\n`);

  // Отделяем изображения от других файлов
  const images = allFiles.filter(file => {
    const ext = path.extname(file.name).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  const otherFiles = allFiles.filter(file => {
    const ext = path.extname(file.name).toLowerCase();
    return !['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
  });

  console.log(`📸 Изображения (${images.length} шт.), отсортированные по алфавиту:\n`);
  images.forEach((file, idx) => {
    const isMain = idx === 0 ? ' ⭐ ПЕРВАЯ (API вернет это как заглавную)' : '';
    const isBackup = file.name.startsWith('_backup_') ? ' 🔄 РЕЗЕРВНАЯ КОПИЯ' : '';
    const size = (file.stats.size / 1024).toFixed(2);
    const date = file.stats.mtime.toISOString();
    console.log(`  ${idx + 1}. ${file.name}${isMain}${isBackup}`);
    console.log(`     Размер: ${size} KB (${file.stats.size} байт)`);
    console.log(`     Дата: ${date}\n`);
  });

  if (otherFiles.length > 0) {
    console.log(`📄 Другие файлы (${otherFiles.length} шт.):\n`);
    otherFiles.forEach((file, idx) => {
      console.log(`  ${idx + 1}. ${file.name}`);
    });
  }

  // Проверяем, какая картинка будет первой (API вернет её)
  if (images.length > 0) {
    const firstImage = images.find(img => !img.name.startsWith('_backup_')) || images[0];
    console.log(`\n✅ API вернет как заглавную: ${firstImage.name}`);
    console.log(`   Путь: /api/images/${encodeURIComponent(folderName)}/${encodeURIComponent(firstImage.name)}`);
    
    // Проверяем, является ли первая картинка 00_main.webp
    if (firstImage.name === '00_main.webp') {
      console.log(`\n✅ 00_main.webp уже является первым файлом!`);
    } else {
      console.log(`\n⚠️ ПЕРВАЯ картинка НЕ 00_main.webp!`);
      console.log(`   Нужно переименовать ${firstImage.name} в 00_main.webp`);
    }
  } else {
    console.log(`\n❌ В папке нет изображений!`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
