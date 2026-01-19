import fs from 'fs';
import path from 'path';

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🗑️  Удаление резервных копий из папки товара...\n');

  const folderName = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, folderName);

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  // Получаем все файлы, начинающиеся с _backup_
  const files = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && file.name.startsWith('_backup_'));

  if (files.length === 0) {
    console.log('✅ Резервных копий не найдено');
    return;
  }

  console.log(`📁 Найдено резервных копий: ${files.length}\n`);

  let deleted = 0;
  for (const file of files) {
    const filePath = path.join(folderPath, file.name);
    try {
      fs.unlinkSync(filePath);
      console.log(`✅ Удален: ${file.name}`);
      deleted++;
    } catch (e) {
      console.error(`❌ Ошибка при удалении ${file.name}:`, e);
    }
  }

  console.log(`\n✅ Удалено файлов: ${deleted} из ${files.length}`);

  // Проверяем, что теперь 00_main.webp первый
  const allImages = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) && !name.startsWith('_backup_');
    })
    .sort();

  console.log(`\n📸 Теперь файлы в папке (${allImages.length} шт.):`);
  allImages.forEach((img, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    console.log(`  ${idx + 1}. ${img}${isMain}`);
  });

  if (allImages[0] === '00_main.webp') {
    console.log(`\n✅ Теперь 00_main.webp является первым файлом!`);
  } else {
    console.log(`\n⚠️ Первый файл: ${allImages[0]}`);
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
