import fs from 'fs';
import path from 'path';

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';

async function main() {
  console.log('🔍 Проверка всех файлов...\n');

  const folderName = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, folderName);

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  // Проверяем файл на рабочем столе
  const desktopFile = path.join(DESKTOP_PATH, '00_main.webp');
  console.log(`📁 Файл на рабочем столе:`);
  if (fs.existsSync(desktopFile)) {
    const stats = fs.statSync(desktopFile);
    console.log(`   ✅ Найден: 00_main.webp`);
    console.log(`   Размер: ${stats.size} байт`);
  } else {
    console.log(`   ❌ Не найден: 00_main.webp`);
  }

  // Получаем ВСЕ файлы (включая скрытые и резервные копии)
  const allFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => ({
      name: file.name,
      path: path.join(folderPath, file.name),
      stats: fs.statSync(path.join(folderPath, file.name)),
    }));

  // Сортируем по алфавиту
  allFiles.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`\n📸 Все файлы в папке (${allFiles.length} шт.):\n`);
  allFiles.forEach((file, idx) => {
    const ext = path.extname(file.name).toLowerCase();
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    const isBackup = file.name.startsWith('_backup_');
    const size = (file.stats.size / 1024).toFixed(2);
    const date = file.stats.mtime.toISOString();
    
    let marker = '';
    if (idx === 0 && isImage && !isBackup) marker = ' ⭐ ГЛАВНАЯ (API вернет это первым)';
    if (isBackup) marker = ' 🔄 РЕЗЕРВНАЯ КОПИЯ';
    
    console.log(`  ${idx + 1}. ${file.name}${marker}`);
    if (isImage) {
      console.log(`     Размер: ${size} KB (${file.stats.size} байт)`);
    }
    console.log(`     Дата: ${date}\n`);
  });

  // Ищем резервные копии
  const backups = allFiles.filter(f => f.name.startsWith('_backup_'));
  if (backups.length > 0) {
    console.log(`\n🔄 Найдено резервных копий: ${backups.length}`);
    backups.forEach(b => {
      console.log(`   - ${b.name} (${(b.stats.size / 1024).toFixed(2)} KB)`);
    });
  } else {
    console.log(`\n⚠️ Резервных копий не найдено (они были удалены)`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
