import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Проверка вариантов iPhone 17 Air...\n');

  const iphone17Air = await prisma.product.findFirst({
    where: {
      OR: [
        { model: 'iPhone 17 Air' },
        { model: 'iphone 17 air' },
        { slug: 'iphone-17-air' },
      ],
    },
    include: {
      variants: {
        orderBy: [
          { color: 'asc' },
          { storage: 'asc' },
        ],
      },
    },
  });

  if (!iphone17Air) {
    console.error('❌ iPhone 17 Air не найден!');
    return;
  }

  console.log(`📱 ${iphone17Air.model} (slug: ${iphone17Air.slug})`);
  console.log(`   Вариантов: ${iphone17Air.variants.length}\n`);

  // Проверяем модель в вариантах
  const models = new Set(iphone17Air.variants.map(v => (v as any).model || 'нет'));
  console.log(`   Модели в вариантах: ${Array.from(models).join(', ')}`);

  // Проверяем цвета
  const colors = iphone17Air.variants.map(v => v.color).filter(Boolean);
  const uniqueColors = new Set(colors);
  console.log(`   Уникальных цветов: ${uniqueColors.size}`);
  console.log(`   Цвета: ${Array.from(uniqueColors).join(', ')}`);

  // Проверяем дубликаты
  const colorCounts = new Map<string, number>();
  colors.forEach(color => {
    colorCounts.set(color, (colorCounts.get(color) || 0) + 1);
  });

  const duplicates = Array.from(colorCounts.entries()).filter(([_, count]) => count > 1);
  if (duplicates.length > 0) {
    console.log(`\n   ⚠️ Дубликаты цветов:`);
    duplicates.forEach(([color, count]) => {
      console.log(`      - ${color}: ${count} раз`);
    });
  }

  // Показываем примеры вариантов
  console.log(`\n   Примеры вариантов:`);
  iphone17Air.variants.slice(0, 5).forEach(v => {
    const model = (v as any).model || 'нет';
    const price = iphone17Air.basePrice + v.priceModifier;
    console.log(`      - ${model} ${v.color || 'нет'} ${v.storage || v.memory || 'нет'}: ${price} € (modifier: ${v.priceModifier})`);
  });
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
