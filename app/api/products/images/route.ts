import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getProductImagePath, getVariantImages } from '@/lib/images';
import path from 'path';
import fs from 'fs';
import type { Dirent } from 'fs';

export const dynamic = 'force-dynamic';

// Получаем путь к папке images
const getImagesPath = () => {
  if (process.env.IMAGES_PATH) {
    return process.env.IMAGES_PATH;
  }
  // Используем папку pictr на рабочем столе пользователя
  return 'C:\\Users\\Вітання!\\Desktop\\pictr';
};

const IMAGES_BASE_PATH = getImagesPath();
// Путь к папкам часов
const PATH_WATCHES = 'C:\\Users\\Вітання!\\Desktop\\watch';
// Путь к папкам ноутбуков
const PATH_LAPTOPS = 'C:\\Users\\Вітання!\\Desktop\\Laptop';
// Путь к папкам Dyson
const PATH_DYSON = 'C:\\Users\\Вітання!\\Desktop\\dyson';
// Путь к папкам TV
const PATH_TV = 'C:\\Users\\Вітання!\\Desktop\\tv';
// Путь к папкам наушников
const PATH_HEADPHONES = 'C:\\Users\\Вітання!\\Desktop\\headphones';
// Путь к папкам VR
const PATH_VR = 'C:\\Users\\Вітання!\\Desktop\\VR';
// Путь к папкам консолей
const PATH_KONSOLE = 'C:\\Users\\Вітання!\\Desktop\\konsole';
// Путь к папкам Smart Home
const PATH_SMART_HOME = 'C:\\Users\\Вітання!\\Desktop\\Smart Home';
// Путь к папкам смартфонов (не iPhone)
const PATH_SMARTPHONE = 'C:\\Users\\Вітання!\\Desktop\\Smartphone';
// Путь к папкам камер
const PATH_KAMERA = 'C:\\Users\\Вітання!\\Desktop\\Kamera';
// Путь к папкам новых смартфонов
const PATH_12345 = 'C:\\Users\\Вітання!\\Desktop\\12345';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productSlug = searchParams.get('product');
    const variantId = searchParams.get('variant');
    const variantPath = searchParams.get('variantPath');
    // КРИТИЧНО: Получаем цвет и память из query параметров (если переданы)
    // Это позволяет загружать изображения для виртуальных вариантов с измененными цветом/памятью
    const requestedColor = searchParams.get('color');
    const requestedStorage = searchParams.get('storage');

    console.log('=== /api/products/images ===');
    console.log('IMAGES_BASE_PATH:', IMAGES_BASE_PATH);
    console.log('Product slug:', productSlug);
    console.log('Variant ID:', variantId);
    console.log('Requested color:', requestedColor);
    console.log('Requested storage:', requestedStorage);

    if (!productSlug) {
      return NextResponse.json(
        { error: 'Product slug is required' },
        { status: 400 }
      );
    }

    // Если указан вариант, получаем его изображения
    if (variantId || variantPath) {
      let actualVariantPath = variantPath;
      
      if (variantId && !variantPath) {
        // Получаем продукт и вариант из БД
        const productForVariant = await prisma.product.findUnique({
          where: { slug: productSlug },
          select: { slug: true, folderName: true, brand: true, model: true },
        });
        
        const variant = await prisma.productVariant.findUnique({
          where: { id: variantId },
          select: { 
            color: true,
            memory: true,
            storage: true,
            sku: true,
            images: true,
          },
        });
        
        // Проверяем, есть ли в БД поле variantPath в images JSON (сохраненное при импорте)
        let variantFolderName: string | null = null;
        try {
          if (variant?.images) {
            const parsed = JSON.parse(variant.images as string);
            // Если variantPath сохранен как часть данных варианта
            if (parsed.variantPath) {
              variantFolderName = parsed.variantPath;
              console.log('✅ Found variantPath in DB:', variantFolderName);
            }
          }
        } catch (e) {
          // Игнорируем ошибки парсинга
        }
        
        if (variant && productForVariant) {
          // Если у нас есть сохраненное название папки варианта, используем его
          if (variantFolderName) {
            console.log('✅ Using saved variant folder name:', variantFolderName);
            // КРИТИЧНО: Для iPhone 17/17 Air ищем в IMAGES_BASE_PATH (pictr), как для Pro/Pro Max
            // Для часов ищем в PATH_WATCHES
            // Папки должны быть скопированы в pictr или находиться в watch
            let folderPath = path.join(IMAGES_BASE_PATH, variantFolderName);
            
            // Если не найдено в IMAGES_BASE_PATH, проверяем в PATH_WATCHES (для часов)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_WATCHES, variantFolderName);
            }
            
            // Если не найдено в PATH_WATCHES, проверяем в PATH_LAPTOPS (для ноутбуков)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_LAPTOPS, variantFolderName);
            }
            
            // Если не найдено в PATH_LAPTOPS, проверяем в PATH_DYSON (для Dyson)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_DYSON, variantFolderName);
            }
            
            // Если не найдено в PATH_DYSON, проверяем в PATH_TV (для TV)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_TV, variantFolderName);
            }
            
            // Если не найдено в PATH_TV, проверяем в PATH_HEADPHONES (для наушников)
            if (!fs.existsSync(folderPath)) {
              const headphonesPath = path.join(PATH_HEADPHONES, variantFolderName);
              console.log(`🔍 Проверка PATH_HEADPHONES: ${headphonesPath}`);
              console.log(`   Существует: ${fs.existsSync(headphonesPath)}`);
              if (fs.existsSync(headphonesPath)) {
                folderPath = headphonesPath;
                console.log(`   ✅ Найдено в PATH_HEADPHONES!`);
              } else {
                // Пробуем найти папку с похожим именем
                try {
                  if (fs.existsSync(PATH_HEADPHONES)) {
                    const allFolders = fs.readdirSync(PATH_HEADPHONES, { withFileTypes: true })
                      .filter((item: Dirent) => item.isDirectory())
                      .map((item: Dirent) => item.name);
                    const matching = allFolders.find((f: string) => 
                      f === variantFolderName ||
                      f.toLowerCase() === variantFolderName.toLowerCase() ||
                      f.includes(variantFolderName.substring(0, 10)) ||
                      variantFolderName.includes(f.substring(0, 10))
                    );
                    if (matching) {
                      folderPath = path.join(PATH_HEADPHONES, matching);
                      console.log(`   💡 Найдена похожая папка: ${matching}`);
                    }
                  }
                } catch (e) {
                  console.log(`   ⚠️  Ошибка при поиске: ${e}`);
                }
              }
            }
            
            // Если не найдено в PATH_HEADPHONES, проверяем в PATH_VR (для VR)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_VR, variantFolderName);
            }
            
            // Если не найдено в PATH_VR, проверяем в PATH_KONSOLE (для консолей)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_KONSOLE, variantFolderName);
            }
            
            // Если не найдено в PATH_KONSOLE, проверяем в PATH_SMART_HOME (для Smart Home)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_SMART_HOME, variantFolderName);
            }
            
            // Если не найдено в PATH_SMART_HOME, проверяем в PATH_SMARTPHONE (для смартфонов)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_SMARTPHONE, variantFolderName);
            }
            
            // Если не найдено в PATH_SMARTPHONE, проверяем в PATH_KAMERA (для камер)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_KAMERA, variantFolderName);
            }
            
            // Если не найдено в PATH_KAMERA, проверяем в PATH_12345 (для новых смартфонов)
            if (!fs.existsSync(folderPath)) {
              folderPath = path.join(PATH_12345, variantFolderName);
            }
            
            console.log(`📂 Финальный folderPath: ${folderPath}`);
            console.log(`   Существует: ${fs.existsSync(folderPath)}`);
            
            if (fs.existsSync(folderPath)) {
              const images = fs.readdirSync(folderPath, { withFileTypes: true })
                .filter((file: Dirent) => file.isFile())
                .map((file: Dirent) => file.name)
                .filter((name: string) => {
                  // Исключаем резервные копии, но НЕ исключаем __main.jpeg (главное изображение для ноутбуков)
                  if (name.startsWith('_backup_')) {
                    return false;
                  }
                  // Для ноутбуков: исключаем __main.jpeg.webp, так как используем 00_main.webp
                  if (name.startsWith('__main') && name.includes('.webp')) {
                    return false;
                  }
                  // Исключаем другие файлы, начинающиеся с _, но не __main
                  if (name.startsWith('_') && !name.startsWith('__main')) {
                    return false;
                  }
                  const ext = path.extname(name).toLowerCase();
                  return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
                });
              
              if (images.length > 0) {
                // КРИТИЧНО: Убеждаемся, что 00_main.webp идет первым
                // Сортируем так, чтобы 00_main.webp был первым, остальные - по алфавиту
                const sortedImages = [...images].sort((a, b) => {
                  if (a === '00_main.webp') return -1;
                  if (b === '00_main.webp') return 1;
                  return a.localeCompare(b);
                });
                
                // Добавляем timestamp для обхода кеша браузера
                const timestamp = Date.now();
                const imageUrls = sortedImages.map((img: string) => {
                  const baseUrl = `/api/images/${encodeURIComponent(variantFolderName!)}/${encodeURIComponent(img)}`;
                  return `${baseUrl}?t=${timestamp}`;
                });
                console.log('✅ Found images in saved variant folder:', imageUrls.length);
                console.log('   First image:', sortedImages[0]);
                return NextResponse.json({
                  images: imageUrls,
                  mainImage: imageUrls[0],
                }, {
                  headers: {
                    'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'X-Timestamp': timestamp.toString(),
                  },
                });
              }
            }
          }
          console.log('🔍 Searching for variant folder:', {
            brand: productForVariant.brand,
            model: productForVariant.model,
            color: variant.color,
            memory: variant.memory,
            storage: variant.storage,
            sku: variant.sku,
          });
          
          // Определяем серию из SKU
          const skuLower = variant.sku.toLowerCase();
          let series = '';
          if (skuLower.includes('promax') || skuLower.includes('ip17pm')) {
            series = 'Pro Max';
          } else if (skuLower.includes('pro') || skuLower.includes('ip17p')) {
            series = 'Pro';
          } else if (skuLower.includes('air') || skuLower.includes('ip17air')) {
            series = 'Air';
          }
          // Если нет серии, это обычный iPhone 17 (Standard)
          
          // Определяем storage и color
          // КРИТИЧНО: Используем запрошенные color/storage, если они переданы
          // Это позволяет загружать изображения для виртуальных вариантов
          const storageValue = requestedStorage || variant.memory || variant.storage || '';
          const colorValue = requestedColor || variant.color || '';
          
          // Формируем возможные названия папки
          const possibleFolderNames: string[] = [];
          
          if (productForVariant.brand && productForVariant.model && storageValue && colorValue) {
            // Для iPhone 17 Air нужно учитывать, что модель может быть "iPhone 17 Air" или "iPhone 17" с серией "Air"
            const modelLower = productForVariant.model.toLowerCase();
            const isAir = modelLower.includes('air') || series === 'Air';
            const isPro = modelLower.includes('pro max') || series === 'Pro Max';
            const isProOnly = modelLower.includes('pro') && !modelLower.includes('max') || series === 'Pro';
            
            if (series) {
              // Вариант 1: "Apple iPhone 17 Pro Max 256GB (Deep Blue)"
              possibleFolderNames.push(
                `${productForVariant.brand} ${productForVariant.model} ${series} ${storageValue} (${colorValue})`
              );
              
              // Вариант 2: без серии в модели, добавляем серию
              const modelWithoutSeries = productForVariant.model
                .replace(/Pro Max|Pro|Air/gi, '')
                .trim();
              if (modelWithoutSeries) {
                possibleFolderNames.push(
                  `${productForVariant.brand} ${modelWithoutSeries} ${series} ${storageValue} (${colorValue})`
                );
              }
              
              // Вариант 3: для Air - "Apple iPhone 17 Air 256GB (Color)"
              if (isAir) {
                possibleFolderNames.push(
                  `${productForVariant.brand} iPhone 17 Air ${storageValue} (${colorValue})`
                );
                possibleFolderNames.push(
                  `${productForVariant.brand} iPhone 17 17 Air ${storageValue} (${colorValue})`
                );
              }
            } else {
              // Если серия не указана, пробуем разные варианты
              possibleFolderNames.push(
                `${productForVariant.brand} ${productForVariant.model} ${storageValue} (${colorValue})`
              );
              
              // Для моделей без явной серии
              if (modelLower.includes('iphone 17') && !modelLower.includes('pro') && !modelLower.includes('air')) {
                possibleFolderNames.push(
                  `${productForVariant.brand} iPhone 17 ${storageValue} (${colorValue})`
                );
              }
            }
          }
          
          console.log('🔍 Searching for folders:', possibleFolderNames);
          
          // КРИТИЧНО: Ищем в IMAGES_BASE_PATH (pictr) для всех iPhone 17 моделей
          let searchBasePath = IMAGES_BASE_PATH;
          
          // Ищем папки напрямую в базовой папке
          if (fs.existsSync(searchBasePath)) {
            const allFolders = fs.readdirSync(searchBasePath, { withFileTypes: true })
              .filter((item: Dirent) => item.isDirectory())
              .map((item: Dirent) => item.name);
            
            console.log('📂 Total folders in base path:', allFolders.length);
            
            // Ищем точное совпадение
            for (const folderName of possibleFolderNames) {
              const exactMatch = allFolders.find((f: string) => f === folderName);
              if (exactMatch) {
                const folderPath = path.join(searchBasePath, exactMatch);
                const images = fs.readdirSync(folderPath, { withFileTypes: true })
                  .filter((file) => file.isFile())
                  .map((file) => file.name)
                  .filter((name: string) => {
                    const ext = path.extname(name).toLowerCase();
                    return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
                  })
                  .sort();
                
                if (images.length > 0) {
                  actualVariantPath = exactMatch;
                  console.log('✅ Found exact match folder:', exactMatch, 'with', images.length, 'images');
                  break;
                }
              }
            }
            
            // Если не нашли точное совпадение, ищем частичное
            if (!actualVariantPath) {
              const searchTerms = [
                productForVariant.brand,
                series,
                storageValue,
                colorValue,
              ].filter(Boolean);
              
              console.log('🔍 Searching for partial match with terms:', searchTerms);
              
              for (const folder of allFolders) {
                const folderLower = folder.toLowerCase();
                let matches = 0;
                
                for (const term of searchTerms) {
                  if (term && folderLower.includes(term.toLowerCase())) {
                    matches++;
                  }
                }
                
                // Если совпадает хотя бы 3 из 4 терминов
                if (matches >= 3) {
                  const folderPath = path.join(searchBasePath, folder);
                  const images = fs.readdirSync(folderPath, { withFileTypes: true })
                    .filter((file: Dirent) => file.isFile())
                    .map((file: Dirent) => file.name)
                    .filter((name: string) => {
                      const ext = path.extname(name).toLowerCase();
                      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
                    })
                    .sort();
                  
                  if (images.length > 0) {
                    actualVariantPath = folder;
                    console.log('✅ Found partial match folder:', folder, 'with', images.length, 'images');
                    break;
                  }
                }
              }
            }
          }
        }
      }

      // Загружаем изображения из найденной папки
      if (actualVariantPath) {
        console.log('🔍 Loading images from folder:', actualVariantPath);
        
        const variantFolderPath = path.join(IMAGES_BASE_PATH, actualVariantPath);
        
        if (fs.existsSync(variantFolderPath)) {
          const imageFiles = fs.readdirSync(variantFolderPath, { withFileTypes: true })
            .filter((file: Dirent) => file.isFile())
            .map((file: Dirent) => file.name)
            .filter(name => {
              const ext = path.extname(name).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
            })
            .sort();
          
          if (imageFiles.length > 0) {
            const imageUrls = imageFiles.map((fileName: string) => {
              const encodedFolder = encodeURIComponent(actualVariantPath);
              const encodedFile = encodeURIComponent(fileName);
              return `/api/images/${encodedFolder}/${encodedFile}`;
            });
            
            console.log('✅ Found', imageUrls.length, 'images in folder:', actualVariantPath);
            return NextResponse.json({
              images: imageUrls,
              mainImage: imageUrls[0],
            });
          }
        }
      }
    }

    // Если вариант не указан или не найден, пробуем найти основное изображение продукта
    const product = await prisma.product.findUnique({
      where: { slug: productSlug },
      select: { folderName: true },
    });
    
    // Пробуем получить изображение через getProductImagePath
    const imagePath = getProductImagePath(productSlug, undefined, product?.folderName);
    if (imagePath && fs.existsSync(imagePath)) {
      const relativePath = path.relative(IMAGES_BASE_PATH, imagePath).replace(/\\/g, '/');
      console.log('Found image via getProductImagePath:', relativePath);
      return NextResponse.json({
        images: [`/api/images/${relativePath}`],
        mainImage: `/api/images/${relativePath}`,
      });
    }
    
    // Если изображение не найдено, возвращаем пустой массив
    console.log('❌ No image found for product:', productSlug);
    return NextResponse.json({
      images: [],
      mainImage: null,
    });
  } catch (error) {
    console.error('❌ Error getting product images:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json(
      { error: 'Failed to get product images', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
