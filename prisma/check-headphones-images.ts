import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

const PATH_HEADPHONES = 'C:\\Users\\Вітання!\\Desktop\\headphones';

async function main() {
  console.log('🎧 Проверка наушников и их изображений...\n');

  // Получаем все наушники
  const headphones = await prisma.product.findMany({
    where: {
      category: {
        slug: 'headphones',
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`Найдено наушников: ${headphones.length}\n`);

  for (const product of headphones) {
    console.log(`📱 ${product.model}`);
    console.log(`   Slug: ${product.slug}`);
    
    if (product.variants.length === 0) {
      console.log('   ⚠️  Нет вариантов!');
      continue;
    }

    const variant = product.variants[0];
    console.log(`   Variant ID: ${variant.id}`);
    
    // Проверяем images поле
    if (variant.images) {
      try {
        const parsed = JSON.parse(variant.images as string);
        console.log('   Images JSON:', JSON.stringify(parsed, null, 2));
        
        if (parsed.variantPath) {
          const folderPath = path.join(PATH_HEADPHONES, parsed.variantPath);
          console.log(`   Folder path: ${folderPath}`);
          console.log(`   Folder exists: ${fs.existsSync(folderPath)}`);
          
          if (fs.existsSync(folderPath)) {
            const files = fs.readdirSync(folderPath);
            const imageFiles = files.filter(f => {
              const ext = path.extname(f).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
            });
            console.log(`   Image files: ${imageFiles.length}`);
            if (imageFiles.length > 0) {
              console.log(`   First image: ${imageFiles[0]}`);
              const mainImage = imageFiles.find(f => f.includes('00_main') || f.includes('_main'));
              if (mainImage) {
                console.log(`   ✅ Main image found: ${mainImage}`);
              } else {
                console.log(`   ⚠️  Main image not found, first image: ${imageFiles[0]}`);
              }
            } else {
              console.log('   ❌ Нет изображений в папке!');
            }
          } else {
            console.log('   ❌ Папка не существует!');
            
            // Проверяем, есть ли папка с похожим именем
            if (fs.existsSync(PATH_HEADPHONES)) {
              const allFolders = fs.readdirSync(PATH_HEADPHONES, { withFileTypes: true })
                .filter(item => item.isDirectory())
                .map(item => item.name);
              console.log(`   Доступные папки в headphones: ${allFolders.length}`);
              const similar = allFolders.find(f => 
                f.toLowerCase().includes(product.model.toLowerCase().substring(0, 10)) ||
                product.model.toLowerCase().includes(f.toLowerCase().substring(0, 10))
              );
              if (similar) {
                console.log(`   💡 Похожая папка найдена: ${similar}`);
              }
            } else {
              console.log(`   ❌ Базовая папка не существует: ${PATH_HEADPHONES}`);
            }
          }
        } else {
          console.log('   ❌ variantPath не найден в images JSON!');
        }
      } catch (e) {
        console.log('   ❌ Ошибка парсинга images JSON:', e);
      }
    } else {
      console.log('   ❌ Поле images пустое!');
    }
    console.log('');
  }
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
