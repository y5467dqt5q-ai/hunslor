import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Актуальные официальные цены и описания для VR товаров (на основе официальных источников Meta/Ray-Ban)
// Цены в долларах США, конвертированы в евро (примерно 1 USD = 0.92 EUR)
const vrData: Record<string, { price: number; description: string }> = {
  'Meta Quest 3 128GB': {
    price: 459, // $499.99 USD ≈ 459€
    description: `<h2>🥽 Meta Quest 3 128GB</h2>
<p>Der Meta Quest 3 ist das neueste Mixed-Reality Headset von Meta mit verbesserter Performance, höherer Auflösung und erweiterten AR-Funktionen.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> Dual LCD mit 2064 x 2208 Pixel pro Auge (4128 x 2208 gesamt) bei 90-120Hz</li>
<li><strong>Prozessor:</strong> Snapdragon XR2 Gen 2 für deutlich verbesserte Performance</li>
<li><strong>RAM:</strong> 8GB für flüssiges Multitasking</li>
<li><strong>Speicher:</strong> 128GB interner Speicher</li>
<li><strong>Mixed Reality:</strong> Passthrough+ Technologie mit Farbkameras für realistische AR-Erlebnisse</li>
<li><strong>Tracking:</strong> Inside-Out Tracking mit 6 DoF (6 Freiheitsgrade)</li>
<li><strong>Batterie:</strong> Bis zu 2-3 Stunden Spielzeit, abnehmbarer Akku</li>
<li><strong>Kompatibilität:</strong> PC VR (Link/Air Link), Standalone VR, AR-Apps</li>
<li><strong>Controller:</strong> Touch Plus Controller mit haptischem Feedback und verbesserter Ergonomie</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Refresh Rate für flüssiges Gameplay</li>
<li>Hand-Tracking 2.0 für natürliche Interaktion ohne Controller</li>
<li>Passthrough+ für Mixed Reality Erlebnisse</li>
<li>Rückwärtskompatibel mit Quest 2 Spielen</li>
<li>Erweiterte Grafik-Performance für anspruchsvolle VR-Spiele</li>
</ul>

<h3>📱 Smart Features:</h3>
<ul>
<li>Meta Horizon Home - personalisierbare virtuelle Umgebung</li>
<li>Social VR Funktionen für Multiplayer-Erlebnisse</li>
<li>PC VR Streaming über Air Link (WLAN) oder Link Cable</li>
<li>WLAN 6E Unterstützung für schnellere Verbindungen</li>
<li>Meta AI Integration für Sprachsteuerung</li>
</ul>

<h3>🎯 Mixed Reality:</h3>
<ul>
<li>Farb-Passthrough mit verbesserter Qualität</li>
<li>AR-Apps und Mixed Reality Spiele</li>
<li>Virtuelle Objekte in realer Umgebung</li>
<li>Erweiterte Raumvermessung</li>
</ul>`
  },
  'Meta Quest 3 512GB': {
    price: 599, // $649.99 USD ≈ 599€ (или $499 после снижения ≈ 459€, но используем официальную цену)
    description: `<h2>🥽 Meta Quest 3 512GB</h2>
<p>Der Meta Quest 3 mit 512GB Speicher bietet mehr Platz für Spiele, Apps, Medieninhalte und VR-Erlebnisse. Ideal für Power-User und Enthusiasten.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> Dual LCD mit 2064 x 2208 Pixel pro Auge (4128 x 2208 gesamt) bei 90-120Hz</li>
<li><strong>Prozessor:</strong> Snapdragon XR2 Gen 2 für deutlich verbesserte Performance</li>
<li><strong>RAM:</strong> 8GB für flüssiges Multitasking</li>
<li><strong>Speicher:</strong> 512GB interner Speicher - 4x mehr Platz als 128GB Version</li>
<li><strong>Mixed Reality:</strong> Passthrough+ Technologie mit Farbkameras für realistische AR-Erlebnisse</li>
<li><strong>Tracking:</strong> Inside-Out Tracking mit 6 DoF (6 Freiheitsgrade)</li>
<li><strong>Batterie:</strong> Bis zu 2-3 Stunden Spielzeit, abnehmbarer Akku</li>
<li><strong>Kompatibilität:</strong> PC VR (Link/Air Link), Standalone VR, AR-Apps</li>
<li><strong>Controller:</strong> Touch Plus Controller mit haptischem Feedback und verbesserter Ergonomie</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Refresh Rate für flüssiges Gameplay</li>
<li>Hand-Tracking 2.0 für natürliche Interaktion ohne Controller</li>
<li>Passthrough+ für Mixed Reality Erlebnisse</li>
<li>Rückwärtskompatibel mit Quest 2 Spielen</li>
<li>Erweiterte Grafik-Performance für anspruchsvolle VR-Spiele</li>
</ul>

<h3>📱 Smart Features:</h3>
<ul>
<li>Meta Horizon Home - personalisierbare virtuelle Umgebung</li>
<li>Social VR Funktionen für Multiplayer-Erlebnisse</li>
<li>PC VR Streaming über Air Link (WLAN) oder Link Cable</li>
<li>WLAN 6E Unterstützung für schnellere Verbindungen</li>
<li>Meta AI Integration für Sprachsteuerung</li>
</ul>

<h3>💾 Speicher-Vorteile:</h3>
<ul>
<li>512GB Speicher für große VR-Spiele und Apps</li>
<li>Mehr Platz für Medieninhalte (Videos, Fotos)</li>
<li>Keine Sorgen um Speicherplatz bei großen Spielen</li>
<li>Ideal für Nutzer mit umfangreicher VR-Bibliothek</li>
</ul>`
  },
  'Meta Quest Pro': {
    price: 919, // $999 USD ≈ 919€ (было $1499, снижено до $999, но снято с продажи в январе 2025)
    description: `<h2>🥽 Meta Quest Pro</h2>
<p>Der Meta Quest Pro ist ein Premium VR-Headset für professionelle Anwendungen, High-End Gaming und erweiterte Mixed Reality Erlebnisse. <strong>Hinweis: Dieses Modell wurde im Januar 2025 offiziell eingestellt, aber noch verfügbare Einheiten können erworben werden.</strong></p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> Dual QLED mit 1800 x 1920 Pixel pro Auge für lebendige Farben</li>
<li><strong>Prozessor:</strong> Snapdragon XR2+ für maximale Performance</li>
<li><strong>RAM:</strong> 12GB für professionelle Anwendungen</li>
<li><strong>Speicher:</strong> 256GB interner Speicher</li>
<li><strong>Eye Tracking:</strong> Präzises Eye-Tracking für natürliche Interaktion und foveated rendering</li>
<li><strong>Face Tracking:</strong> Erweiterte Gesichtserkennung für realistische Avatare</li>
<li><strong>Mixed Reality:</strong> High-Quality Passthrough mit Farbkameras und verbesserter Qualität</li>
<li><strong>Tracking:</strong> Inside-Out Tracking mit 6 DoF und erweiterten Sensoren</li>
<li><strong>Batterie:</strong> Bis zu 1-2 Stunden Spielzeit (kürzer aufgrund höherer Performance)</li>
<li><strong>Design:</strong> Premium-Materialien und verbesserte Ergonomie</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>90Hz Refresh Rate für flüssiges Gameplay</li>
<li>Hand-Tracking für natürliche Interaktion</li>
<li>Eye-Tracking für foveated rendering (bessere Performance)</li>
<li>Premium Controller mit haptischem Feedback und erweiterten Sensoren</li>
<li>Erweiterte Grafik-Performance für High-End VR-Spiele</li>
</ul>

<h3>💼 Professional Features:</h3>
<ul>
<li>Meta Horizon Workrooms für virtuelle Meetings</li>
<li>Erweiterte Mixed Reality für professionelle Anwendungen</li>
<li>Professional Software-Kompatibilität</li>
<li>High-End Grafik-Performance für CAD, Design und Visualisierung</li>
<li>Eye-Tracking für Präsentationen und Kollaboration</li>
</ul>

<h3>🎯 Advanced Features:</h3>
<ul>
<li>Foveated Rendering für optimierte Performance</li>
<li>Erweiterte Gesichtserkennung für realistische Avatare</li>
<li>Premium Materialien und Design</li>
<li>Verbesserte Komfort-Features</li>
</ul>`
  },
  'Ray-Ban Meta Skyler (Gen 2)': {
    price: 349, // $379 USD ≈ 349€
    description: `<h2>😎 Ray-Ban Meta Skyler (Gen 2)</h2>
<p>Die Ray-Ban Meta Skyler (Gen 2) sind intelligente Sonnenbrillen mit integrierter Kamera, erweiterten AR-Funktionen und verbesserter Batterielaufzeit. Perfekt für den Alltag und Social Media.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Klassisches Ray-Ban Skyler Design in verschiedenen Farben</li>
<li><strong>Kamera:</strong> 12MP Ultra-Wide Kamera für hochwertige Fotos und Videos</li>
<li><strong>Video-Aufnahme:</strong> 3K Ultra HD Video-Aufnahme (2880 x 2160)</li>
<li><strong>Audio:</strong> Offene Lautsprecher für Musik, Anrufe und Meta AI</li>
<li><strong>Smart Features:</strong> Meta AI Integration für Sprachsteuerung und Fragen</li>
<li><strong>Live Streaming:</strong> Direktes Streaming zu Instagram und Facebook</li>
<li><strong>Batterie:</strong> Bis zu 8 Stunden typische Nutzung (verbessert gegenüber Gen 1)</li>
<li><strong>Ladecase:</strong> Inklusive Ladecase mit zusätzlicher Batterie (bis zu 30 Stunden Gesamtlaufzeit)</li>
<li><strong>Kompatibilität:</strong> iOS und Android über Meta View App</li>
<li><strong>Wasserschutz:</strong> IPX4 Spritzwasserschutz</li>
</ul>

<h3>📸 Camera Features:</h3>
<ul>
<li>12MP Ultra-Wide Kamera mit verbesserter Qualität</li>
<li>3K Ultra HD Video-Aufnahme (2880 x 2160)</li>
<li>Foto-Aufnahme in hoher Qualität</li>
<li>Live-Streaming zu Instagram und Facebook</li>
<li>Verbesserte Bildstabilisierung</li>
<li>Automatische Belichtung und Fokus</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>Offene Lautsprecher für Musik und Anrufe</li>
<li>Mikrofone für klare Anrufe</li>
<li>Meta AI Voice Assistant für Sprachsteuerung</li>
<li>Bluetooth-Konnektivität für Musik-Streaming</li>
<li>Verbesserte Audio-Qualität gegenüber Gen 1</li>
</ul>

<h3>🤖 Smart Features:</h3>
<ul>
<li>Meta AI Integration für Fragen und Sprachsteuerung</li>
<li>Live-Streaming zu Social Media</li>
<li>Meta View App für Foto-/Video-Verwaltung</li>
<li>Hands-free Bedienung</li>
<li>Erweiterte Kompatibilität mit Meta-Ökosystem</li>
</ul>`
  },
  'Ray-Ban Meta Wayfarer (Gen 2)': {
    price: 349, // $379 USD ≈ 349€
    description: `<h2>😎 Ray-Ban Meta Wayfarer (Gen 2)</h2>
<p>Die Ray-Ban Meta Wayfarer (Gen 2) sind intelligente Sonnenbrillen im klassischen Wayfarer Design mit integrierter Kamera, erweiterten AR-Funktionen und verbesserter Batterielaufzeit. Das zeitlose Design mit modernster Technologie.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Klassisches Ray-Ban Wayfarer Design in verschiedenen Farben und Linsen-Optionen</li>
<li><strong>Kamera:</strong> 12MP Ultra-Wide Kamera für hochwertige Fotos und Videos</li>
<li><strong>Video-Aufnahme:</strong> 3K Ultra HD Video-Aufnahme (2880 x 2160)</li>
<li><strong>Audio:</strong> Offene Lautsprecher für Musik, Anrufe und Meta AI</li>
<li><strong>Smart Features:</strong> Meta AI Integration für Sprachsteuerung und Fragen</li>
<li><strong>Live Streaming:</strong> Direktes Streaming zu Instagram und Facebook</li>
<li><strong>Batterie:</strong> Bis zu 8 Stunden typische Nutzung (verbessert gegenüber Gen 1)</li>
<li><strong>Ladecase:</strong> Inklusive Ladecase mit zusätzlicher Batterie (bis zu 30 Stunden Gesamtlaufzeit)</li>
<li><strong>Kompatibilität:</strong> iOS und Android über Meta View App</li>
<li><strong>Wasserschutz:</strong> IPX4 Spritzwasserschutz</li>
</ul>

<h3>📸 Camera Features:</h3>
<ul>
<li>12MP Ultra-Wide Kamera mit verbesserter Qualität</li>
<li>3K Ultra HD Video-Aufnahme (2880 x 2160)</li>
<li>Foto-Aufnahme in hoher Qualität</li>
<li>Live-Streaming zu Instagram und Facebook</li>
<li>Verbesserte Bildstabilisierung</li>
<li>Automatische Belichtung und Fokus</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>Offene Lautsprecher für Musik und Anrufe</li>
<li>Mikrofone für klare Anrufe</li>
<li>Meta AI Voice Assistant für Sprachsteuerung</li>
<li>Bluetooth-Konnektivität für Musik-Streaming</li>
<li>Verbesserte Audio-Qualität gegenüber Gen 1</li>
</ul>

<h3>🤖 Smart Features:</h3>
<ul>
<li>Meta AI Integration für Fragen und Sprachsteuerung</li>
<li>Live-Streaming zu Social Media</li>
<li>Meta View App für Foto-/Video-Verwaltung</li>
<li>Hands-free Bedienung</li>
<li>Erweiterte Kompatibilität mit Meta-Ökosystem</li>
</ul>

<h3>👓 Design-Varianten:</h3>
<ul>
<li>Verschiedene Farben und Rahmen-Optionen</li>
<li>Optionale Transitions-Linsen</li>
<li>Polarisierte Linsen-Optionen</li>
<li>Klassisches Wayfarer Design mit moderner Technologie</li>
</ul>`
  },
};

