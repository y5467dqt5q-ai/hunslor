import fs from 'fs';
import path from 'path';

// Получаем путь из переменной окружения или используем локальную папку
const getImagesPath = () => {
  if (process.env.IMAGES_PATH) {
    return process.env.IMAGES_PATH;
  }
  // Используем папку pictr на рабочем столе пользователя
  return 'C:\\Users\\Вітання!\\Desktop\\pictr';
};

const IMAGES_BASE_PATH = getImagesPath();

export interface ImageInfo {
  path: string;
  url: string;
  exists: boolean;
}

/**
 * Найти папку продукта по slug или folderName
 */
function findProductFolder(productSlug: string, folderName?: string | null): string | null {
  // Сначала пробуем по folderName (точное совпадение)
  if (folderName) {
    const folderPath = path.join(IMAGES_BASE_PATH, folderName);
    if (fs.existsSync(folderPath)) {
      return folderName;
    }
  }
  
  // Пробуем по slug (точное совпадение)
  const slugPath = path.join(IMAGES_BASE_PATH, productSlug);
  if (fs.existsSync(slugPath)) {
    return productSlug;
  }
  
  // Ищем папку, которая начинается с slug или содержит его
  if (!fs.existsSync(IMAGES_BASE_PATH)) {
    return null;
  }
  
  const folders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);
  
  // Ищем точное совпадение по slug (case-insensitive)
  const slugLower = productSlug.toLowerCase();
  for (const folder of folders) {
    const folderSlug = folder.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (folderSlug === slugLower || folder.toLowerCase() === slugLower) {
      return folder;
    }
  }
  
  // Ищем частичное совпадение
  for (const folder of folders) {
    const folderSlug = folder.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    if (folderSlug.includes(slugLower) || slugLower.includes(folderSlug)) {
      return folder;
    }
  }
  
  return null;
}

/**
 * Получить путь к изображению продукта
 */
export function getProductImagePath(productSlug: string, variantPath?: string, folderName?: string | null): string | null {
  const actualFolderName = findProductFolder(productSlug, folderName);
  if (!actualFolderName) {
    return null;
  }
  
  const productFolder = path.join(IMAGES_BASE_PATH, actualFolderName);
  
  if (!fs.existsSync(productFolder)) {
    return null;
  }

  // Если указан вариант, ищем в подпапке варианта
  if (variantPath) {
    const variantFolder = path.join(productFolder, variantPath);
    if (fs.existsSync(variantFolder)) {
      const images = getImagesFromFolder(variantFolder);
      if (images.length > 0) {
        return images[0];
      }
    }
  }

  // Иначе берем первую картинку из основной папки
  const images = getImagesFromFolder(productFolder);
  return images.length > 0 ? images[0] : null;
}

/**
 * Получить все изображения из папки (только файлы, не подпапки)
 */
function getImagesFromFolder(folderPath: string): string[] {
  if (!fs.existsSync(folderPath)) {
    return [];
  }

  const files = fs.readdirSync(folderPath, { withFileTypes: true });
  const imageFiles = files
    .filter(file => file.isFile())
    .map(file => path.join(folderPath, file.name))
    .filter(filePath => {
      const ext = path.extname(filePath).toLowerCase();
      return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
    })
    .sort(); // Сортируем по имени (01-main.webp будет первым)

  return imageFiles;
}

/**
 * Получить все изображения продукта (включая варианты)
 */
export function getAllProductImages(productSlug: string): ImageInfo[] {
  const productFolder = path.join(IMAGES_BASE_PATH, productSlug);
  
  if (!fs.existsSync(productFolder)) {
    return [];
  }

  const images: ImageInfo[] = [];
  
  // Изображения из основной папки
  const mainImages = getImagesFromFolder(productFolder);
  mainImages.forEach(imgPath => {
    images.push({
      path: imgPath,
      url: `/api/images/${productSlug}/${path.basename(imgPath)}`,
      exists: true,
    });
  });

  // Изображения из подпапок (варианты)
  const subfolders = fs.readdirSync(productFolder, { withFileTypes: true })
    .filter(item => item.isDirectory())
    .map(item => item.name);

  subfolders.forEach(subfolder => {
    const variantFolder = path.join(productFolder, subfolder);
    const variantImages = getImagesFromFolder(variantFolder);
    variantImages.forEach(imgPath => {
      images.push({
        path: imgPath,
        url: `/api/images/${productSlug}/${subfolder}/${path.basename(imgPath)}`,
        exists: true,
      });
    });
  });

  return images;
}

/**
 * Получить изображения для варианта
 */
export function getVariantImages(productFolderName: string, variantPath: string): ImageInfo[] {
  // productFolderName может быть как slug, так и folderName
  const productFolder = path.join(IMAGES_BASE_PATH, productFolderName);
  const variantFolder = path.join(productFolder, variantPath);
  
  console.log('getVariantImages - productFolder:', productFolder);
  console.log('getVariantImages - variantFolder:', variantFolder);
  console.log('getVariantImages - exists:', fs.existsSync(variantFolder));
  
  if (!fs.existsSync(variantFolder)) {
    console.log('❌ Variant folder does not exist:', variantFolder);
    return [];
  }

  // Получаем все изображения из папки, включая подпапки если нужно
  const images: string[] = [];
  
  // Сначала проверяем файлы в корне папки варианта
  const rootImages = getImagesFromFolder(variantFolder);
  images.push(...rootImages);
  
  // Если в корне нет изображений, проверяем подпапки
  if (images.length === 0) {
    try {
      const subfolders = fs.readdirSync(variantFolder, { withFileTypes: true })
        .filter(item => item.isDirectory())
        .map(item => item.name);
      
      for (const subfolder of subfolders) {
        const subfolderPath = path.join(variantFolder, subfolder);
        const subImages = getImagesFromFolder(subfolderPath);
        images.push(...subImages);
      }
    } catch (error) {
      console.error('Error reading subfolders:', error);
    }
  }
  
  console.log('getVariantImages - found images:', images.length, images.slice(0, 5).map(p => path.basename(p)));
  
  // Возвращаем все изображения, отсортированные по имени
  return images.map(imgPath => {
    const fileName = path.basename(imgPath);
    // Определяем относительный путь от папки варианта
    const relativePath = path.relative(variantFolder, imgPath);
    const pathParts = relativePath.split(path.sep);
    
    // Формируем URL
    const encodedFolder = encodeURIComponent(productFolderName);
    const encodedVariant = encodeURIComponent(variantPath);
    
    let url = `/api/images/${encodedFolder}/${encodedVariant}`;
    if (pathParts.length > 1 && pathParts[0] !== fileName) {
      // Если изображение в подпапке
      url += `/${encodeURIComponent(pathParts[0])}`;
    }
    url += `/${encodeURIComponent(fileName)}`;
    
    return {
      path: imgPath,
      url: url,
      exists: true,
    };
  });
}

/**
 * Проверить существование изображения
 */
export function imageExists(imagePath: string): boolean {
  return fs.existsSync(imagePath);
}
