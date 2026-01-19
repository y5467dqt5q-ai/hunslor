import fs from 'fs';
import path from 'path';

const sourcePath = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';
const destPath = 'C:\\Users\\Вітання!\\Desktop\\pictr';

async function main() {
  console.log('Копирование папок iPhone 17 и 17 Air в pictr...');
  console.log(`Источник: ${sourcePath}`);
  console.log(`Назначение: ${destPath}\n`);

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ Исходная папка не найдена: ${sourcePath}`);
    return;
  }

  // Создаем папку назначения, если она не существует
  if (!fs.existsSync(destPath)) {
    fs.mkdirSync(destPath, { recursive: true });
    console.log(`✅ Создана папка: ${destPath}`);
  }

  // Получаем все папки из исходной папки
  const folders = fs.readdirSync(sourcePath, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name)
    .filter(name => {
      const lower = name.toLowerCase();
      return lower.includes('iphone') && 
             lower.includes('17') && 
             !lower.includes('pro'); // Не копируем Pro и Pro Max
    });

  console.log(`Найдено папок для копирования: ${folders.length}\n`);

  let copiedCount = 0;
  let skippedCount = 0;

  for (const folderName of folders) {
    const sourceFolderPath = path.join(sourcePath, folderName);
    const destFolderPath = path.join(destPath, folderName);

    // Проверяем, существует ли папка в назначении
    if (fs.existsSync(destFolderPath)) {
      console.log(`⚠️  Уже существует: ${folderName}`);
      skippedCount++;
      continue;
    }

    try {
      // Копируем папку со всеми файлами
      copyDirectory(sourceFolderPath, destFolderPath);
      
      // Проверяем количество изображений
      const images = fs.readdirSync(destFolderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        });

      console.log(`✅ Скопировано: ${folderName} (${images.length} изображений)`);
      copiedCount++;
    } catch (error: any) {
      console.error(`❌ Ошибка при копировании ${folderName}:`, error.message);
    }
  }

  console.log(`\n✅ Готово!`);
  console.log(`   Скопировано: ${copiedCount} папок`);
  console.log(`   Пропущено: ${skippedCount} папок`);
}

function copyDirectory(src: string, dest: string) {
  // Создаем папку назначения
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  // Копируем все файлы и подпапки
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirectory(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  });
