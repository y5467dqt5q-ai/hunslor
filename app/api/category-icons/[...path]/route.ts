import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Путь к папке с мини-картинками
const getCategoryIconsPath = () => {
  if (process.env.CATEGORY_ICONS_PATH) {
    return process.env.CATEGORY_ICONS_PATH;
  }
  // Используем папку мини картинки на рабочем столе пользователя
  const defaultPath = 'C:\\Users\\Вітання!\\Desktop\\мини картинки';
  console.log('📁 Category icons path:', defaultPath);
  return defaultPath;
};

const CATEGORY_ICONS_BASE_PATH = getCategoryIconsPath();

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    console.log('=== /api/category-icons ===');
    console.log('CATEGORY_ICONS_BASE_PATH:', CATEGORY_ICONS_BASE_PATH);
    console.log('Base path exists:', fs.existsSync(CATEGORY_ICONS_BASE_PATH));
    
    // Декодируем каждый сегмент пути
    const decodedPath = params.path.map((segment: string) => {
      try {
        return decodeURIComponent(segment);
      } catch (e) {
        return segment;
      }
    });
    
    console.log('Requested path (raw):', params.path);
    console.log('Requested path (decoded):', decodedPath);
    
    // Если передан только путь к папке (без имени файла), ищем первое изображение в папке
    let imagePath = path.join(CATEGORY_ICONS_BASE_PATH, ...decodedPath);
    console.log('Full image path:', imagePath);
    console.log('Path exists:', fs.existsSync(imagePath));
    
    // Всегда ищем папку, даже если путь не существует напрямую
    let folderPath = imagePath;
    let foundFolder = false;
    
    // Проверяем, существует ли путь как папка
    if (fs.existsSync(imagePath) && fs.statSync(imagePath).isDirectory()) {
      foundFolder = true;
      folderPath = imagePath;
      console.log('✅ Found directory directly:', folderPath);
    } else {
      // Если путь не существует, ищем папку с похожим названием
      console.log('⚠️ Path does not exist, searching for folder...');
      if (fs.existsSync(CATEGORY_ICONS_BASE_PATH)) {
        const folders = fs.readdirSync(CATEGORY_ICONS_BASE_PATH, { withFileTypes: true })
          .filter((item) => item.isDirectory())
          .map((item) => item.name);
        
        console.log('📂 Available folders:', folders);
        
        // Ищем папку с похожим названием (case-insensitive)
        const searchName = decodedPath[0]?.toLowerCase();
        console.log('🔍 Searching for folder matching:', searchName);
        
        const matchingFolder = folders.find(f => {
          const folderLower = f.toLowerCase();
          return folderLower === searchName || 
                 folderLower.includes(searchName) || 
                 searchName?.includes(folderLower);
        });
        
        if (matchingFolder) {
          console.log('✅ Found matching folder:', matchingFolder);
          folderPath = path.join(CATEGORY_ICONS_BASE_PATH, matchingFolder);
          foundFolder = true;
        } else {
          console.log('❌ No matching folder found');
        }
      }
    }
    
    // Если нашли папку, ищем первое изображение внутри
    if (foundFolder && fs.existsSync(folderPath)) {
      console.log('🔍 Searching for images in folder:', folderPath);
      const files = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter((file) => file.isFile())
        .map((file) => file.name)
        .filter(fileName => {
          const ext = path.extname(fileName).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
        })
        .sort();
      
      console.log('📸 Found image files:', files);
      
      if (files.length > 0) {
        imagePath = path.join(folderPath, files[0]);
        console.log('✅ Using image:', imagePath);
      } else {
        console.log('❌ No images found in directory');
        // Если нет изображений в папке, возвращаем placeholder
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
    }
    
    // Security: проверяем, что путь находится внутри базовой папки
    const normalizedBase = path.normalize(CATEGORY_ICONS_BASE_PATH);
    const normalizedImage = path.normalize(imagePath);
    
    if (!normalizedImage.startsWith(normalizedBase)) {
      console.log('Security check failed: path outside base directory');
      return new NextResponse('Forbidden', { status: 403 });
    }

    // Проверяем существование файла
    if (!fs.existsSync(imagePath)) {
      console.log('Image file does not exist:', imagePath);
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
    
    let contentType = 'image/jpeg';
    if (ext === '.png') contentType = 'image/png';
    else if (ext === '.webp') contentType = 'image/webp';
    else if (ext === '.gif') contentType = 'image/gif';
    else if (ext === '.svg') contentType = 'image/svg+xml';

    console.log('✅ Serving image:', imagePath, 'Content-Type:', contentType);
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('❌ Error serving category icon:', error);
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
