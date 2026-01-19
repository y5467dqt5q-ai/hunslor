import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_TV = 'C:\\Users\\Вітання!\\Desktop\\tv';

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractBrandAndModel(folderName: string): { brand: string; model: string } {
  // Извлекаем бренд (обычно первое слово)
  const parts = folderName.trim().split(/\s+/);
  const brand = parts[0] || 'Unknown';
  
  // Модель - это все остальное
  const model = folderName.trim();
  
  return { brand, model };
}

async function main() {
  console.log('📺 Импорт TV товаров...\n');

  if (!fs.existsSync(PATH_TV)) {
    console.error(`❌ Папка не найдена: ${PATH_TV}`);
    return;
  }

  // Создаем или находим категорию TV
  const category = await prisma.category.upsert({
    where: { slug: 'tv' },
    update: {},
    create: {
      name: 'TV',
      slug: 'tv',
      description: 'Телевизоры',
    },
  });
  console.log(`✅ Категория: ${category.name} (${category.slug})\n`);

  const folders = fs.readdirSync(PATH_TV, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  console.log(`📁 Найдено папок: ${folders.length}\n`);

  let imported = 0;
  let skipped = 0;

  for (const folderName of folders) {
    try {
      const folderPath = path.join(PATH_TV, folderName);
      const { brand, model } = extractBrandAndModel(folderName);
      const slug = createSlug(model);

      // Проверяем, существует ли уже товар
      const existing = await prisma.product.findUnique({
        where: { slug },
      });

      if (existing) {
        console.log(`⏭️  Пропущен (уже существует): ${model}`);
        skipped++;
        continue;
      }

      // Получаем изображения из папки
      const imageFiles = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(name => {
          const ext = path.extname(name).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
        })
        .sort();

      if (imageFiles.length === 0) {
        console.log(`⚠️  Пропущен (нет изображений): ${model}`);
        skipped++;
        continue;
      }

      // Проверяем, есть ли _main.jpeg.webp или __main.jpeg.webp
      let mainImage = imageFiles.find(f => 
        f.includes('_main') || 
        f.startsWith('00_') ||
        f.toLowerCase().includes('main')
      );

      // Если есть _main.jpeg.webp, переименовываем в 00_main.webp
      if (mainImage && (mainImage.includes('_main') || mainImage.includes('__main'))) {
        const oldPath = path.join(folderPath, mainImage);
        const newPath = path.join(folderPath, '00_main.webp');
        
        // Если 00_main.webp уже существует, удаляем его
        if (fs.existsSync(newPath)) {
          fs.unlinkSync(newPath);
        }
        
        // Копируем главное изображение как 00_main.webp
        const imageBuffer = fs.readFileSync(oldPath);
        fs.writeFileSync(newPath, imageBuffer);
        
        // Обновляем время модификации
        const now = new Date();
        fs.utimesSync(newPath, now, now);
        
        mainImage = '00_main.webp';
        console.log(`   📸 Главное изображение: ${mainImage} (переименовано)`);
      } else if (!mainImage) {
        // Если главного изображения нет, используем первое
        mainImage = imageFiles[0];
        
        // Копируем первое изображение как 00_main.webp
        const firstImagePath = path.join(folderPath, mainImage);
        const mainImagePath = path.join(folderPath, '00_main.webp');
        
        if (!fs.existsSync(mainImagePath)) {
          const imageBuffer = fs.readFileSync(firstImagePath);
          fs.writeFileSync(mainImagePath, imageBuffer);
          
          const now = new Date();
          fs.utimesSync(mainImagePath, now, now);
          
          mainImage = '00_main.webp';
          console.log(`   📸 Главное изображение: ${mainImage} (создано из первого)`);
        } else {
          mainImage = '00_main.webp';
        }
      }

      // Создаем товар
      const product = await prisma.product.create({
        data: {
          model,
          slug,
          brand,
          categoryId: category.id,
          basePrice: 999,
          discount: 0,
          baseImages: JSON.stringify([]),
          baseDescription: '',
        },
      });

      // Создаем вариант товара
      const variantSKU = `${brand.toUpperCase()}-${model.replace(/\s+/g, '').toUpperCase()}`;
      
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          sku: variantSKU,
          color: null,
          memory: null,
          storage: null,
          priceModifier: 0,
          stock: 20,
          inStock: true,
          images: JSON.stringify({
            variantPath: folderName,
          }),
        },
      });

      console.log(`✅ Импортирован: ${model}`);
      imported++;
    } catch (error) {
      console.error(`❌ Ошибка при импорте ${folderName}:`, error);
    }
  }

  console.log(`\n✅ Импорт завершен!`);
  console.log(`   Импортировано: ${imported}`);
  console.log(`   Пропущено: ${skipped}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
