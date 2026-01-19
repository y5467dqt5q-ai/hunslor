import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Описания для товаров Dyson на немецком
const dysonDescriptions: Record<string, string> = {
  'Dyson Airwrap Co-anda 2x': `<div class="product-description">
<h2>🌀 Dyson Airwrap Co-anda 2x™ - Revolutionäres Styling</h2>
<p>Der <strong>Dyson Airwrap Co-anda 2x™</strong> ist ein innovativer Multi-Haarstyler, der Ihre Haare mit präziser Temperaturkontrolle stylt, ohne extreme Hitze zu verwenden.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Coanda-Effekt:</strong> Nutzt Luftströmung statt Hitze zum Styling</li>
<li><strong>Intelligente Temperaturkontrolle:</strong> Misst die Temperatur 40 Mal pro Sekunde</li>
<li><strong>Vielseitige Aufsätze:</strong> Für glattes, lockiges und welliges Haar</li>
<li><strong>Straight+Wavy Technologie:</strong> Perfekt für verschiedene Haartypen</li>
<li><strong>Schutz vor Hitzeschäden:</strong> Stylt bei niedrigeren Temperaturen</li>
</ul>

<h3>💇 Styling-Optionen</h3>
<ul>
<li>Glattes Styling mit dem Glättungsaufsatz</li>
<li>Locken und Wellen mit verschiedenen Aufsätzen</li>
<li>Volumen und Föhn-Funktion</li>
<li>Rundbürsten für zusätzliches Volumen</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Rose, Rot, Violett</li>
</ul>
</div>`,

  'Dyson Airwrap i.d.': `<div class="product-description">
<h2>🌀 Dyson Airwrap i.d.™ - Intelligentes Styling</h2>
<p>Der <strong>Dyson Airwrap i.d.™</strong> bietet präzises Styling mit intelligenter Temperaturkontrolle für gesund aussehende Haare.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Intelligente Temperaturkontrolle:</strong> Passt sich automatisch an</li>
<li><strong>Coanda-Technologie:</strong> Stylt mit Luft statt Hitze</li>
<li><strong>Verschiedene Aufsätze:</strong> Für alle Styling-Bedürfnisse</li>
<li><strong>Schutz vor Hitzeschäden:</strong> Schont die Haare</li>
</ul>

<h3>💇 Styling-Features</h3>
<ul>
<li>Glattes Styling</li>
<li>Locken und Wellen</li>
<li>Volumen-Aufbau</li>
<li>Föhn-Funktion</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Blau, DunkelBlau, Orange, Rosa, Rot, Violett</li>
</ul>
</div>`,

  'Dyson Supersonic HD16 Nural': `<div class="product-description">
<h2>🌀 Dyson Supersonic HD16 Nural - Premium Haartrockner</h2>
<p>Der <strong>Dyson Supersonic HD16 Nural</strong> ist der neueste Premium-Haartrockner mit fortschrittlicher Technologie für schnelles, schonendes Trocknen.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>V9 Digitalmotor:</strong> Hochleistungsmotor für schnelles Trocknen</li>
<li><strong>Intelligente Temperaturkontrolle:</strong> Schützt vor Hitzeschäden</li>
<li><strong>Leichtes Design:</strong> Ermüdungsfreies Styling</li>
<li><strong>Leiser Betrieb:</strong> Reduzierte Geräuschentwicklung</li>
<li><strong>Magnetische Aufsätze:</strong> Einfacher Wechsel</li>
</ul>

<h3>💨 Technologie</h3>
<ul>
<li>Air Multiplier™ Technologie</li>
<li>Präzise Temperaturkontrolle</li>
<li>3 Geschwindigkeitsstufen</li>
<li>4 Temperaturmodi</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Ceramic Pink/Rose Gold, Jasper Plum</li>
</ul>
</div>`,

  'Dyson Supersonic Nural': `<div class="product-description">
<h2>🌀 Dyson Supersonic Nural - Professionelles Trocknen</h2>
<p>Der <strong>Dyson Supersonic Nural</strong> kombiniert kraftvolle Performance mit schonender Technologie für gesund aussehende Haare.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>V9 Digitalmotor:</strong> Starker Motor für schnelles Trocknen</li>
<li><strong>Intelligente Temperaturkontrolle:</strong> Verhindert Hitzeschäden</li>
<li><strong>Leichtes Design:</strong> Komfortables Handling</li>
<li><strong>Magnetische Aufsätze:</strong> Glättungsaufsatz, Diffusor, Konzentrator</li>
</ul>

<h3>💨 Performance</h3>
<ul>
<li>Schnelles Trocknen ohne extreme Hitze</li>
<li>Schutz vor Hitzeschäden</li>
<li>Leiser Betrieb</li>
<li>Langlebige Konstruktion</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Amber Silk, Ceramic Patina/Topaz, Strawberry Bronze/Blush Pink, Vinca Blue/Topaz</li>
</ul>
</div>`,
};

async function main() {
  console.log('📝 Hinzufügen von Dyson-Beschreibungen...\n');

  const dysonProducts = await prisma.product.findMany({
    where: {
      brand: 'Dyson',
    },
  });

  console.log(`📦 Gefundene Dyson-Produkte: ${dysonProducts.length}\n`);

  let updated = 0;

  for (const product of dysonProducts) {
    let description = null;
    const modelLower = product.model.toLowerCase();
    
    if (modelLower.includes('airwrap co-anda 2x')) {
      description = dysonDescriptions['Dyson Airwrap Co-anda 2x'];
    } else if (modelLower.includes('airwrap i.d.')) {
      description = dysonDescriptions['Dyson Airwrap i.d.'];
    } else if (modelLower.includes('supersonic hd16 nural')) {
      description = dysonDescriptions['Dyson Supersonic HD16 Nural'];
    } else if (modelLower.includes('supersonic nural')) {
      description = dysonDescriptions['Dyson Supersonic Nural'];
    }

    if (description) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          baseDescription: description,
        },
      });
      console.log(`✅ ${product.model}`);
      updated++;
    } else {
      console.log(`⚠️ Beschreibung nicht gefunden für: ${product.model}`);
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
