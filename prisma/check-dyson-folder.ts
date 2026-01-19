import fs from 'fs';
import path from 'path';

const DYSON_PATH = 'C:\\Users\\Вітання!\\Desktop\\dyson';

async function main() {
  console.log('🔍 Проверка папки Dyson...\n');

  if (!fs.existsSync(DYSON_PATH)) {
    console.error(`❌ Папка не найдена: ${DYSON_PATH}`);
    return;
  }

  const items = fs.readdirSync(DYSON_PATH, { withFileTypes: true });
  const folders = items.filter(item => item.isDirectory()).map(item => item.name);
  const files = items.filter(item => item.isFile()).map(item => item.name);

  console.log(`📁 Найдено папок: ${folders.length}`);
  console.log(`📄 Найдено файлов: ${files.length}\n`);

  if (folders.length > 0) {
    console.log('📦 Папки (товары):');
    folders.forEach((folder, index) => {
      const folderPath = path.join(DYSON_PATH, folder);
      const folderItems = fs.readdirSync(folderPath, { withFileTypes: true });
      const images = folderItems
        .filter(item => item.isFile())
        .map(item => item.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        });

      const mainImage = images.find(img => 
        img.toLowerCase().includes('main') || 
        img.toLowerCase().includes('_main') ||
        img.toLowerCase().startsWith('00_') ||
        img.toLowerCase().startsWith('01_')
      ) || images[0];

      console.log(`\n   ${index + 1}. ${folder}`);
      console.log(`      Изображений: ${images.length}`);
      console.log(`      Главное изображение: ${mainImage || 'не найдено'}`);
    });
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
