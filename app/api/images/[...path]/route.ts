import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import os from 'os';
import type { Dirent } from 'fs';

export const dynamic = 'force-dynamic';

// Получаем путь из переменной окружения или используем дефолтный
const getImagesPath = () => {
  if (process.env.IMAGES_PATH) {
    return process.env.IMAGES_PATH;
  }
  
  // Для продакшена (Railway) используем путь внутри контейнера
  if (process.env.NODE_ENV === 'production') {
    return path.join(process.cwd(), 'public', 'images');
  }

  // Используем папку pictr на рабочем столе пользователя (только для локальной разработки)
  return 'C:\\Users\\Вітання!\\Desktop\\pictr';
};

// Путь к папкам iPhone 17 и 17 Air (если они не в pictr)
const PATH_17_AIR = 'C:\\Users\\Вітання!\\Desktop\\17 ейр и 17';
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

const IMAGES_BASE_PATH = getImagesPath();

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Декодируем каждый сегмент пути
    const decodedPath = params.path.map((segment: string) => {
      try {
        return decodeURIComponent(segment);
      } catch (e) {
        // Если декодирование не удалось, используем как есть
        return segment;
      }
    });
    
    console.log('=== /api/images ===');
    console.log('IMAGES_BASE_PATH:', IMAGES_BASE_PATH);
    console.log('Requested path (raw):', params.path);
    console.log('Requested path (decoded):', decodedPath);
    
    // КРИТИЧНО: Проверяем сначала в IMAGES_BASE_PATH
    let imagePath = path.join(IMAGES_BASE_PATH, ...decodedPath);
    let basePath = IMAGES_BASE_PATH;
    
    // В продакшене (Railway) мы НЕ используем локальные пути
    // Это предотвращает попытки чтения C:\Users\... на Linux сервере
    if (process.env.NODE_ENV !== 'production') {
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в IMAGES_BASE_PATH, проверяем в PATH_17_AIR
        imagePath = path.join(PATH_17_AIR, ...decodedPath);
        basePath = PATH_17_AIR;
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_17_AIR, проверяем в PATH_WATCHES (для часов)
        imagePath = path.join(PATH_WATCHES, ...decodedPath);
        basePath = PATH_WATCHES;
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_WATCHES, проверяем в PATH_LAPTOPS (для ноутбуков)
        imagePath = path.join(PATH_LAPTOPS, ...decodedPath);
        basePath = PATH_LAPTOPS;
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_LAPTOPS, проверяем в PATH_DYSON (для Dyson)
        imagePath = path.join(PATH_DYSON, ...decodedPath);
        basePath = PATH_DYSON;
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_DYSON, проверяем в PATH_TV (для TV)
        imagePath = path.join(PATH_TV, ...decodedPath);
        basePath = PATH_TV;
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_TV, проверяем в PATH_HEADPHONES (для наушников)
        const headphonesPath = path.join(PATH_HEADPHONES, ...decodedPath);
        console.log(`🔍 Проверка PATH_HEADPHONES: ${headphonesPath}`);
        if (fs.existsSync(headphonesPath)) {
          imagePath = headphonesPath;
          basePath = PATH_HEADPHONES;
          console.log(`   ✅ Найдено в PATH_HEADPHONES!`);
        }
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_HEADPHONES, проверяем в PATH_VR (для VR)
        const vrPath = path.join(PATH_VR, ...decodedPath);
        if (fs.existsSync(vrPath)) {
          imagePath = vrPath;
          basePath = PATH_VR;
        }
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_VR, проверяем в PATH_KONSOLE (для консолей)
        const konsolePath = path.join(PATH_KONSOLE, ...decodedPath);
        if (fs.existsSync(konsolePath)) {
          imagePath = konsolePath;
          basePath = PATH_KONSOLE;
        }
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_KONSOLE, проверяем в PATH_SMART_HOME (для Smart Home)
        const smartHomePath = path.join(PATH_SMART_HOME, ...decodedPath);
        if (fs.existsSync(smartHomePath)) {
          imagePath = smartHomePath;
          basePath = PATH_SMART_HOME;
        }
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_SMART_HOME, проверяем в PATH_SMARTPHONE (для смартфонов)
        const smartphonePath = path.join(PATH_SMARTPHONE, ...decodedPath);
        if (fs.existsSync(smartphonePath)) {
          imagePath = smartphonePath;
          basePath = PATH_SMARTPHONE;
        }
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_SMARTPHONE, проверяем в PATH_KAMERA (для камер)
        const kameraPath = path.join(PATH_KAMERA, ...decodedPath);
        if (fs.existsSync(kameraPath)) {
          imagePath = kameraPath;
          basePath = PATH_KAMERA;
        }
      }
      
      if (!fs.existsSync(imagePath)) {
        // Если файл не найден в PATH_KAMERA, проверяем в PATH_12345 (для новых смартфонов)
        const path12345 = path.join(PATH_12345, ...decodedPath);
        if (fs.existsSync(path12345)) {
          imagePath = path12345;
          basePath = PATH_12345;
        }
      }
    }
    
    console.log('Full image path:', imagePath);
    console.log('Base path:', basePath);
    console.log('File exists:', fs.existsSync(imagePath));
    
    // Security: проверяем, что путь находится внутри базовой папки
    const normalizedBase = path.normalize(basePath);
    const normalizedImage = path.normalize(imagePath);
    
    if (!normalizedImage.startsWith(normalizedBase)) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Проверяем существование файла
    if (!fs.existsSync(imagePath)) {
      // DEBUG: Если файл не найден, выводим содержимое родительской папки, чтобы понять структуру
      const parentDir = path.dirname(imagePath);
      console.log(`❌ File not found: ${imagePath}`);
      if (fs.existsSync(parentDir)) {
         console.log(`📂 Contents of ${parentDir}:`);
         try {
           const files = fs.readdirSync(parentDir);
           console.log(files.join('\n'));
         } catch (e) {
           console.error('Error reading directory:', e);
         }
      } else {
         console.log(`❌ Parent directory does not exist: ${parentDir}`);
         // Попробуем вывести содержимое IMAGES_BASE_PATH
         if (fs.existsSync(IMAGES_BASE_PATH)) {
            console.log(`📂 Contents of IMAGES_BASE_PATH (${IMAGES_BASE_PATH}):`);
            try {
               const files = fs.readdirSync(IMAGES_BASE_PATH);
               console.log(files.slice(0, 20).join('\n') + (files.length > 20 ? '\n...and more' : ''));
            } catch (e) {
               console.error('Error reading IMAGES_BASE_PATH:', e);
            }
         }
      }

      // Возвращаем прозрачный 1x1 PNG placeholder
      const transparentPng = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );
      return new NextResponse(transparentPng, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    const fileBuffer = fs.readFileSync(imagePath);
    const ext = path.extname(imagePath).toLowerCase();
    const stats = fs.statSync(imagePath);
    
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';

    // Генерируем ETag на основе размера файла и времени модификации
    const etag = `${stats.size}-${stats.mtime.getTime()}`;
    const lastModified = stats.mtime.toUTCString();

    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'ETag': `"${etag}"`,
        'Last-Modified': lastModified,
      },
    });
  } catch (error) {
    console.error('❌ Error serving image:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Возвращаем прозрачный placeholder при ошибке
    const transparentPng = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );
    return new NextResponse(transparentPng, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  }
}
