import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Цены и описания для наушников
const headphonesData: Record<string, { price: number; description: string }> = {
  'Apple AirPods 4 ANC': {
    price: 179,
    description: `<h2>🎧 Apple AirPods 4 ANC</h2>
<p>Die Apple AirPods 4 ANC bieten aktive Geräuschunterdrückung und ein verbessertes Hörerlebnis in einem kompakten Design.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Active Noise Cancellation:</strong> Professionelle Geräuschunterdrückung für fokussiertes Hören</li>
<li><strong>Adaptive Audio:</strong> Passt sich automatisch an Ihre Umgebung an</li>
<li><strong>Personalized Spatial Audio:</strong> Immersives 3D-Audio-Erlebnis</li>
<li><strong>Batterie:</strong> Bis zu 6 Stunden Wiedergabe, bis zu 30 Stunden mit Ladecase</li>
<li><strong>Ladecase:</strong> USB-C und MagSafe kompatibel</li>
<li><strong>Wasserschutz:</strong> IPX4 für Schweiß und Spritzwasser</li>
<li><strong>Touch-Steuerung:</strong> Intuitive Bedienung am Stiel</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>Adaptive EQ für optimale Klangqualität</li>
<li>Dynamischer Kopfhörer-Tracking</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für klare Anrufe</li>
</ul>`
  },
  'Apple AirPods Max 2 (Blue)': {
    price: 599,
    description: `<h2>🎧 Apple AirPods Max 2 (Blue)</h2>
<p>Die Apple AirPods Max 2 bieten Premium-Klangqualität und aktive Geräuschunterdrückung in einem eleganten Over-Ear-Design.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Over-Ear Kopfhörer mit Aluminium-Gehäuse</li>
<li><strong>Active Noise Cancellation:</strong> Professionelle Geräuschunterdrückung</li>
<li><strong>Transparency Mode:</strong> Hören Sie Ihre Umgebung, wenn nötig</li>
<li><strong>Batterie:</strong> Bis zu 20 Stunden Wiedergabe</li>
<li><strong>Personalized Spatial Audio:</strong> Mit dynamischem Kopfhörer-Tracking</li>
<li><strong>Digital Crown:</strong> Präzise Lautstärke- und Wiedergabesteuerung</li>
<li><strong>Kompatibilität:</strong> Apple Geräte und Bluetooth-Geräte</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>40mm dynamische Treiber für tiefe Bässe</li>
<li>Adaptive EQ</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für Anrufe</li>
</ul>`
  },
  'Apple AirPods Max 2 (Midnight)': {
    price: 599,
    description: `<h2>🎧 Apple AirPods Max 2 (Midnight)</h2>
<p>Die Apple AirPods Max 2 in Midnight bieten Premium-Klangqualität und aktive Geräuschunterdrückung in einem eleganten Over-Ear-Design.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Over-Ear Kopfhörer mit Aluminium-Gehäuse in Midnight</li>
<li><strong>Active Noise Cancellation:</strong> Professionelle Geräuschunterdrückung</li>
<li><strong>Transparency Mode:</strong> Hören Sie Ihre Umgebung, wenn nötig</li>
<li><strong>Batterie:</strong> Bis zu 20 Stunden Wiedergabe</li>
<li><strong>Personalized Spatial Audio:</strong> Mit dynamischem Kopfhörer-Tracking</li>
<li><strong>Digital Crown:</strong> Präzise Lautstärke- und Wiedergabesteuerung</li>
<li><strong>Kompatibilität:</strong> Apple Geräte und Bluetooth-Geräte</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>40mm dynamische Treiber für tiefe Bässe</li>
<li>Adaptive EQ</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für Anrufe</li>
</ul>`
  },
  'Apple AirPods Max 2 (Orange)': {
    price: 599,
    description: `<h2>🎧 Apple AirPods Max 2 (Orange)</h2>
<p>Die Apple AirPods Max 2 in Orange bieten Premium-Klangqualität und aktive Geräuschunterdrückung in einem eleganten Over-Ear-Design.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Over-Ear Kopfhörer mit Aluminium-Gehäuse in Orange</li>
<li><strong>Active Noise Cancellation:</strong> Professionelle Geräuschunterdrückung</li>
<li><strong>Transparency Mode:</strong> Hören Sie Ihre Umgebung, wenn nötig</li>
<li><strong>Batterie:</strong> Bis zu 20 Stunden Wiedergabe</li>
<li><strong>Personalized Spatial Audio:</strong> Mit dynamischem Kopfhörer-Tracking</li>
<li><strong>Digital Crown:</strong> Präzise Lautstärke- und Wiedergabesteuerung</li>
<li><strong>Kompatibilität:</strong> Apple Geräte und Bluetooth-Geräte</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>40mm dynamische Treiber für tiefe Bässe</li>
<li>Adaptive EQ</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für Anrufe</li>
</ul>`
  },
  'Apple AirPods Max 2 (Purple)': {
    price: 599,
    description: `<h2>🎧 Apple AirPods Max 2 (Purple)</h2>
<p>Die Apple AirPods Max 2 in Purple bieten Premium-Klangqualität und aktive Geräuschunterdrückung in einem eleganten Over-Ear-Design.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Over-Ear Kopfhörer mit Aluminium-Gehäuse in Purple</li>
<li><strong>Active Noise Cancellation:</strong> Professionelle Geräuschunterdrückung</li>
<li><strong>Transparency Mode:</strong> Hören Sie Ihre Umgebung, wenn nötig</li>
<li><strong>Batterie:</strong> Bis zu 20 Stunden Wiedergabe</li>
<li><strong>Personalized Spatial Audio:</strong> Mit dynamischem Kopfhörer-Tracking</li>
<li><strong>Digital Crown:</strong> Präzise Lautstärke- und Wiedergabesteuerung</li>
<li><strong>Kompatibilität:</strong> Apple Geräte und Bluetooth-Geräte</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>40mm dynamische Treiber für tiefe Bässe</li>
<li>Adaptive EQ</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für Anrufe</li>
</ul>`
  },
  'Apple AirPods Max 2 (Starlight)': {
    price: 599,
    description: `<h2>🎧 Apple AirPods Max 2 (Starlight)</h2>
<p>Die Apple AirPods Max 2 in Starlight bieten Premium-Klangqualität und aktive Geräuschunterdrückung in einem eleganten Over-Ear-Design.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Over-Ear Kopfhörer mit Aluminium-Gehäuse in Starlight</li>
<li><strong>Active Noise Cancellation:</strong> Professionelle Geräuschunterdrückung</li>
<li><strong>Transparency Mode:</strong> Hören Sie Ihre Umgebung, wenn nötig</li>
<li><strong>Batterie:</strong> Bis zu 20 Stunden Wiedergabe</li>
<li><strong>Personalized Spatial Audio:</strong> Mit dynamischem Kopfhörer-Tracking</li>
<li><strong>Digital Crown:</strong> Präzise Lautstärke- und Wiedergabesteuerung</li>
<li><strong>Kompatibilität:</strong> Apple Geräte und Bluetooth-Geräte</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>40mm dynamische Treiber für tiefe Bässe</li>
<li>Adaptive EQ</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für Anrufe</li>
</ul>`
  },
  'Apple AirPods Pro 2': {
    price: 249,
    description: `<h2>🎧 Apple AirPods Pro 2</h2>
<p>Die Apple AirPods Pro 2 bieten aktive Geräuschunterdrückung der nächsten Generation und ein verbessertes Hörerlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Active Noise Cancellation:</strong> Bis zu 2x stärkere Geräuschunterdrückung</li>
<li><strong>Adaptive Audio:</strong> Passt sich automatisch an Ihre Umgebung an</li>
<li><strong>Personalized Spatial Audio:</strong> Mit dynamischem Kopfhörer-Tracking</li>
<li><strong>Batterie:</strong> Bis zu 6 Stunden Wiedergabe, bis zu 30 Stunden mit Ladecase</li>
<li><strong>Ladecase:</strong> USB-C und MagSafe kompatibel, mit Find My</li>
<li><strong>Wasserschutz:</strong> IPX4 für Schweiß und Spritzwasser</li>
<li><strong>Touch-Steuerung:</strong> Intuitive Bedienung am Stiel</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>Adaptive EQ für optimale Klangqualität</li>
<li>Dynamischer Kopfhörer-Tracking</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für klare Anrufe</li>
<li>H2 Chip für verbesserte Performance</li>
</ul>`
  },
  'Apple AirPods Pro 3': {
    price: 299,
    description: `<h2>🎧 Apple AirPods Pro 3</h2>
<p>Die Apple AirPods Pro 3 sind die neueste Generation mit verbesserter Geräuschunterdrückung und erweiterten Audio-Features.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Active Noise Cancellation:</strong> Professionelle Geräuschunterdrückung der nächsten Generation</li>
<li><strong>Adaptive Audio:</strong> Intelligente Anpassung an Ihre Umgebung</li>
<li><strong>Personalized Spatial Audio:</strong> Mit dynamischem Kopfhörer-Tracking</li>
<li><strong>Batterie:</strong> Bis zu 7 Stunden Wiedergabe, bis zu 35 Stunden mit Ladecase</li>
<li><strong>Ladecase:</strong> USB-C und MagSafe kompatibel, mit Find My</li>
<li><strong>Wasserschutz:</strong> IPX4 für Schweiß und Spritzwasser</li>
<li><strong>Touch-Steuerung:</strong> Erweiterte Gestensteuerung</li>
</ul>

<h3>🎵 Audio Features:</h3>
<ul>
<li>Adaptive EQ für optimale Klangqualität</li>
<li>Dynamischer Kopfhörer-Tracking</li>
<li>Dolby Atmos Unterstützung</li>
<li>Hochwertige Mikrofone für klare Anrufe</li>
<li>H3 Chip für verbesserte Performance</li>
<li>Lossless Audio Unterstützung</li>
</ul>`
  },
};

async function main() {
  console.log('🎧 Обновление цен и описаний для наушников...\n');

  let updated = 0;
  let notFound = 0;

  for (const [modelName, data] of Object.entries(headphonesData)) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          model: {
            contains: modelName.split('(')[0].trim(), // Ищем по части модели без цвета
          },
          category: {
            slug: 'headphones',
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
