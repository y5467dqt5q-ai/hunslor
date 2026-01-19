import fs from 'fs';
import path from 'path';

const PATH_DYSON = 'C:\\Users\\Вітання!\\Desktop\\dyson';

async function main() {
  console.log('🔍 Поиск папки Dyson Supersonic Nural (Ceramic PatinaTopaz)...\n');

  if (!fs.existsSync(PATH_DYSON)) {
    console.error(`❌ Папка не найдена: ${PATH_DYSON}`);
    return;
  }

  const folders = fs.readdirSync(PATH_DYSON, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  // Ищем папку с Ceramic PatinaTopaz
  const targetFolder = folders.find(f => 
    f.toLowerCase().includes('ceramic') && 
    f.toLowerCase().includes('patina')
  );

  if (!targetFolder) {
    console.log('❌ Папка не найдена');
    console.log('Доступные папки:');
    folders.forEach(f => console.log(`   - ${f}`));
    return;
  }

  console.log(`✅ Найдена папка: ${targetFolder}\n`);

  const folderPath = path.join(PATH_DYSON, targetFolder);
  const files = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile())
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`📁 Изображений в папке: ${files.length}`);
  console.log(`\n📸 Текущие изображения:`);
  files.forEach((file, index) => {
    const isMain = file.includes('_main') || file.startsWith('00_') || index === 0;
    console.log(`   ${isMain ? '⭐' : '  '} ${index + 1}. ${file}`);
  });

  // Проверяем, есть ли главное изображение
  const mainImage = files.find(f => 
    f.includes('_main') || 
    f.startsWith('00_') ||
    f.toLowerCase().includes('main')
  ) || files[0];

  console.log(`\n🎯 Текущее главное изображение: ${mainImage}`);
  console.log(`\n💡 Чтобы заменить главное изображение:`);
  console.log(`   1. Сохраните новое изображение в папку: ${folderPath}`);
  console.log(`   2. Переименуйте его в: 00_main.webp`);
  console.log(`   3. Или скажите мне путь к новому изображению`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
