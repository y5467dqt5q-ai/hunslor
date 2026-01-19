import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Добавление недостающих цветов для iPhone 17 и 17 Air (вручную)...');
  console.log('ВАЖНО: Не трогаем iPhone 17 Pro и 17 Pro Max!\n');

  // Функция для создания SKU
  const createSKU = (model: string, color: string, memory: string): string => {
    const modelCode = model.includes('Air') ? 'IP17AIR' : 'IP17STD';
    const colorCode = color.substring(0, 2).toUpperCase();
    const memoryCode = memory.replace('GB', '').replace('TB', 'TB');
    return `${modelCode}-${colorCode}-${memoryCode}`;
  };

  // Обрабатываем iPhone 17 - добавляем Black
  console.log('\n📱 Добавление Black для iPhone 17...');
  const iphone17 = await prisma.product.findUnique({
    where: { slug: 'iphone-17' },
  });

  if (iphone17) {
    const blackVariants = [
      { memory: '256GB' as const, priceModifier: 0 },
      { memory: '512GB' as const, priceModifier: 200 },
    ];

    for (const variantData of blackVariants) {
      const sku = createSKU('Standard', 'Black', variantData.memory);
      const existing = await prisma.productVariant.findUnique({
        where: { sku },
      });

      if (!existing) {
        const imagesData = {
          variantPath: `Apple iPhone 17 ${variantData.memory} (Black)`,
        };

        await prisma.productVariant.create({
          data: {
            productId: iphone17.id,
            color: 'Black',
            memory: variantData.memory,
            storage: variantData.memory,
            priceModifier: variantData.priceModifier,
            sku: sku,
            stock: 20,
            inStock: true,
            images: JSON.stringify(imagesData),
          },
        });

        console.log(`  ✅ Добавлен: Black ${variantData.memory}`);
      } else {
        console.log(`  ⚠️ Уже существует: Black ${variantData.memory}`);
      }
    }
  }

  // Обрабатываем iPhone 17 Air - добавляем Blue
  console.log('\n📱 Добавление Blue для iPhone 17 Air...');
  const iphone17Air = await prisma.product.findUnique({
    where: { slug: 'iphone-17-air' },
  });

  if (iphone17Air) {
    const blueVariants = [
      { memory: '256GB' as const, priceModifier: 0 },
      { memory: '512GB' as const, priceModifier: 200 },
      { memory: '1TB' as const, priceModifier: 500 },
    ];

    for (const variantData of blueVariants) {
      const sku = createSKU('Air', 'Blue', variantData.memory);
      const existing = await prisma.productVariant.findUnique({
        where: { sku },
      });

      if (!existing) {
        const imagesData = {
          variantPath: `Apple iPhone 17 Air ${variantData.memory} (Sky Blue)`,
        };

        await prisma.productVariant.create({
          data: {
            productId: iphone17Air.id,
            color: 'Blue',
            memory: variantData.memory,
            storage: variantData.memory,
            priceModifier: variantData.priceModifier,
            sku: sku,
            stock: 20,
            inStock: true,
            images: JSON.stringify(imagesData),
          },
        });

        console.log(`  ✅ Добавлен: Blue ${variantData.memory}`);
      } else {
        console.log(`  ⚠️ Уже существует: Blue ${variantData.memory}`);
      }
    }
  }

  console.log('\n✅ Готово! Недостающие цвета добавлены.');
  console.log('⚠️ iPhone 17 Pro и 17 Pro Max НЕ ТРОНУТЫ - они работают как раньше!');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
