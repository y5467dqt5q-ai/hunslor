import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Überprüfung der Dyson-Kategorie...\n');

  // Проверяем категорию Dyson
  const dysonCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { slug: 'dyson' },
        { name: { contains: 'Dyson' } },
      ],
    },
    include: {
      products: true,
    },
  });

  if (dysonCategory) {
    console.log(`✅ Kategorie: ${dysonCategory.name} (${dysonCategory.slug})`);
    console.log(`   Produkte in dieser Kategorie: ${dysonCategory.products.length}\n`);
    
    dysonCategory.products.forEach(p => {
      console.log(`   - ${p.model} (${p.basePrice} €)`);
    });
  } else {
    console.log('❌ Dyson-Kategorie nicht gefunden!');
  }
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
