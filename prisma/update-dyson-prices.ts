import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Официальные цены для товаров Dyson (примерные, на основе рыночных цен)
const dysonPrices: Record<string, number> = {
  'Dyson Airwrap Co-anda 2x': 599,
  'Dyson Airwrap i.d.': 549,
  'Dyson Supersonic HD16 Nural': 449,
  'Dyson Supersonic Nural': 399,
};

async function main() {
  console.log('💰 Aktualisierung der Dyson-Preise...\n');

  const dysonProducts = await prisma.product.findMany({
    where: {
      brand: 'Dyson',
    },
  });

  console.log(`📦 Gefundene Produkte: ${dysonProducts.length}\n`);

  let updated = 0;

  for (const product of dysonProducts) {
    const modelLower = product.model.toLowerCase();
    let price = null;
    
    if (modelLower.includes('airwrap co-anda 2x')) {
      price = dysonPrices['Dyson Airwrap Co-anda 2x'];
    } else if (modelLower.includes('airwrap i.d.')) {
      price = dysonPrices['Dyson Airwrap i.d.'];
    } else if (modelLower.includes('supersonic hd16 nural')) {
      price = dysonPrices['Dyson Supersonic HD16 Nural'];
    } else if (modelLower.includes('supersonic nural')) {
      price = dysonPrices['Dyson Supersonic Nural'];
    }

    if (price && product.basePrice !== price) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: price,
        },
      });
      console.log(`✅ ${product.model}`);
      console.log(`   Alte Preis: ${product.basePrice} €`);
      console.log(`   Neue Preis: ${price} €`);
      updated++;
    } else if (!price) {
      console.log(`⚠️ Preis nicht gefunden für: ${product.model}`);
    }
  }

  console.log(`\n📊 Zusammenfassung:`);
  console.log(`   Aktualisiert: ${updated}`);
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
