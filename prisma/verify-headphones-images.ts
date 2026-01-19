import fs from 'fs';
import path from 'path';

const PATH_HEADPHONES = 'C:\\Users\\Вітання!\\Desktop\\headphones';

async function main() {
  console.log('🎧 Проверка изображений наушников...\n');

  if (!fs.existsSync(PATH_HEADPHONES)) {
    console.error(`❌ Папка не найдена: ${PATH_HEADPHONES}`);
    return;
  }

  const folders = fs.readdirSync(PATH_HEADPHONES, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  for (const folderName of folders) {
    const folderPath = path.join(PATH_HEADPHONES, folderName);
    const mainImagePath = path.join(folderPath, '00_main.webp');
    const mainImageExists = fs.existsSync(mainImagePath);
    
    const files = fs.readdirSync(folderPath)
      .filter(f => {
        const ext = path.extname(f).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
      });

    console.log(`${folderName}:`);
    console.log(`   📸 Всего изображений: ${files.length}`);
    console.log(`   🎯 00_main.webp: ${mainImageExists ? '✅' : '❌'}`);
    
    if (!mainImageExists && files.length > 0) {
      const firstImage = files[0];
      const firstImagePath = path.join(folderPath, firstImage);
      console.log(`   ⚠️  Создаю 00_main.webp из ${firstImage}...`);
      
      try {
        const imageBuffer = fs.readFileSync(firstImagePath);
        fs.writeFileSync(mainImagePath, imageBuffer);
        const now = new Date();
        fs.utimesSync(mainImagePath, now, now);
        console.log(`   ✅ Создано: 00_main.webp`);
      } catch (error) {
        console.error(`   ❌ Ошибка: ${error}`);
      }
    }
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
