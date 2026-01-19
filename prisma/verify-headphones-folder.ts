import fs from 'fs';
import path from 'path';

const PATH_HEADPHONES = 'C:\\Users\\Вітання!\\Desktop\\headphones';

console.log('🎧 Проверка папки с наушниками...\n');
console.log(`Путь: ${PATH_HEADPHONES}`);
console.log(`Существует: ${fs.existsSync(PATH_HEADPHONES)}\n`);

if (fs.existsSync(PATH_HEADPHONES)) {
  const folders = fs.readdirSync(PATH_HEADPHONES, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  console.log(`Найдено папок: ${folders.length}\n`);
  
  for (const folderName of folders.slice(0, 5)) {
    const folderPath = path.join(PATH_HEADPHONES, folderName);
    console.log(`📁 ${folderName}`);
    
    const files = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name);
    
    const imageFiles = files.filter(f => {
      const ext = path.extname(f).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    });
    
    console.log(`   Изображений: ${imageFiles.length}`);
    if (imageFiles.length > 0) {
      console.log(`   Первые 3: ${imageFiles.slice(0, 3).join(', ')}`);
      const mainImage = imageFiles.find(f => f.includes('00_main') || f.includes('_main'));
      if (mainImage) {
        console.log(`   ✅ Главное изображение: ${mainImage}`);
      } else {
        console.log(`   ⚠️  Главное изображение не найдено`);
      }
    }
    console.log('');
  }
} else {
  console.log('❌ Папка не существует!');
}
