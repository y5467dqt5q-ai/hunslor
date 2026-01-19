import fs from 'fs';
import path from 'path';

const VARIANT_PATH = 'Dyson Supersonic Nural Hair Dryer (Ceramic PatinaTopaz) (515182-01515276-01)';
const DYSON_PATH = 'C:\\Users\\Вітання!\\Desktop\\dyson';
const FOLDER_PATH = path.join(DYSON_PATH, VARIANT_PATH);
const MAIN_IMAGE = path.join(FOLDER_PATH, '00_main.webp');

async function main() {
  console.log('🔍 Проверка главного изображения для Dyson...\n');
  console.log(`📁 Папка: ${FOLDER_PATH}`);
  console.log(`🎯 Главное изображение: ${MAIN_IMAGE}\n`);

  if (!fs.existsSync(FOLDER_PATH)) {
    console.error(`❌ Папка не найдена: ${FOLDER_PATH}`);
    return;
  }

  if (!fs.existsSync(MAIN_IMAGE)) {
    console.error(`❌ Главное изображение не найдено: ${MAIN_IMAGE}`);
    return;
  }

  const stats = fs.statSync(MAIN_IMAGE);
  console.log('✅ Главное изображение найдено!');
  console.log(`   Файл: ${MAIN_IMAGE}`);
  console.log(`   Размер: ${(stats.size / 1024).toFixed(2)} KB`);
  console.log(`   Время модификации: ${stats.mtime.toLocaleString()}`);

  // Проверяем все изображения в папке
  const files = fs.readdirSync(FOLDER_PATH)
    .filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
    })
    .sort();

  console.log(`\n📸 Все изображения в папке (${files.length}):`);
  files.forEach((file, index) => {
    const isMain = file === '00_main.webp';
    const filePath = path.join(FOLDER_PATH, file);
    const fileStats = fs.statSync(filePath);
    console.log(`   ${isMain ? '⭐' : '  '} ${index + 1}. ${file} (${(fileStats.size / 1024).toFixed(2)} KB)`);
  });

  // Проверяем, что 00_main.webp первый в списке
  if (files[0] === '00_main.webp') {
    console.log('\n✅ 00_main.webp является первым файлом - правильно!');
  } else {
    console.log(`\n⚠️  Внимание: 00_main.webp не первый файл. Первый: ${files[0]}`);
  }

  // Проверяем API путь
  const apiPath = `/api/images/${encodeURIComponent(VARIANT_PATH)}/${encodeURIComponent('00_main.webp')}`;
  console.log(`\n🌐 API путь: ${apiPath}`);
  console.log(`   Полный URL: http://localhost:3000${apiPath}?t=${Date.now()}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
