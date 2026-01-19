import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Цены и описания для VR товаров
const vrData: Record<string, { price: number; description: string }> = {
  'Meta Quest 3 128GB': {
    price: 549,
    description: `<h2>🥽 Meta Quest 3 128GB</h2>
<p>Der Meta Quest 3 ist ein Mixed-Reality Headset der nächsten Generation mit verbesserter Performance und erweiterten AR-Funktionen.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> Dual LCD mit 2064 x 2208 Pixel pro Auge (4128 x 2208 gesamt)</li>
<li><strong>Prozessor:</strong> Snapdragon XR2 Gen 2 für verbesserte Performance</li>
<li><strong>Speicher:</strong> 128GB interner Speicher</li>
<li><strong>Mixed Reality:</strong> Passthrough-Technologie für AR-Erlebnisse</li>
<li><strong>Tracking:</strong> Inside-Out Tracking mit 6 DoF</li>
<li><strong>Batterie:</strong> Bis zu 2-3 Stunden Spielzeit</li>
<li><strong>Kompatibilität:</strong> PC VR, Standalone VR, AR-Apps</li>
<li><strong>Controller:</strong> Touch Plus Controller mit haptischem Feedback</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Refresh Rate</li>
<li>Hand-Tracking 2.0</li>
<li>Passthrough+ für Mixed Reality</li>
<li>Kompatibel mit Quest 2 Spielen</li>
</ul>

<h3>📱 Smart Features:</h3>
<ul>
<li>Meta Horizon Home</li>
<li>Social VR Funktionen</li>
<li>Streaming zu PC</li>
<li>WLAN 6E Unterstützung</li>
</ul>`
  },
  'Meta Quest 3 512GB': {
    price: 699,
    description: `<h2>🥽 Meta Quest 3 512GB</h2>
<p>Der Meta Quest 3 mit 512GB Speicher bietet mehr Platz für Spiele, Apps und Medieninhalte.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> Dual LCD mit 2064 x 2208 Pixel pro Auge (4128 x 2208 gesamt)</li>
<li><strong>Prozessor:</strong> Snapdragon XR2 Gen 2 für verbesserte Performance</li>
<li><strong>Speicher:</strong> 512GB interner Speicher</li>
<li><strong>Mixed Reality:</strong> Passthrough-Technologie für AR-Erlebnisse</li>
<li><strong>Tracking:</strong> Inside-Out Tracking mit 6 DoF</li>
<li><strong>Batterie:</strong> Bis zu 2-3 Stunden Spielzeit</li>
<li><strong>Kompatibilität:</strong> PC VR, Standalone VR, AR-Apps</li>
<li><strong>Controller:</strong> Touch Plus Controller mit haptischem Feedback</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Refresh Rate</li>
<li>Hand-Tracking 2.0</li>
<li>Passthrough+ für Mixed Reality</li>
<li>Kompatibel mit Quest 2 Spielen</li>
</ul>

<h3>📱 Smart Features:</h3>
<ul>
<li>Meta Horizon Home</li>
<li>Social VR Funktionen</li>
<li>Streaming zu PC</li>
<li>WLAN 6E Unterstützung</li>
</ul>`
  },
  'Meta Quest Pro': {
    price: 1099,
    description: `<h2>🥽 Meta Quest Pro</h2>
<p>Der Meta Quest Pro ist ein Premium VR-Headset für professionelle Anwendungen und High-End Gaming.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> Dual QLED mit 1800 x 1920 Pixel pro Auge</li>
<li><strong>Prozessor:</strong> Snapdragon XR2+ für maximale Performance</li>
<li><strong>Speicher:</strong> 256GB interner Speicher</li>
<li><strong>Eye Tracking:</strong> Präzises Eye-Tracking für natürliche Interaktion</li>
<li><strong>Face Tracking:</strong> Erweiterte Gesichtserkennung</li>
<li><strong>Mixed Reality:</strong> High-Quality Passthrough mit Farbkameras</li>
<li><strong>Tracking:</strong> Inside-Out Tracking mit 6 DoF</li>
<li><strong>Batterie:</strong> Bis zu 1-2 Stunden Spielzeit</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>90Hz Refresh Rate</li>
<li>Hand-Tracking</li>
<li>Eye-Tracking für foveated rendering</li>
<li>Premium Controller mit haptischem Feedback</li>
</ul>

<h3>💼 Professional Features:</h3>
<ul>
<li>Meta Horizon Workrooms</li>
<li>Erweiterte Mixed Reality</li>
<li>Professional Software-Kompatibilität</li>
<li>High-End Grafik-Performance</li>
</ul>`
  },
  'Ray-Ban Meta Skyler (Gen 2)': {
    price: 329,
    description: `<h2>🥽 Ray-Ban Meta Skyler (Gen 2)</h2>
<p>Die Ray-Ban Meta Skyler (Gen 2) sind intelligente Sonnenbrillen mit integrierter Kamera und AR-Funktionen.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Klassisches Ray-Ban Skyler Design</li>
<li><strong>Kamera:</strong> 12MP Ultra-Wide Kamera</li>
<li><strong>Audio:</strong> Offene Lautsprecher für Musik und Anrufe</li>
<li><strong>Smart Features:</strong> Meta AI Integration</li>
<li><strong>Live Streaming:</strong> Direktes Streaming zu Instagram und Facebook</li>
<li><strong>Batterie:</strong> Bis zu 4 Stunden Nutzung</li>
<li><strong>Ladecase:</strong> Inklusive Ladecase mit zusätzlicher Batterie</li>
<li><strong>Kompatibilität:</strong> iOS und Android</li>
</ul>

<h3>📸 Camera Features:</h3>
<ul>
<li>12MP Ultra-Wide Kamera</li>
<li>Video-Aufnahme in HD</li>
<li>Foto-Aufnahme</li>
<li>Live-Streaming</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>Offene Lautsprecher</li>
<li>Mikrofone für Anrufe</li>
<li>Meta AI Voice Assistant</li>
<li>Bluetooth-Konnektivität</li>
</ul>`
  },
  'Ray-Ban Meta Wayfarer (Gen 2)': {
    price: 329,
    description: `<h2>🥽 Ray-Ban Meta Wayfarer (Gen 2)</h2>
<p>Die Ray-Ban Meta Wayfarer (Gen 2) sind intelligente Sonnenbrillen im klassischen Wayfarer Design mit integrierter Kamera.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Klassisches Ray-Ban Wayfarer Design</li>
<li><strong>Kamera:</strong> 12MP Ultra-Wide Kamera</li>
<li><strong>Audio:</strong> Offene Lautsprecher für Musik und Anrufe</li>
<li><strong>Smart Features:</strong> Meta AI Integration</li>
<li><strong>Live Streaming:</strong> Direktes Streaming zu Instagram und Facebook</li>
<li><strong>Batterie:</strong> Bis zu 4 Stunden Nutzung</li>
<li><strong>Ladecase:</strong> Inklusive Ladecase mit zusätzlicher Batterie</li>
<li><strong>Kompatibilität:</strong> iOS und Android</li>
</ul>

<h3>📸 Camera Features:</h3>
<ul>
<li>12MP Ultra-Wide Kamera</li>
<li>Video-Aufnahme in HD</li>
<li>Foto-Aufnahme</li>
<li>Live-Streaming</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>Offene Lautsprecher</li>
<li>Mikrofone für Anrufe</li>
<li>Meta AI Voice Assistant</li>
<li>Bluetooth-Konnektivität</li>
</ul>`
  },
};

