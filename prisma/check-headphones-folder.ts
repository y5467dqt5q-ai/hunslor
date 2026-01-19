import fs from 'fs';
import path from 'path';

const PATH_HEADPHONES = 'C:\\Users\\Вітання!\\Desktop\\headphones';

async function main() {
  console.log('🎧 Проверка папки наушников...\n');

  if (!fs.existsSync(PATH_HEADPHONES)) {
    console.error(`❌ Папка не найдена: ${PATH_HEADPHONES}`);
    return;
  }

  const folders = fs.readdirSync(PATH_HEADPHONES, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  console.log(`📁 Найдено папок (товаров): ${folders.length}\n`);

  folders.forEach((folder, index) => {
    const folderPath = path.join(PATH_HEADPHONES, folder);
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name)
      .filter(name => {
        const ext = path.extname(name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      });

    const mainImage = files.find(f => 
      f.includes('_main') || 
      f.startsWith('00_') ||
      f.toLowerCase().includes('main')
    ) || files[0];

    console.log(`${index + 1}. ${folder}`);
    console.log(`   📸 Изображений: ${files.length}`);
    console.log(`   🎯 Главное: ${mainImage || 'не найдено'}`);
    console.log('');
  });
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
