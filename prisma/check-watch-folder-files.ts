import fs from 'fs';
import path from 'path';

const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';

async function main() {
  console.log('🔍 Проверка файлов в папке товара...\n');

  const folderName = 'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium Case with Black Ocean Band (MX4P3)';
  const folderPath = path.join(PATH_WATCHES, folderName);

  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  console.log(`📁 Папка: ${folderPath}\n`);

  // Получаем все файлы
  const files = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => ({
      name: file.name,
      path: path.join(folderPath, file.name),
      stats: fs.statSync(path.join(folderPath, file.name)),
    }))
    .filter(f => {
      const ext = path.extname(f.name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });

  // Сортируем по алфавиту (как делает API)
  files.sort((a, b) => a.name.localeCompare(b.name));

  console.log(`📸 Все изображения (${files.length} шт.), отсортированные по алфавиту:\n`);
  files.forEach((file, idx) => {
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ (API вернет это первым)' : '';
    const size = (file.stats.size / 1024).toFixed(2);
    const date = file.stats.mtime.toISOString();
    console.log(`  ${idx + 1}. ${file.name}`);
    console.log(`     Размер: ${size} KB (${file.stats.size} байт)`);
    console.log(`     Дата: ${date}${isMain}\n`);
  });

  // Проверяем, что 00_main.webp есть и он первый
  const mainFile = files.find(f => f.name === '00_main.webp');
  if (mainFile) {
    const mainIndex = files.indexOf(mainFile);
    console.log(`\n✅ Файл 00_main.webp найден на позиции ${mainIndex + 1}`);
    if (mainIndex === 0) {
      console.log(`✅ 00_main.webp является ПЕРВЫМ файлом - это правильно!`);
    } else {
      console.log(`⚠️ ПРОБЛЕМА: 00_main.webp НЕ является первым!`);
      console.log(`   Первый файл: ${files[0].name}`);
      console.log(`   Нужно переименовать файлы или изменить сортировку API`);
    }
  } else {
    console.log(`\n❌ Файл 00_main.webp НЕ НАЙДЕН в папке!`);
  }

  // Проверяем, какой файл будет возвращен API первым
  console.log(`\n📋 API вернет первым: ${files[0].name}`);
  console.log(`   Путь: /api/images/${encodeURIComponent(folderName)}/${encodeURIComponent(files[0].name)}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
