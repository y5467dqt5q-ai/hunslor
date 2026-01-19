import fs from 'fs';
import path from 'path';

const PATH_SMART_HOME = 'C:\\Users\\Вітання!\\Desktop\\Smart Home';

console.log('🏠 Проверка папки Smart Home...\n');
console.log(`Путь: ${PATH_SMART_HOME}`);
console.log(`Существует: ${fs.existsSync(PATH_SMART_HOME)}\n`);

if (fs.existsSync(PATH_SMART_HOME)) {
  const folders = fs.readdirSync(PATH_SMART_HOME, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  console.log(`Найдено папок: ${folders.length}\n`);
  
  folders.forEach(folderName => {
    const folderPath = path.join(PATH_SMART_HOME, folderName);
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name);
    
    const imageFiles = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    console.log(`📁 ${folderName}`);
    console.log(`   Изображений: ${imageFiles.length}`);
    if (imageFiles.length > 0) {
      const mainImage = imageFiles.find(f => f.includes('00_main') || f.includes('_main') || f.includes('__main'));
      if (mainImage) {
        console.log(`   ✅ Главное: ${mainImage}`);
      } else {
        console.log(`   ⚠️  Главное изображение не найдено (первое: ${imageFiles[0]})`);
      }
    }
  });
} else {
  console.log('❌ Папка не существует!');
}
