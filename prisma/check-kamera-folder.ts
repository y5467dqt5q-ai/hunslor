import fs from 'fs';
import path from 'path';

const PATH_KAMERA = 'C:\\Users\\Вітання!\\Desktop\\Kamera';

console.log('📷 Проверка папки Kamera...\n');
console.log(`Путь: ${PATH_KAMERA}`);
console.log(`Существует: ${fs.existsSync(PATH_KAMERA)}\n`);

if (fs.existsSync(PATH_KAMERA)) {
  const folders = fs.readdirSync(PATH_KAMERA, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  console.log(`Найдено папок: ${folders.length}\n`);
  
  folders.forEach(folderName => {
    const folderPath = path.join(PATH_KAMERA, folderName);
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
