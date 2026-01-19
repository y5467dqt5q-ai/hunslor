import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const POSSIBLE_PATHS = [
  'C:\\Users\\Вітання!\\Desktop\\pictr',
  'C:\\Users\\Вітання!\\Desktop\\headphones',
  'C:\\Users\\Вітання!\\Desktop\\Headphones',
];

async function main() {
  console.log('🔍 Поиск изображений наушников...\n');

  // Получаем все наушники из БД
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

  console.log(`Найдено наушников в БД: ${headphones.length}\n`);

  for (const product of headphones) {
    const variant = product.variants[0];
    if (!variant || !variant.images) continue;

    try {
      const parsed = JSON.parse(variant.images as string);
      const variantPath = parsed.variantPath;
      
      if (!variantPath) {
        console.log(`❌ ${product.model}: нет variantPath`);
        continue;
      }

      console.log(`\n📱 ${product.model}`);
      console.log(`   variantPath: ${variantPath}`);

      // Ищем папку во всех возможных местах
      let found = false;
      for (const basePath of POSSIBLE_PATHS) {
        if (!fs.existsSync(basePath)) continue;

        const folderPath = path.join(basePath, variantPath);
        if (fs.existsSync(folderPath)) {
          console.log(`   ✅ Найдена папка: ${folderPath}`);
          const files = fs.readdirSync(folderPath);
          const imageFiles = files.filter(f => {
            const ext = path.extname(f).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
          });
          console.log(`   📸 Изображений: ${imageFiles.length}`);
          if (imageFiles.length > 0) {
            console.log(`   Первые 3: ${imageFiles.slice(0, 3).join(', ')}`);
          }
          found = true;
          break;
        }

        // Также проверяем подпапки
        try {
          const subFolders = fs.readdirSync(basePath, { withFileTypes: true })
            .filter(item => item.isDirectory())
            .map(item => item.name);
          
          const matching = subFolders.find(f => 
            f.toLowerCase().includes(variantPath.toLowerCase().substring(0, 10)) ||
            variantPath.toLowerCase().includes(f.toLowerCase().substring(0, 10))
          );
          
          if (matching) {
            const folderPath = path.join(basePath, matching);
            console.log(`   💡 Похожая папка найдена: ${folderPath}`);
            const files = fs.readdirSync(folderPath);
            const imageFiles = files.filter(f => {
              const ext = path.extname(f).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
            });
            console.log(`   📸 Изображений: ${imageFiles.length}`);
            found = true;
          }
        } catch (e) {
          // Игнорируем ошибки
        }
      }

      if (!found) {
        console.log(`   ❌ Папка не найдена ни в одном из мест`);
      }
    } catch (e) {
      console.log(`   ❌ Ошибка: ${e}`);
    }
  }

  await prisma.$disconnect();
}

main().catch(console.error);
