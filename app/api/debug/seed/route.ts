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
    log('🚀 Starting Debug Seed...');
    log(`Environment: ${process.env.NODE_ENV}`);
    log(`CWD: ${process.cwd()}`);
    
    // Check public/images
    const publicImagesPath = path.join(process.cwd(), 'public', 'images');
    log(`Checking images path: ${publicImagesPath}`);
    
    if (fs.existsSync(publicImagesPath)) {
      log('✅ Images folder exists!');
      const files = fs.readdirSync(publicImagesPath);
      log(`Found ${files.length} files/folders:`);
      log(files.slice(0, 10).join(', ') + (files.length > 10 ? '...' : ''));
    } else {
      log('❌ Images folder NOT found!');
      // List root contents
      log('Root directory contents:');
      log(fs.readdirSync(process.cwd()).join(', '));
      
      // Check if public exists
      const publicPath = path.join(process.cwd(), 'public');
      if (fs.existsSync(publicPath)) {
        log('Public folder exists, contents:');
        log(fs.readdirSync(publicPath).join(', '));
      } else {
        log('❌ Public folder NOT found!');
      }
    }

    // Try importing products
    log('📦 Importing products from folder...');
    const products = importProductsFromFolder();
    log(`Found ${products.length} products to import`);

    if (products.length > 0) {
      log(`First product: ${JSON.stringify(products[0].slug)}`);
    } else {
      log('⚠️ No products found via import script.');
    }

    // Check DB connection
    log('🔌 Checking DB connection...');
    const categoryCount = await prisma.category.count();
    log(`Current category count: ${categoryCount}`);
    const productCount = await prisma.product.count();
    log(`Current product count: ${productCount}`);

    return NextResponse.json({ 
      success: true, 
      logs,
      stats: { categories: categoryCount, products: productCount } 
    });

  } catch (error: any) {
    log(`❌ Error: ${error.message}`);
    log(error.stack);
    return NextResponse.json({ success: false, logs, error: error.message }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
}