async function main() {
  console.log('🥽 Обновление цен и описаний для VR товаров...\n');

  let updated = 0;
  let notFound = 0;

  for (const [modelName, data] of Object.entries(vrData)) {
    try {
      // Ищем товар по части модели
      const product = await prisma.product.findFirst({
        where: {
          OR: [
            { model: { contains: modelName } },
            { model: { startsWith: modelName.split('(')[0].trim() } },
          ],
          category: {
            slug: 'vr-headsets',
          },
        },
      });

      if (!product) {
        console.log(`⚠️  Товар не найден: ${modelName}`);
        notFound++;
        continue;
      }

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
    } catch (error) {
      console.error(`❌ Ошибка при обновлении ${modelName}:`, error);
    }
  }

  // Обновляем все Ray-Ban Meta Skyler модели одним описанием
  const skylerProducts = await prisma.product.findMany({
    where: {
      model: {
        contains: 'Ray-Ban Meta Skyler',
      },
      category: {
        slug: 'vr-headsets',
      },
    },
  });

  for (const product of skylerProducts) {
    if (!product.baseDescription || product.baseDescription.trim() === '') {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: 329,
          baseDescription: vrData['Ray-Ban Meta Skyler (Gen 2)'].description,
        },
      });
      console.log(`✅ Обновлен: ${product.model} (329 €)`);
      updated++;
    }
  }

  // Обновляем Ray-Ban Meta Wayfarer
  const wayfarerProducts = await prisma.product.findMany({
    where: {
      model: {
        contains: 'Ray-Ban Meta Wayfarer',
      },
      category: {
        slug: 'vr-headsets',
      },
    },
  });

  for (const product of wayfarerProducts) {
    if (!product.baseDescription || product.baseDescription.trim() === '') {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: 329,
          baseDescription: vrData['Ray-Ban Meta Wayfarer (Gen 2)'].description,
        },
      });
      console.log(`✅ Обновлен: ${product.model} (329 €)`);
      updated++;
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
