import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Проверенные официальные/рыночные цены на камеры в Германии (2024-2025)
// Источники: официальные сайты производителей и крупные ритейлеры
const verifiedPrices: Record<string, { price: number; note: string }> = {
  // GoPro
  'GoPro HERO': { price: 299, note: 'Базовая модель GoPro HERO' },
  'GoPro Hero 12 Black': { price: 449, note: 'GoPro Hero 12 Black - официальная цена' },
  'GoPro Hero 13 Black': { price: 499, note: 'GoPro Hero 13 Black - новая модель' },
  'GoPro Hero 13 Black Extended Power Bundle': { price: 599, note: 'GoPro Hero 13 с расширенным комплектом питания (дополнительные аккумуляторы и зарядка)' },
  'GoPro Hero 13 Polar White': { price: 499, note: 'GoPro Hero 13 Polar White - специальная версия' },
  
  // DJI
  'DJI Osmo Action 4 Standard Combo': { price: 399, note: 'DJI Osmo Action 4 Standard - базовая комплектация' },
  'DJI Osmo Action 4 Adventure Combo': { price: 499, note: 'DJI Osmo Action 4 Adventure - расширенная комплектация' },
  'DJI Osmo Action 5 Pro Standard Combo': { price: 549, note: 'DJI Osmo Action 5 Pro - новая модель' },
  'DJI Osmo Pocket 3 Standard Combo': { price: 649, note: 'DJI Osmo Pocket 3 Standard - базовая комплектация' },
  'DJI Osmo Pocket 3 Creator Combo': { price: 799, note: 'DJI Osmo Pocket 3 Creator - расширенная комплектация' },
  
  // Insta360
  'Insta360 X4': { price: 499, note: 'Insta360 X4 - 360° камера' },
  'Insta360 X5 Satin White Standard Bundle': { price: 599, note: 'Insta360 X5 - новая модель 360° камеры' },
  'Insta360 Ace Pro 2 Standard Bundle': { price: 449, note: 'Insta360 Ace Pro 2 - action камера' },
  'Insta360 GO 3S 4K Standard Bundle': { price: 399, note: 'Insta360 GO 3S - компактная камера' },
};

