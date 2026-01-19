import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Официальные цены на основе проверенных источников (в евро, Германия/ЕС)
// Источники: Apple.com/de, официальные магазины
const officialPrices: Record<string, number> = {
  // Apple Watch Series 10 GPS (42mm) - базовые модели
  'Apple Watch Series 10 46mm Rose Gold Aluminum': 479,
  'Apple Watch Series 10 46mm Silver Aluminum': 479,
  'Apple Watch Series 10 GPS, 46mm Jet Black Aluminum': 479,
  
  // Apple Watch Series 10 GPS + LTE (42mm) - Titanium версии
  'Apple Watch Series 10 GPS + LTE, 42mm Gold Titanium': 799,
  'Apple Watch Series 10 GPS + LTE, 42mm Natural Titanium': 799,
  'Apple Watch Series 10 GPS + LTE, 42mm Slate Titanium': 799,
  
  // Apple Watch Series 11 GPS (42mm) - базовые модели
  'Apple Watch Series 11 GPS, 42mm Jet Black Aluminum': 449,
  'Apple Watch Series 11 GPS, 42mm Rose Gold Aluminum': 449,
  'Apple Watch Series 11 GPS, 42mm Space Gray Aluminum': 449,
  
  // Apple Watch Ultra 2
  'Apple Watch Ultra 2 49mm GPS + LTE Black Titanium': 799,
  'Apple Watch Ultra 2 49mm GPS + LTE Titanium': 799,
  
  // Apple Watch Ultra 3
  'Apple Watch Ultra 3 GPS + LTE, 49mm Black Titanium': 899,
  
  // Garmin Fenix 7 базовые
  'Garmin Fenix 7 Silver': 599,
  'Garmin Fenix 7S Silver': 599,
  
  // Garmin Fenix 7X Solar
  'Garmin Fenix 7X Solar Slate Gray': 899,
  
  // Garmin Fenix 7 Sapphire
  'Garmin Fenix 7 Sapphire Solar Carbon Gray': 899,
  
  // Garmin Fenix 8
  'Garmin Fenix 8 47mm AMOLED Sapphire Titanium': 1099,
  
  // Garmin Fenix E
  'Garmin Fenix E 47mm AMOLED Slate Gray Steel': 899,
  'Garmin Fenix E 47mm AMOLED Stainless Steel': 899,
};

async function main() {
  console.log('⌚ Обновление цен на часы по официальным источникам...\n');

  const watches = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartwatches',
      },
    },
  });

  console.log(`Найдено часов: ${watches.length}\n`);

  for (const watch of watches) {
    let newPrice = watch.basePrice; // Оставляем текущую цену по умолчанию
    const model = watch.model;

    // Определяем цену на основе модели
    if (model.includes('Series 10') && model.includes('GPS + LTE') && model.includes('Titanium')) {
      // Series 10 GPS + LTE Titanium версии
      newPrice = 799;
    } else if (model.includes('Series 10') && (model.includes('46mm') || model.includes('Aluminum'))) {
      // Series 10 GPS базовые (46mm или Aluminum)
      newPrice = 479;
    } else if (model.includes('Series 11') && model.includes('GPS') && !model.includes('LTE')) {
      // Series 11 GPS базовые (42mm)
      newPrice = 449;
    } else if (model.includes('Ultra 2')) {
      // Ultra 2
      newPrice = 799;
    } else if (model.includes('Ultra 3')) {
      // Ultra 3
      newPrice = 899;
    } else if (model.includes('Garmin Fenix 7S')) {
      // Fenix 7S
      newPrice = 599;
    } else if (model.includes('Garmin Fenix 7') && !model.includes('7X') && !model.includes('Sapphire')) {
      // Fenix 7 базовый
      newPrice = 599;
    } else if (model.includes('Garmin Fenix 7X Solar')) {
      // Fenix 7X Solar
      newPrice = 899;
    } else if (model.includes('Garmin Fenix 7') && model.includes('Sapphire')) {
      // Fenix 7 Sapphire
      newPrice = 899;
    } else if (model.includes('Garmin Fenix 8')) {
      // Fenix 8
      newPrice = 1099;
    } else if (model.includes('Garmin Fenix E')) {
      // Fenix E
      newPrice = 899;
    }

    // Обновляем цену только если она изменилась
    if (newPrice !== watch.basePrice) {
      await prisma.product.update({
        where: { id: watch.id },
        data: {
          basePrice: newPrice,
        },
      });

      console.log(`✅ ${watch.model}`);
      console.log(`   ${watch.basePrice} → ${newPrice} €`);
    } else {
      console.log(`ℹ️  ${watch.model}`);
      console.log(`   ${watch.basePrice} € (без изменений)`);
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
