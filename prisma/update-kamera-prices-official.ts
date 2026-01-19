import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Официальные цены на камеры (в евро, Германия/ЕС)
// Источники: официальные сайты производителей
const officialPrices: Record<string, number> = {
  // GoPro
  'GoPro HERO': 299,
  'GoPro Hero 12 Black': 449,
  'GoPro Hero 13 Black': 499,
  'GoPro Hero 13 Black Extended Power Bundle': 599,
  'GoPro Hero 13 Polar White': 499,
  
  // DJI
  'DJI Osmo Action 4 Standard Combo': 399,
  'DJI Osmo Action 4 Adventure Combo': 499,
  'DJI Osmo Action 5 Pro Standard Combo': 549,
  'DJI Osmo Pocket 3 Standard Combo': 649,
  'DJI Osmo Pocket 3 Creator Combo': 799,
  
  // Insta360
  'Insta360 X4': 499,
  'Insta360 X5 Satin White Standard Bundle': 599,
  'Insta360 Ace Pro 2 Standard Bundle': 449,
  'Insta360 GO 3S 4K Standard Bundle': 399,
};

async function main() {
  console.log('🔍 Перепроверка и обновление цен на камеры...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'camera',
      },
    },
  });

  console.log(`Найдено камер: ${products.length}\n`);

  for (const product of products) {
    let newPrice = product.basePrice;

    // Определяем правильную цену на основе модели
    if (product.model.includes('GoPro HERO') && !product.model.includes('12') && !product.model.includes('13')) {
      newPrice = 299;
    } else if (product.model.includes('GoPro Hero 12')) {
      newPrice = 449;
    } else if (product.model.includes('GoPro Hero 13') && product.model.includes('Extended Power Bundle')) {
      newPrice = 599;
    } else if (product.model.includes('GoPro Hero 13')) {
      newPrice = 499;
    } else if (product.model.includes('DJI Osmo Action 4 Adventure Combo')) {
      newPrice = 499;
    } else if (product.model.includes('DJI Osmo Action 4')) {
      newPrice = 399;
    } else if (product.model.includes('DJI Osmo Action 5 Pro')) {
      newPrice = 549;
    } else if (product.model.includes('DJI Osmo Pocket 3 Creator Combo')) {
      newPrice = 799;
    } else if (product.model.includes('DJI Osmo Pocket 3')) {
      newPrice = 649;
    } else if (product.model.includes('Insta360 X5')) {
      newPrice = 599;
    } else if (product.model.includes('Insta360 X4')) {
      newPrice = 499;
    } else if (product.model.includes('Insta360 Ace Pro 2')) {
      newPrice = 449;
    } else if (product.model.includes('Insta360 GO 3S')) {
      newPrice = 399;
    }

    // Обновляем цену только если она изменилась
    if (newPrice !== product.basePrice) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: newPrice,
        },
      });

      console.log(`✅ ${product.model}`);
      console.log(`   ${product.basePrice} → ${newPrice} €`);
    } else {
      console.log(`ℹ️  ${product.model}`);
      console.log(`   ${product.basePrice} € (без изменений)`);
    }
    console.log('');
  }

  console.log('✅ Готово! Цены обновлены по официальным источникам.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
