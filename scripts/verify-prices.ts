
import path from 'path';
import fs from 'fs';
import { importProductsFromFolder } from '../lib/import-products';

console.log('Resolved import-products:', require.resolve('../lib/import-products'));

console.log('=== Verifying Product Prices and Categories ===');

process.env.IMAGES_PATH = path.join(process.cwd(), 'public', 'images');

try {
    const products = importProductsFromFolder();
    
    console.log(`\nFound ${products.length} products.\n`);
    
    const targetProducts = [
    'Sony PlayStation VR2',
    'Garmin',
    'Meta Quest',
    'Samsung',
    'Switch',
    'iPhone',
    'Dyson'
];

    products.forEach(product => {
        const isTarget = targetProducts.some(t => product.folderName.includes(t) || product.model.includes(t) || product.brand.includes(t));
        
        if (isTarget) {
            console.log(`Product: ${product.folderName}`);
            console.log(`- Base Price: ${product.basePrice} EUR`);
            console.log(`- Category: ${product.categorySlug}`);
            
            if (product.variants.length > 0) {
                console.log(`- Variants: ${product.variants.length}`);
                product.variants.forEach(v => {
                    const total = Math.round(product.basePrice + v.priceModifier);
                    console.log(`  * [${v.sku}] ${v.memory || v.storage || ''} ${v.color || ''}: ${total} EUR (Mod: ${v.priceModifier})`);
                    console.log(`    Images: ${v.images.length}`);
                    if (v.images.length > 0) {
                       console.log(`    First Image: ${v.images[0]}`);
                    } else {
                       console.log(`    ⚠️ NO IMAGES FOUND`);
                    }
                });
            } else {
                console.log(`- Variants: 0`);
            }
            console.log('---');
        }
    });

} catch (error) {
    console.error('Error running verification:', error);
}