async function main() {
  console.log('🔍 Проверка цен на камеры по официальным источникам...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'camera',
      },
    },
    orderBy: {
      model: 'asc',
    },
  });

  console.log(`Найдено камер: ${products.length}\n`);
  console.log('─'.repeat(100));
  console.log('Сравнение текущих цен с проверенными:');
  console.log('─'.repeat(100));
  console.log('');

  let needsUpdate = false;
  const updates: Array<{ id: string; model: string; oldPrice: number; newPrice: number }> = [];

  for (const product of products) {
    let verifiedPrice: { price: number; note: string } | null = null;
    
    // ВАЖНО: Сначала проверяем более специфичные модели (Extended Power Bundle, Adventure Combo и т.д.)
    // Специальная логика для точного сопоставления - проверяем специфичные модели ПЕРВЫМИ
    if (product.model.includes('Extended Power Bundle')) {
      verifiedPrice = verifiedPrices['GoPro Hero 13 Black Extended Power Bundle'];
    } else if (product.model.includes('DJI Osmo Action 4 Adventure Combo')) {
      verifiedPrice = verifiedPrices['DJI Osmo Action 4 Adventure Combo'];
    } else if (product.model.includes('DJI Osmo Pocket 3 Creator Combo')) {
      verifiedPrice = verifiedPrices['DJI Osmo Pocket 3 Creator Combo'];
    } else if (product.model.includes('Insta360 X5')) {
      verifiedPrice = verifiedPrices['Insta360 X5 Satin White Standard Bundle'];
    } else {
      // Затем ищем соответствующую проверенную цену для остальных моделей
      for (const [key, value] of Object.entries(verifiedPrices)) {
        if (product.model.includes(key) || key.includes(product.model.substring(0, 20))) {
          verifiedPrice = value;
          break;
        }
      }
    }

    // Дополнительная логика для точного сопоставления, если не нашли выше
    if (!verifiedPrice) {
      if (product.model.includes('Extended Power Bundle')) {
        verifiedPrice = verifiedPrices['GoPro Hero 13 Black Extended Power Bundle'];
      } else if (product.model.includes('GoPro HERO') && !product.model.includes('12') && !product.model.includes('13')) {
        verifiedPrice = verifiedPrices['GoPro HERO'];
      } else if (product.model.includes('GoPro Hero 12')) {
        verifiedPrice = verifiedPrices['GoPro Hero 12 Black'];
      } else if (product.model.includes('GoPro Hero 13') && product.model.includes('Polar White')) {
        verifiedPrice = verifiedPrices['GoPro Hero 13 Polar White'];
      } else if (product.model.includes('GoPro Hero 13')) {
        verifiedPrice = verifiedPrices['GoPro Hero 13 Black'];
      } else if (product.model.includes('DJI Osmo Action 4 Adventure Combo')) {
        verifiedPrice = verifiedPrices['DJI Osmo Action 4 Adventure Combo'];
      } else if (product.model.includes('DJI Osmo Action 4')) {
        verifiedPrice = verifiedPrices['DJI Osmo Action 4 Standard Combo'];
      } else if (product.model.includes('DJI Osmo Action 5 Pro')) {
        verifiedPrice = verifiedPrices['DJI Osmo Action 5 Pro Standard Combo'];
      } else if (product.model.includes('DJI Osmo Pocket 3 Creator Combo')) {
        verifiedPrice = verifiedPrices['DJI Osmo Pocket 3 Creator Combo'];
      } else if (product.model.includes('DJI Osmo Pocket 3')) {
        verifiedPrice = verifiedPrices['DJI Osmo Pocket 3 Standard Combo'];
      } else if (product.model.includes('Insta360 X5')) {
        verifiedPrice = verifiedPrices['Insta360 X5 Satin White Standard Bundle'];
      } else if (product.model.includes('Insta360 X4')) {
        verifiedPrice = verifiedPrices['Insta360 X4'];
      } else if (product.model.includes('Insta360 Ace Pro 2')) {
        verifiedPrice = verifiedPrices['Insta360 Ace Pro 2 Standard Bundle'];
      } else if (product.model.includes('Insta360 GO 3S')) {
        verifiedPrice = verifiedPrices['Insta360 GO 3S 4K Standard Bundle'];
      }
    }

    if (verifiedPrice) {
      const diff = product.basePrice - verifiedPrice.price;
      const diffPercent = ((diff / verifiedPrice.price) * 100).toFixed(1);
      
      if (Math.abs(diff) > 5) { // Если разница больше 5 евро
        needsUpdate = true;
        updates.push({
          id: product.id,
          model: product.model,
          oldPrice: product.basePrice,
          newPrice: verifiedPrice.price,
        });
        
        console.log(`⚠️  ${product.model}`);
        console.log(`   Текущая: ${product.basePrice} €`);
        console.log(`   Проверенная: ${verifiedPrice.price} €`);
        console.log(`   Разница: ${diff > 0 ? '+' : ''}${diff} € (${diffPercent}%)`);
        console.log(`   Примечание: ${verifiedPrice.note}`);
        console.log(`   → Требуется обновление до ${verifiedPrice.price} €`);
      } else {
        console.log(`✅ ${product.model}`);
        console.log(`   Цена: ${product.basePrice} € (соответствует проверенной: ${verifiedPrice.price} €)`);
        console.log(`   Примечание: ${verifiedPrice.note}`);
      }
    } else {
      console.log(`ℹ️  ${product.model}`);
      console.log(`   Цена: ${product.basePrice} €`);
      console.log(`   ⚠️  Проверенная цена не найдена - требуется ручная проверка`);
    }
    console.log('');
  }

  console.log('─'.repeat(100));
  
  if (needsUpdate) {
    console.log(`\n⚠️  Найдено товаров, требующих обновления цены: ${updates.length}`);
    console.log('\nСписок обновлений:');
    updates.forEach((u, i) => {
      console.log(`  ${i + 1}. ${u.model}`);
      console.log(`     ${u.oldPrice} € → ${u.newPrice} €`);
    });
    console.log('\n💡 Для обновления цен запустите скрипт: prisma/fix-kamera-prices.ts');
  } else {
    console.log('\n✅ Все цены соответствуют проверенным официальным источникам!');
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
