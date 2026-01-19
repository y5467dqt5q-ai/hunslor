import fs from 'fs';
import path from 'path';

// Путь к папке с мини-картинками
const getCategoryIconsPath = () => {
  if (process.env.CATEGORY_ICONS_PATH) {
    return process.env.CATEGORY_ICONS_PATH;
  }
  return 'C:\\Users\\Вітання!\\Desktop\\мини картинки';
};

const CATEGORY_ICONS_BASE_PATH = getCategoryIconsPath();

/**
 * Найти первое изображение в папке категории
 */
export function getCategoryIcon(categoryName: string): string | null {
  if (!fs.existsSync(CATEGORY_ICONS_BASE_PATH)) {
    return null;
  }

  // Возможные варианты названий папок
  const possibleFolderNames = [
    categoryName,
    categoryName.toLowerCase(),
    categoryName.toUpperCase(),
    // Немецкие названия
    categoryName === 'Smartphone' ? 'Smartphone' : null,
    categoryName === 'Smartwatch' ? 'Smartwatch' : null,
    categoryName === 'Konsole' ? 'Konsole' : categoryName === 'Console' ? 'Konsole' : null,
    categoryName === 'VR' ? 'VR' : null,
    categoryName === 'Kopfhörer' ? 'Kopfhörer' : categoryName === 'Headphone' ? 'Kopfhörer' : null,
    categoryName === 'Dyson' ? 'Dyson' : null,
  ].filter(Boolean) as string[];

  for (const folderName of possibleFolderNames) {
    const folderPath = path.join(CATEGORY_ICONS_BASE_PATH, folderName);
    if (fs.existsSync(folderPath) && fs.statSync(folderPath).isDirectory()) {
      // Ищем первое изображение в папке
      const files = fs.readdirSync(folderPath, { withFileTypes: true })
        .filter(file => file.isFile())
        .map(file => file.name)
        .filter(fileName => {
          const ext = path.extname(fileName).toLowerCase();
          return ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'].includes(ext);
        })
        .sort();

      if (files.length > 0) {
        return `/api/category-icons/${encodeURIComponent(folderName)}/${encodeURIComponent(files[0])}`;
      }
    }
  }

  return null;
}
