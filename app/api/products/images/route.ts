import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import path from 'path';
import fs from 'fs';
import type { Dirent } from 'fs';

export const dynamic = 'force-dynamic';

// Получаем путь к папке images - всегда используем public/images
const getImagesPath = () => {
  if (process.env.IMAGES_PATH) {
    return process.env.IMAGES_PATH;
  }
  return path.join(process.cwd(), 'public', 'images');
};

const IMAGES_BASE_PATH = getImagesPath();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productSlug = searchParams.get('product');
    const variantId = searchParams.get('variant');
    const variantPath = searchParams.get('variantPath');
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
        
        // Проверяем, есть ли в БД поле variantPath в images JSON
        let variantFolderName: string | null = null;
        try {
          if (variant?.images) {
            const parsed = JSON.parse(variant.images as string);
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
            const folderPath = path.join(IMAGES_BASE_PATH, variantFolderName);
            
            console.log(`📂 Checking folderPath: ${folderPath}`);
            
            if (fs.existsSync(folderPath)) {
              actualVariantPath = variantFolderName;
            } else {
                // Try to find case-insensitive match
                if (fs.existsSync(IMAGES_BASE_PATH)) {
                    const allFolders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
                        .filter(item => item.isDirectory())
                        .map(item => item.name);
                    
                    const match = allFolders.find(f => f.toLowerCase() === variantFolderName!.toLowerCase());
                    if (match) {
                        actualVariantPath = match;
                    }
                }
            }
          }
          
          // Если не нашли по сохраненному пути, пробуем эвристику
          if (!actualVariantPath) {
            console.log('🔍 Searching for variant folder:', {
                brand: productForVariant.brand,
                model: productForVariant.model,
                color: variant.color,
                memory: variant.memory,
                storage: variant.storage,
                sku: variant.sku,
            });

            // ... (rest of search logic logic could go here, but with proper DB seeding it shouldn't be needed)
            // Keeping the search logic simple for now as we rely on seeding.
            
            const storageValue = requestedStorage || variant.memory || variant.storage || '';
            const colorValue = requestedColor || variant.color || '';
            
            if (productForVariant.brand && productForVariant.model && storageValue && colorValue) {
                // Try to construct folder name: Brand Model Storage (Color)
                 const possibleNames = [
                    `${productForVariant.brand} ${productForVariant.model} ${storageValue} (${colorValue})`,
                    `${productForVariant.brand} ${productForVariant.model} ${storageValue} (${colorValue})`.replace('Pro Max', 'Pro Max'), // just in case
                 ];

                 if (fs.existsSync(IMAGES_BASE_PATH)) {
                    const allFolders = fs.readdirSync(IMAGES_BASE_PATH, { withFileTypes: true })
                        .filter(item => item.isDirectory())
                        .map(item => item.name);
                    
                    // Simple search
                    for (const name of possibleNames) {
                        const match = allFolders.find(f => f.toLowerCase() === name.toLowerCase());
                        if (match) {
                            actualVariantPath = match;
                            break;
                        }
                    }
                    
                    // Partial match search if strict fail
                    if (!actualVariantPath) {
                        const searchTerms = [productForVariant.brand, productForVariant.model, storageValue, colorValue].filter(Boolean);
                         const match = allFolders.find(folder => {
                             const folderLower = folder.toLowerCase();
                             const matchCount = searchTerms.filter(term => folderLower.includes(term.toLowerCase())).length;
                             return matchCount >= searchTerms.length; // strict partial
                         });
                         if (match) actualVariantPath = match;
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
          const images = fs.readdirSync(variantFolderPath, { withFileTypes: true })
            .filter((file: Dirent) => file.isFile())
            .map((file: Dirent) => file.name)
            .filter((name: string) => {
              if (name.startsWith('_backup_')) return false;
              if (name.startsWith('__main') && name.includes('.webp')) return false;
              if (name.startsWith('_') && !name.startsWith('__main')) return false;
              const ext = path.extname(name).toLowerCase();
              return ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext);
            });
          
          if (images.length > 0) {
            const sortedImages = [...images].sort((a, b) => {
              if (a === '00_main.webp') return -1;
              if (b === '00_main.webp') return 1;
              return a.localeCompare(b);
            });
            
            const timestamp = Date.now();
            const imageUrls = sortedImages.map((img: string) => {
              const baseUrl = `/api/images/${encodeURIComponent(actualVariantPath!)}/${encodeURIComponent(img)}`;
              return `${baseUrl}?t=${timestamp}`;
            });
            
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
    }
    
    return NextResponse.json({ images: [], mainImage: null });
  } catch (error) {
    console.error('Error in /api/products/images:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