async function main() {
  console.log('🥽 Обновление цен и описаний для VR товаров с официальных источников...\n');

  let updated = 0;
  let notFound = 0;

  // Обновляем все VR продукты
  const allVRProducts = await prisma.product.findMany({
    where: {
      category: {
        slug: 'vr-headsets',
      },
    },
    include: {
      category: true,
    },
  });

  console.log(`Найдено VR продуктов: ${allVRProducts.length}\n`);

  for (const product of allVRProducts) {
    let matched = false;
    
    // Ищем совпадение по модели
    for (const [modelName, data] of Object.entries(vrData)) {
      // Проверяем различные варианты совпадения
      const modelLower = modelName.toLowerCase();
      const productModelLower = product.model.toLowerCase();
      
      if (
        productModelLower.includes(modelLower) ||
        modelLower.includes(productModelLower.split('(')[0].trim().toLowerCase()) ||
        (modelName.includes('Quest 3 128GB') && productModelLower.includes('quest 3') && productModelLower.includes('128')) ||
        (modelName.includes('Quest 3 512GB') && productModelLower.includes('quest 3') && productModelLower.includes('512')) ||
        (modelName.includes('Quest Pro') && productModelLower.includes('quest pro')) ||
        (modelName.includes('Skyler') && productModelLower.includes('skyler')) ||
        (modelName.includes('Wayfarer') && productModelLower.includes('wayfarer'))
      ) {
        const oldPrice = product.basePrice;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            basePrice: data.price,
            baseDescription: data.description,
          },
        });

        console.log(`✅ Обновлен: ${product.model}`);
        console.log(`   Цена: ${oldPrice} € → ${data.price} €`);
        updated++;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Для Ray-Ban продуктов, которые не совпали точно
      if (product.model.toLowerCase().includes('ray-ban meta skyler')) {
        const oldPrice = product.basePrice;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            basePrice: vrData['Ray-Ban Meta Skyler (Gen 2)'].price,
            baseDescription: vrData['Ray-Ban Meta Skyler (Gen 2)'].description,
          },
        });
        console.log(`✅ Обновлен (Skyler): ${product.model}`);
        console.log(`   Цена: ${oldPrice} € → ${vrData['Ray-Ban Meta Skyler (Gen 2)'].price} €`);
        updated++;
      } else if (product.model.toLowerCase().includes('ray-ban meta wayfarer')) {
        const oldPrice = product.basePrice;
        await prisma.product.update({
          where: { id: product.id },
          data: {
            basePrice: vrData['Ray-Ban Meta Wayfarer (Gen 2)'].price,
            baseDescription: vrData['Ray-Ban Meta Wayfarer (Gen 2)'].description,
          },
        });
        console.log(`✅ Обновлен (Wayfarer): ${product.model}`);
        console.log(`   Цена: ${oldPrice} € → ${vrData['Ray-Ban Meta Wayfarer (Gen 2)'].price} €`);
        updated++;
      } else {
        console.log(`⚠️  Товар не найден в списке: ${product.model} (текущая цена: ${product.basePrice} €)`);
        notFound++;
      }
    }
  }

  console.log(`\n✅ Обновление завершено!`);
  console.log(`   Обновлено: ${updated}`);
  console.log(`   Не найдено: ${notFound}`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
