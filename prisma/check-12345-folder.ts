import fs from 'fs';
import path from 'path';

const PATH_12345 = 'C:\\Users\\Вітання!\\Desktop\\12345';

console.log('📱 Проверка папки 12345...\n');
console.log(`Путь: ${PATH_12345}`);
console.log(`Существует: ${fs.existsSync(PATH_12345)}\n`);

if (fs.existsSync(PATH_12345)) {
  const folders = fs.readdirSync(PATH_12345, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  console.log(`Найдено папок: ${folders.length}\n`);
  
  folders.forEach(folderName => {
    const folderPath = path.join(PATH_12345, folderName);
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
    console.log('');
  });
} else {
  console.log('❌ Папка не существует!');
}
