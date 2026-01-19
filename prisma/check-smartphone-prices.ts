import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('📱 Проверка цен на смартфоны (не iPhone)...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartphones',
      },
      brand: {
        not: 'Apple',
      },
    },
    include: {
      variants: {
        select: {
          memory: true,
          priceModifier: true,
        },
      },
    },
  });

  console.log(`Найдено смартфонов: ${products.length}\n`);
  
  products.forEach(p => {
    const basePrice = p.basePrice;
    const variants = p.variants;
    const prices = variants.map(v => basePrice + (v.priceModifier || 0));
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    console.log(`${p.model}:`);
    console.log(`  Базовая цена: ${basePrice} €`);
    if (variants.length > 0) {
      console.log(`  Варианты: ${variants.map(v => `${v.memory || 'N/A'}: ${basePrice + (v.priceModifier || 0)} €`).join(', ')}`);
    }
    console.log(`  Диапазон: ${minPrice} - ${maxPrice} €`);
    console.log('');
  });

  await prisma.$disconnect();
}

main().catch(console.error);
