import fs from 'fs';
import path from 'path';

// Возможные пути к папке с наушниками
const possiblePaths = [
  'C:\\Users\\Вітання!\\Desktop\\headphones',
  'C:\\Users\\Вітання!\\Desktop\\Headphones',
  'C:\\Users\\Вітання!\\Desktop\\headphone',
  'C:\\Users\\Вітання!\\Desktop\\AirPods',
  'C:\\Users\\Вітання!\\Desktop\\airpods',
];

const desktopPath = 'C:\\Users\\Вітання!\\Desktop';

console.log('🔍 Поиск папки с наушниками...\n');

// Проверяем возможные пути
for (const testPath of possiblePaths) {
  if (fs.existsSync(testPath)) {
    console.log(`✅ Найдена папка: ${testPath}`);
    const folders = fs.readdirSync(testPath, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name);
    console.log(`   Папок внутри: ${folders.length}`);
    if (folders.length > 0) {
      console.log(`   Первые 5 папок:`);
      folders.slice(0, 5).forEach(f => console.log(`     - ${f}`));
    }
    console.log('');
  }
}

// Ищем все папки на рабочем столе, которые могут содержать наушники
console.log('🔍 Поиск всех папок на рабочем столе, содержащих "headphone" или "airpod"...\n');

try {
  if (fs.existsSync(desktopPath)) {
    const allFolders = fs.readdirSync(desktopPath, { withFileTypes: true })
      .filter(item => item.isDirectory())
      .map(item => item.name);
    
    const matchingFolders = allFolders.filter(f => 
      f.toLowerCase().includes('headphone') || 
      f.toLowerCase().includes('airpod') ||
      f.toLowerCase().includes('наушник')
    );
    
    if (matchingFolders.length > 0) {
      console.log(`✅ Найдено ${matchingFolders.length} подходящих папок:`);
      matchingFolders.forEach(f => {
        const fullPath = path.join(desktopPath, f);
        console.log(`   - ${f}`);
        console.log(`     Полный путь: ${fullPath}`);
        const subFolders = fs.readdirSync(fullPath, { withFileTypes: true })
          .filter(item => item.isDirectory())
          .map(item => item.name);
        console.log(`     Подпапок: ${subFolders.length}`);
        if (subFolders.length > 0) {
          console.log(`     Первые 3: ${subFolders.slice(0, 3).join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('❌ Не найдено папок с наушниками на рабочем столе');
    }
  } else {
    console.log(`❌ Рабочий стол не найден: ${desktopPath}`);
  }
} catch (error) {
  console.error('❌ Ошибка при поиске:', error);
}
