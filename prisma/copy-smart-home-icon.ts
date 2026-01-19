import fs from 'fs';
import path from 'path';

const sourcePath = 'C:\\Users\\Вітання!\\Desktop\\_main.jpeg.webp';
const targetPath = path.join(process.cwd(), 'public', 'category-icons', 'SmartHome.png.webp');

console.log('📋 Копирование иконки Smart Home...\n');
console.log(`Источник: ${sourcePath}`);
console.log(`Назначение: ${targetPath}\n`);

// Создаем папку, если её нет
const targetDir = path.dirname(targetPath);
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
  console.log('✅ Создана папка:', targetDir);
}

// Копируем файл
if (fs.existsSync(sourcePath)) {
  try {
    fs.copyFileSync(sourcePath, targetPath);
    console.log('✅ Изображение скопировано успешно!');
    console.log(`   Размер: ${fs.statSync(targetPath).size} байт`);
  } catch (error: any) {
    console.error('❌ Ошибка копирования:', error.message);
    process.exit(1);
  }
} else {
  console.error('❌ Файл не найден:', sourcePath);
  process.exit(1);
}
