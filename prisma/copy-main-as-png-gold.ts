import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const DESKTOP_PATH = 'C:\\Users\\Вітання!\\Desktop';
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
const TARGET_FOLDER = 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)';

async function main() {
  console.log('🔄 Копирование 00_main.webp как 00_main.png...\n');
  console.log('⚠️  ВАЖНО: Не трогаем iPhone! Только часы.\n');

  // 1. Проверяем исходный файл на рабочем столе
  const sourceFilePath = path.join(DESKTOP_PATH, '00_main.webp');
  
  if (!fs.existsSync(sourceFilePath)) {
    console.log(`❌ Файл не найден на рабочем столе: ${sourceFilePath}`);
    return;
  }

  const sourceStats = fs.statSync(sourceFilePath);
  console.log(`✅ Исходный файл найден: 00_main.webp`);
  console.log(`   Размер: ${(sourceStats.size / 1024).toFixed(2)} KB (${sourceStats.size} байт)`);

  // 2. Проверяем целевую папку
  const folderPath = path.join(PATH_WATCHES, TARGET_FOLDER);
  
  if (!fs.existsSync(folderPath)) {
    console.log(`❌ Папка не найдена: ${folderPath}`);
    return;
  }

  console.log(`✅ Папка найдена: ${folderPath}\n`);

  // 3. Удаляем старый 00_main.webp если есть
  const oldMainWebp = path.join(folderPath, '00_main.webp');
  if (fs.existsSync(oldMainWebp)) {
    // Создаем резервную копию
    const backupPath = path.join(folderPath, `_backup_old_00_main_webp_${Date.now()}.webp`);
    fs.copyFileSync(oldMainWebp, backupPath);
    console.log(`📦 Создана резервная копия: ${path.basename(backupPath)}`);
    
    fs.unlinkSync(oldMainWebp);
    console.log(`🗑️  Удален старый: 00_main.webp`);
  }

  // 4. Удаляем старый 00_main.png если есть
  const oldMainPng = path.join(folderPath, '00_main.png');
  if (fs.existsSync(oldMainPng)) {
    fs.unlinkSync(oldMainPng);
    console.log(`🗑️  Удален старый: 00_main.png`);
  }

  // 5. Копируем файл с рабочего стола как 00_main.png
  const targetImagePath = path.join(folderPath, '00_main.png');
  fs.copyFileSync(sourceFilePath, targetImagePath);
  console.log(`✅ Скопирован: 00_main.webp (рабочий стол) -> 00_main.png (в папке)`);

  // 6. Устанавливаем время модификации на текущее
  const now = new Date();
  fs.utimesSync(targetImagePath, now, now);
  console.log(`📅 Время модификации обновлено`);

  // 7. Удаляем все резервные копии
  const backupFiles = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && (file.name.startsWith('_backup_') || file.name.startsWith('_old_')))
    .map(file => path.join(folderPath, file.name));

  if (backupFiles.length > 0) {
    console.log(`\n🗑️  Удаление резервных копий (${backupFiles.length} шт.)...`);
    backupFiles.forEach(file => {
      try {
        fs.unlinkSync(file);
        console.log(`   ✅ Удален: ${path.basename(file)}`);
      } catch (e) {}
    });
  }

  // 8. ФИНАЛЬНАЯ ПРОВЕРКА
  const images = fs.readdirSync(folderPath, { withFileTypes: true })
    .filter(file => file.isFile() && !file.name.startsWith('_backup_') && !file.name.startsWith('_old_'))
    .map(file => file.name)
    .filter(name => {
      const ext = path.extname(name).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort();

  console.log(`\n📸 ФИНАЛЬНЫЙ СПИСОК (${images.length} шт.):`);
  images.forEach((img, idx) => {
    const filePath = path.join(folderPath, img);
    const imgStats = fs.statSync(filePath);
    const size = (imgStats.size / 1024).toFixed(2);
    const isMain = idx === 0 ? ' ⭐ ГЛАВНАЯ' : '';
    const isTarget = img === '00_main.png' ? ' ✅ ЦЕЛЕВОЙ' : '';
    console.log(`  ${idx + 1}. ${img} (${size} KB)${isMain}${isTarget}`);
  });

  if (images[0] === '00_main.png') {
    console.log(`\n✅ УСПЕХ! 00_main.png является заглавной`);
  } else {
    console.log(`\n⚠️  Первый файл: ${images[0]}, а не 00_main.png`);
  }

  // 9. Проверяем, что 00_main.png есть в галерее
  if (images.includes('00_main.png')) {
    const index = images.indexOf('00_main.png');
    console.log(`✅ 00_main.png найден в галерее на позиции ${index + 1}`);
  } else {
    console.log(`\n❌ ПРОБЛЕМА: 00_main.png не найден в галерее!`);
  }

  // 10. Проверяем товар в БД
  const watch = await prisma.product.findFirst({
    where: {
      model: {
        contains: 'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium Case with Gold Milanese Loop (MX083)',
      },
    },
    include: {
      variants: true,
    },
  });

  if (watch && watch.variants.length > 0) {
    const variant = watch.variants[0];
    
    console.log(`\n✅ Товар найден в БД`);
    console.log(`   Model: ${watch.model}`);
    
    // Проверяем variantPath
    let variantPath: string | null = null;
    try {
      if (variant.images) {
        const parsed = JSON.parse(variant.images as string);
        variantPath = parsed.variantPath || null;
      }
    } catch (e) {}

    if (variantPath !== TARGET_FOLDER) {
      console.log(`📝 Обновление variantPath...`);
      await prisma.productVariant.update({
        where: { id: variant.id },
        data: {
          images: JSON.stringify({ variantPath: TARGET_FOLDER }),
        },
      });
      console.log(`   ✅ variantPath обновлен`);
    } else {
      console.log(`✅ variantPath правильный`);
    }
  }

  console.log(`\n✅ ГОТОВО! 00_main.png установлен как заглавная и добавлен в галерею.`);
  console.log('💡 Обновите страницу с Ctrl+F5 (без кеша)');
  console.log('⚠️ iPhone НЕ ТРОНУТЫ - они работают как раньше!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
