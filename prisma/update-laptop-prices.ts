import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Примерные официальные цены на основе характеристик и рыночных цен
// Эти цены можно скорректировать после проверки на официальных сайтах
const laptopPrices: Record<string, number> = {
  // Acer Nitro V 15 ANV15-51 Intel Core i5 16GB 512GB SSD RTX 4050
  'Acer Nitro V 15 ANV15-51 15.6 (Intel Core i516GB512GB (SSD)RTX 4050) (NH.QNBEU.001)': 899,
  
  // Acer Nitro V 15 ANV15-51 Intel Core i9 32GB 1TB SSD RTX 4060
  'Acer Nitro V 15 ANV15-51 15.6 (Intel Core i932GB1TB SSDRTX 4060) (NH.QQEAA.027)': 1299,
  
  // Acer Nitro V 16 ANV16-42 AMD Ryzen 5 16GB 1TB SSD RTX 5060
  'Acer Nitro V 16 ANV16-42 16 (AMD Ryzen 516GB1TB (SSD)RTX 5060) (NH.U1GEU.003)': 1199,
  
  // Acer Nitro V ANV15-52 Intel Core i5 16GB 512GB SSD RTX 5060
  'Acer Nitro V ANV15-52 15,6 (Intel Core i516GB512GB (SSD)RTX 5060) (NH.QZ8EP.00E)': 1099,
  
  // Acer Predator Helios Neo 14 PHN14-51-79UB Intel Core Ultra 7 16GB 1TB SSD RTX 4070
  'Acer Predator Helios Neo 14 PHN14-51-79UB 14,5 (Intel Core Ultra 716GB1TB (SSD)RTX 4070) (NH.QRNAA.001)': 1799,
  
  // Acer ANV15-41 R5-6600H 15.6 AMD Ryzen 5 16GB 512GB SSD RTX 3050
  'Acer ANV15-41 R5-6600H 15.6 (AMD Ryzen 516GB512GB (SSD)RTX 3050) (NH.QSHEU.00P)': 799,
  
  // Acer Aspire 17 A17-51 17.3 Intel Core 7 16GB 1TB SSD RTX 2050
  'Acer Aspire 17 A17-51 17,3 (Intel Core 716GB1TB (SSD)RTX 2050) (NX.J1UEG.012)': 899,
  
  // Acer Aspire Lite AL15-33P-38GK 15.6 Intel Core 3 16GB 512GB SSD
  'Acer Aspire Lite AL15-33P-38GK 15,6 (Intel Core 316GB512GB (SSD)Intel UHD) (NX.DDPEX.001)': 499,
  
  // Acer Chromebook Plus 514 CB514-3HT-R8C2 AMD Ryzen 3 8GB 256GB SSD
  'Acer Chromebook Plus 514 -CB514-3HT-R8C2 (AMD Ryzen 38GB256 GB (SSD)AMD Radeon Graphics)': 449,
};

async function main() {
  console.log('💰 Обновление цен на ноутбуки...\n');

  const laptops = await prisma.product.findMany({
    where: {
      category: {
        slug: 'laptops',
      },
    },
    include: {
      variants: true,
    },
  });

  console.log(`Найдено ноутбуков: ${laptops.length}\n`);

  let updated = 0;
  let notFound = 0;

  for (const laptop of laptops) {
    const price = laptopPrices[laptop.model];
    
    if (price) {
      const oldPrice = laptop.basePrice;
      await prisma.product.update({
        where: { id: laptop.id },
        data: {
          basePrice: price,
        },
      });
      
      console.log(`✅ ${laptop.model}`);
      console.log(`   Старая цена: ${oldPrice} €`);
      console.log(`   Новая цена: ${price} €`);
      updated++;
    } else {
      console.log(`⚠️ ${laptop.model}`);
      console.log(`   Цена не найдена в списке, оставлена: ${laptop.basePrice} €`);
      notFound++;
    }
    console.log(``);
  }

  console.log(`\n📊 Итого:`);
  console.log(`   Обновлено: ${updated}`);
  console.log(`   Не найдено: ${notFound}`);
  console.log(`\n💡 Если нужно изменить цены, отредактируйте объект laptopPrices в скрипте.`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
