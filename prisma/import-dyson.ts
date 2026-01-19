import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_DYSON = 'C:\\Users\\Вітання!\\Desktop\\dyson';

// Функция для создания slug
const createSlug = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/™/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
};

// Функция для парсинга модели и цвета из названия папки
const parseDysonName = (folderName: string) => {
  let model = '';
  let color = '';
  
  // Убираем префикс "DYSON " или "Dyson "
  let cleanName = folderName.replace(/^(DYSON|Dyson)\s+/i, '').trim();
  
  // Определяем тип продукта
  if (cleanName.includes('Airwrap')) {
    if (cleanName.includes('Co-anda 2x')) {
      model = 'Dyson Airwrap Co-anda 2x';
    } else if (cleanName.includes('i.d.')) {
      model = 'Dyson Airwrap i.d.';
    } else {
      model = 'Dyson Airwrap';
    }
    
    // Извлекаем цвет
    if (cleanName.includes('Rose')) color = 'Rose';
    else if (cleanName.includes('Rot')) color = 'Rot';
    else if (cleanName.includes('Violett')) color = 'Violett';
    else if (cleanName.includes('Blau')) color = 'Blau';
    else if (cleanName.includes('DunkelBlau')) color = 'DunkelBlau';
    else if (cleanName.includes('Orange')) color = 'Orange';
    else if (cleanName.includes('Rosa')) color = 'Rosa';
  } else if (cleanName.includes('Supersonic')) {
    model = 'Dyson Supersonic';
    
    // Извлекаем модель и цвет
    if (cleanName.includes('HD16 Nural')) {
      model = 'Dyson Supersonic HD16 Nural';
    } else if (cleanName.includes('Nural Hair Dryer')) {
      model = 'Dyson Supersonic Nural';
    }
    
    // Извлекаем цвет из скобок
    const colorMatch = cleanName.match(/\(([^)]+)\)/);
    if (colorMatch) {
      color = colorMatch[1].trim();
    }
  }
  
  return { model: model || cleanName, color };
};

async function main() {
  console.log('🌀 Импорт товаров Dyson...\n');

  // Получаем категорию Dyson
  const dysonCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'dyson' },
        { name: { contains: 'Dyson' } },
      ],
    },
  });

  if (!dysonCategory) {
    console.error('❌ Категория Dyson не найдена!');
    return;
  }

  console.log(`✅ Найдена категория: ${dysonCategory.name} (${dysonCategory.slug})\n`);

  if (!fs.existsSync(PATH_DYSON)) {
    console.error(`❌ Папка не найдена: ${PATH_DYSON}`);
    return;
  }

  const folders = fs.readdirSync(PATH_DYSON, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  console.log(`📁 Найдено папок: ${folders.length}\n`);

  let created = 0;
  let updated = 0;

  for (const folderName of folders) {
    const folderPath = path.join(PATH_DYSON, folderName);
    
    // Получаем изображения
    const images = fs.readdirSync(folderPath, { withFileTypes: true })
      .filter(file => file.isFile())
      .map(file => file.name)
      .filter(name => {
        const ext = path.extname(name).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
      })
      .sort();

    if (images.length === 0) {
      console.log(`⚠️ Пропущено (нет изображений): ${folderName}`);
      continue;
    }

    // Находим главное изображение
    let mainImage = images.find(img => 
      img.toLowerCase().includes('_main') ||
      img.toLowerCase().startsWith('00_') ||
      img.toLowerCase().startsWith('01_')
    ) || images[0];

    // Если есть _main.jpeg.webp, переименовываем в 00_main.webp
    if (mainImage.includes('_main.jpeg.webp') || mainImage.includes('_main.jpeg')) {
      const oldPath = path.join(folderPath, mainImage);
      const newPath = path.join(folderPath, '00_main.webp');
      if (!fs.existsSync(newPath)) {
        try {
          fs.copyFileSync(oldPath, newPath);
          mainImage = '00_main.webp';
        } catch (e) {
          console.log(`   ⚠️ Не удалось переименовать главное изображение: ${e}`);
        }
      } else {
        mainImage = '00_main.webp';
      }
    }

    // Парсим название
    const { model, color } = parseDysonName(folderName);
    const fullModel = color ? `${model} (${color})` : model;
    const slug = createSlug(fullModel);

    // Создаем данные изображений
    const imagesData = {
      images: images.map(img => `/api/images/${encodeURIComponent(folderName)}/${encodeURIComponent(img)}`),
      variantPath: folderName,
    };

    // Создаем или обновляем продукт
    const existingProduct = await prisma.product.findUnique({
      where: { slug },
    });

    if (existingProduct) {
      // Обновляем существующий
      await prisma.product.update({
        where: { id: existingProduct.id },
        data: {
          model: fullModel,
          baseDescription: existingProduct.baseDescription || '',
        },
      });
      updated++;
      console.log(`   🔄 Обновлен: ${fullModel}`);
    } else {
      // Создаем новый
      const product = await prisma.product.create({
        data: {
          brand: 'Dyson',
          model: fullModel,
          slug,
          categoryId: dysonCategory.id,
          baseDescription: '',
          baseImages: JSON.stringify([]),
          basePrice: 399.00, // Базовая цена, будет обновлена
          discount: 0,
        },
      });

      // Создаем вариант
      await prisma.productVariant.create({
        data: {
          productId: product.id,
          color: color || null,
          memory: null,
          storage: null,
          priceModifier: 0,
          images: JSON.stringify(imagesData),
          stock: 20,
          inStock: true,
          sku: `DYSON-${slug.toUpperCase().replace(/-/g, '')}`,
        },
      });

      created++;
      console.log(`   ✅ Создан: ${fullModel}`);
    }
  }

  console.log(`\n📊 Итого:`);
  console.log(`   Создано: ${created}`);
  console.log(`   Обновлено: ${updated}`);
  console.log(`   Всего: ${created + updated}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
