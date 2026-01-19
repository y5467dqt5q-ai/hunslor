import fs from 'fs';
import path from 'path';

const PATH_DYSON = 'C:\\Users\\Вітання!\\Desktop\\dyson';

async function main() {
  console.log('🖼️ Исправление главных изображений для Dyson...\n');

  if (!fs.existsSync(PATH_DYSON)) {
    console.error(`❌ Папка не найдена: ${PATH_DYSON}`);
    return;
  }

  const folders = fs.readdirSync(PATH_DYSON, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  console.log(`📁 Найдено папок: ${folders.length}\n`);

  let fixed = 0;

  for (const folderName of folders) {
    const folderPath = path.join(PATH_DYSON, folderName);
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name);

    // Ищем _main.jpeg.webp или _main.jpeg
    const mainImage = files.find(f => 
      f.toLowerCase().includes('_main.jpeg.webp') ||
      f.toLowerCase().includes('_main.jpeg')
    );

    if (mainImage) {
      const oldPath = path.join(folderPath, mainImage);
      const newPath = path.join(folderPath, '00_main.webp');

      if (!fs.existsSync(newPath)) {
        try {
          fs.copyFileSync(oldPath, newPath);
          console.log(`✅ ${folderName.substring(0, 50)}...`);
          console.log(`   ${mainImage} → 00_main.webp`);
          fixed++;
        } catch (e) {
          console.log(`   ⚠️ Ошибка: ${e}`);
        }
      }
    }
  }

  console.log(`\n📊 Исправлено: ${fixed}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
