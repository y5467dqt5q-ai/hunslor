import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';
import { importProductsFromFolder } from '@/lib/import-products';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

export async function GET() {
  const logs: string[] = [];
  const log = (msg: string) => {
    console.log(msg);
    logs.push(msg);
  };

  try {
    log('🚀 Starting Debug Seed & Fix...');
    log(`Environment: ${process.env.NODE_ENV}`);
    
    // 1. Ensure Categories Exist
    log('Checking categories...');
    const categoryCount = await prisma.category.count();
    log(`Current category count: ${categoryCount}`);

    // 2. Import Products
    log('📦 Importing products from folder...');
    const products = importProductsFromFolder();
    log(`Found ${products.length} products to import`);

    let successCount = 0;
    let errorCount = 0;

    // 3. Insert into DB (Force Seed)
    log('⚡ STARTING DATABASE INSERTION...');
    
    for (const productData of products) {
        try {
            // Find category
            let category = await prisma.category.findFirst({
                where: {
                    OR: [
                        { slug: productData.categorySlug },
                        { children: { some: { slug: productData.categorySlug } } },
                    ],
                },
            });

            if (!category) {
                // Fallback to first available
                 category = await prisma.category.findFirst({
                    where: { parentId: null },
                });
            }

            if (!category) {
                log(`❌ SKIP: No category for ${productData.slug}`);
                continue;
            }

            // Upsert Product
             const product = await prisma.product.upsert({
                where: { slug: productData.slug },
                update: {
                    brand: productData.brand,
                    model: productData.model,
                    basePrice: productData.basePrice,
                    discount: productData.discount,
                    folderName: productData.folderName || null,
                    categoryId: category.id,
                },
                create: {
                    slug: productData.slug,
                    folderName: productData.folderName || null,
                    brand: productData.brand,
                    model: productData.model,
                    categoryId: category.id,
                    baseDescription: `Premium ${productData.brand} ${productData.model}`,
                    baseImages: JSON.stringify([]),
                    basePrice: productData.basePrice,
                    discount: productData.discount,
                },
            });

            // Delete old variants
            await prisma.productVariant.deleteMany({
                where: { productId: product.id },
            });

            // Create variants
            for (const variantData of productData.variants) {
                 const images: string[] = [];
                 const imageData: { images: string[]; variantPath?: string } = { images: [] };

                 if (variantData.images && variantData.images.length > 0) {
                    // Используем уже найденные изображения
                    imageData.images = variantData.images;
                 } else {
                     // Fallback logic if no images found
                     if (variantData.variantPath) {
                        if (variantData.variantPath.includes('Apple iPhone 17')) {
                            imageData.variantPath = variantData.variantPath;
                            images.push(`${variantData.variantPath}/01-main.webp`);
                        } else {
                            images.push(`${productData.slug}/${variantData.variantPath}/01-main.webp`);
                        }
                        imageData.images = images;
                     } else {
                        images.push(`${productData.slug}/01-main.webp`);
                        imageData.images = images;
                     }
                 }

                 await prisma.productVariant.create({
                    data: {
                        productId: product.id,
                        color: variantData.color || null,
                        memory: variantData.memory || null,
                        size: variantData.size || null,
                        ram: variantData.ram || null,
                        storage: variantData.storage || null,
                        priceModifier: variantData.priceModifier,
                        images: JSON.stringify(imageData),
                        stock: variantData.stock,
                        inStock: variantData.stock > 0,
                        sku: variantData.sku,
                    }
                 });
            }
            successCount++;
        } catch (err: any) {
            errorCount++;
            log(`❌ ERROR on ${productData.slug}: ${err.message}`);
        }
    }

    log(`🏁 Finished! Success: ${successCount}, Errors: ${errorCount}`);
    
    const finalCount = await prisma.product.count();

    return NextResponse.json({ 
      success: true, 
      logs,
      stats: { productsFound: products.length, productsInDB: finalCount, errors: errorCount } 
    });

  } catch (error: any) {
    log(`❌ Fatal Error: ${error.message}`);
    return NextResponse.json({ success: false, logs, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
