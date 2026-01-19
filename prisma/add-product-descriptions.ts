import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Описания и характеристики на немецком языке для ноутбуков
const laptopDescriptions: Record<string, string> = {
  'Acer Predator Helios Neo 14 PHN14-51-79UB 14,5 (Intel Core Ultra 716GB1TB (SSD)RTX 4070) (NH.QRNAA.001)': `<div class="product-description">
<h2>🚀 Acer Predator Helios Neo 14 - Gaming Powerhouse</h2>
<p>Der <strong>Acer Predator Helios Neo 14</strong> ist ein kompakter Gaming-Laptop, der maximale Leistung in einem schlanken Design bietet. Perfekt für Gamer und Content-Creator, die unterwegs nicht auf Performance verzichten möchten.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> Intel Core Ultra 7 - Hochleistungsprozessor für anspruchsvolle Aufgaben</li>
<li><strong>Grafikkarte:</strong> NVIDIA GeForce RTX 4070 - Ray-Tracing und DLSS 3.0 für atemberaubende Grafik</li>
<li><strong>Arbeitsspeicher:</strong> 16 GB DDR5 - Schneller Multitasking und nahtlose Performance</li>
<li><strong>Speicher:</strong> 1 TB NVMe SSD - Blitzschnelle Ladezeiten und ausreichend Platz</li>
<li><strong>Display:</strong> 14,5" IPS Panel - Lebendige Farben und scharfe Details</li>
<li><strong>Kühlung:</strong> AeroBlade 3D Technologie - Optimale Wärmeableitung für konstante Performance</li>
</ul>

<h3>🎮 Gaming Features</h3>
<ul>
<li>NVIDIA DLSS 3.0 für höhere Frame-Rates</li>
<li>Ray-Tracing für realistische Beleuchtung</li>
<li>PredatorSense Software für Performance-Tuning</li>
<li>RGB-Tastatur mit individueller Beleuchtung</li>
</ul>

<h3>💼 Design & Portabilität</h3>
<p>Mit seinem kompakten 14,5" Design ist der Helios Neo 14 perfekt für unterwegs, ohne Kompromisse bei der Gaming-Performance einzugehen.</p>
</div>`,

  'Acer Nitro V 15 ANV15-51 15.6 (Intel Core i516GB512GB (SSD)RTX 4050) (NH.QNBEU.001)': `<div class="product-description">
<h2>⚡ Acer Nitro V 15 - Entry-Level Gaming</h2>
<p>Der <strong>Acer Nitro V 15</strong> bietet solide Gaming-Performance zu einem erschwinglichen Preis. Ideal für Einsteiger in die Gaming-Welt.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> Intel Core i5 - Zuverlässige Performance für Gaming und Alltag</li>
<li><strong>Grafikkarte:</strong> NVIDIA GeForce RTX 4050 - Moderne Spiele in Full HD</li>
<li><strong>Arbeitsspeicher:</strong> 16 GB DDR5 - Flüssiges Multitasking</li>
<li><strong>Speicher:</strong> 512 GB NVMe SSD - Schnelle Ladezeiten</li>
<li><strong>Display:</strong> 15,6" Full HD - Klare und detailreiche Darstellung</li>
</ul>

<h3>🎮 Gaming Features</h3>
<ul>
<li>NVIDIA DLSS für optimierte Performance</li>
<li>Dual-Fan Kühlsystem</li>
<li>NitroSense Software</li>
<li>RGB-Tastatur</li>
</ul>
</div>`,

  'Acer Nitro V 15 ANV15-51 15.6 (Intel Core i932GB1TB SSDRTX 4060) (NH.QQEAA.027)': `<div class="product-description">
<h2>🔥 Acer Nitro V 15 - High-Performance Gaming</h2>
<p>Der <strong>Acer Nitro V 15</strong> mit Intel Core i9 und RTX 4060 bietet Top-Performance für anspruchsvolle Gamer.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> Intel Core i9 - Höchste Performance für Gaming und Content Creation</li>
<li><strong>Grafikkarte:</strong> NVIDIA GeForce RTX 4060 - Ray-Tracing und DLSS Support</li>
<li><strong>Arbeitsspeicher:</strong> 32 GB DDR5 - Perfekt für Streaming und Multitasking</li>
<li><strong>Speicher:</strong> 1 TB NVMe SSD - Massiver Speicherplatz</li>
<li><strong>Display:</strong> 15,6" Full HD - Optimale Gaming-Erfahrung</li>
</ul>

<h3>🎮 Gaming Features</h3>
<ul>
<li>NVIDIA DLSS 3.0</li>
<li>Ray-Tracing Technologie</li>
<li>Erweiterte Kühlung</li>
<li>Customizable RGB-Beleuchtung</li>
</ul>
</div>`,

  'Acer Nitro V 16 ANV16-42 16 (AMD Ryzen 516GB1TB (SSD)RTX 5060) (NH.U1GEU.003)': `<div class="product-description">
<h2>💪 Acer Nitro V 16 - Next-Gen Gaming</h2>
<p>Der <strong>Acer Nitro V 16</strong> mit AMD Ryzen 5 und RTX 5060 kombiniert moderne Technologie mit großzügigem 16" Display.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> AMD Ryzen 5 - Effiziente Multi-Core Performance</li>
<li><strong>Grafikkarte:</strong> NVIDIA GeForce RTX 5060 - Neueste GPU-Generation</li>
<li><strong>Arbeitsspeicher:</strong> 16 GB DDR5 - Optimale Gaming-Performance</li>
<li><strong>Speicher:</strong> 1 TB NVMe SSD - Schneller Massenspeicher</li>
<li><strong>Display:</strong> 16" Full HD+ - Größerer Bildschirm für immersive Erfahrung</li>
</ul>

<h3>🎮 Gaming Features</h3>
<ul>
<li>NVIDIA DLSS 3.5</li>
<li>Ray-Tracing 2.0</li>
<li>AMD SmartShift Technologie</li>
<li>Erweiterte Kühlung</li>
</ul>
</div>`,

  'Acer Nitro V ANV15-52 15,6 (Intel Core i516GB512GB (SSD)RTX 5060) (NH.QZ8EP.00E)': `<div class="product-description">
<h2>⚡ Acer Nitro V - RTX 5060 Edition</h2>
<p>Der <strong>Acer Nitro V</strong> mit RTX 5060 bietet exzellente Gaming-Performance in kompaktem Format.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> Intel Core i5 - Zuverlässige Performance</li>
<li><strong>Grafikkarte:</strong> NVIDIA GeForce RTX 5060 - Next-Gen Gaming</li>
<li><strong>Arbeitsspeicher:</strong> 16 GB DDR5</li>
<li><strong>Speicher:</strong> 512 GB NVMe SSD</li>
<li><strong>Display:</strong> 15,6" Full HD</li>
</ul>
</div>`,

  'Acer ANV15-41 R5-6600H 15.6 (AMD Ryzen 516GB512GB (SSD)RTX 3050) (NH.QSHEU.00P)': `<div class="product-description">
<h2>🎮 Acer Nitro V 15 - Budget Gaming</h2>
<p>Der <strong>Acer Nitro V 15</strong> mit AMD Ryzen 5 und RTX 3050 bietet solide Gaming-Performance zu einem günstigen Preis.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> AMD Ryzen 5 6600H - Effiziente Gaming-Performance</li>
<li><strong>Grafikkarte:</strong> NVIDIA GeForce RTX 3050 - Entry-Level Gaming GPU</li>
<li><strong>Arbeitsspeicher:</strong> 16 GB DDR5</li>
<li><strong>Speicher:</strong> 512 GB NVMe SSD</li>
<li><strong>Display:</strong> 15,6" Full HD</li>
</ul>
</div>`,

  'Acer Aspire 17 A17-51 17,3 (Intel Core 716GB1TB (SSD)RTX 2050) (NX.J1UEG.012)': `<div class="product-description">
<h2>💼 Acer Aspire 17 - Großes Display, Große Performance</h2>
<p>Der <strong>Acer Aspire 17</strong> kombiniert ein großzügiges 17,3" Display mit solider Performance für Arbeit und Entertainment.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> Intel Core 7 - Starke Performance für Multitasking</li>
<li><strong>Grafikkarte:</strong> NVIDIA GeForce RTX 2050 - Leichtes Gaming möglich</li>
<li><strong>Arbeitsspeicher:</strong> 16 GB - Ausreichend für alle Aufgaben</li>
<li><strong>Speicher:</strong> 1 TB SSD - Großer Speicherplatz</li>
<li><strong>Display:</strong> 17,3" Full HD - Großzügige Arbeitsfläche</li>
</ul>

<h3>💼 Ideal für</h3>
<ul>
<li>Produktivität und Multitasking</li>
<li>Content Creation</li>
<li>Entertainment und Streaming</li>
<li>Leichtes Gaming</li>
</ul>
</div>`,

  'Acer Aspire Lite AL15-33P-38GK 15,6 (Intel Core 316GB512GB (SSD)Intel UHD) (NX.DDPEX.001)': `<div class="product-description">
<h2>📚 Acer Aspire Lite - Kompakt und Effizient</h2>
<p>Der <strong>Acer Aspire Lite</strong> ist ein schlanker, leistungsstarker Laptop für den täglichen Gebrauch.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> Intel Core 3 - Energieeffiziente Performance</li>
<li><strong>Grafik:</strong> Intel UHD Graphics - Integrierte Grafiklösung</li>
<li><strong>Arbeitsspeicher:</strong> 16 GB - Flüssiges Multitasking</li>
<li><strong>Speicher:</strong> 512 GB SSD - Schneller Speicher</li>
<li><strong>Display:</strong> 15,6" Full HD - Klare Darstellung</li>
</ul>

<h3>💼 Ideal für</h3>
<ul>
<li>Alltägliche Aufgaben</li>
<li>Office-Anwendungen</li>
<li>Web-Browsing</li>
<li>Streaming und Entertainment</li>
</ul>
</div>`,

  'Acer Chromebook Plus 514 -CB514-3HT-R8C2 (AMD Ryzen 38GB256 GB (SSD)AMD Radeon Graphics)': `<div class="product-description">
<h2>🌐 Acer Chromebook Plus 514 - Cloud-Powered</h2>
<p>Der <strong>Acer Chromebook Plus 514</strong> bietet schnelle Performance mit Chrome OS für moderne Arbeitsweisen.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Prozessor:</strong> AMD Ryzen 3 - Effiziente Performance</li>
<li><strong>Grafik:</strong> AMD Radeon Graphics - Integrierte Grafik</li>
<li><strong>Arbeitsspeicher:</strong> 8 GB - Optimiert für Chrome OS</li>
<li><strong>Speicher:</strong> 256 GB eMMC - Cloud-Integration</li>
<li><strong>Display:</strong> 14" Full HD - Klare Darstellung</li>
</ul>

<h3>💼 Chrome OS Features</h3>
<ul>
<li>Schneller Start und Update</li>
<li>Google Workspace Integration</li>
<li>Android App Support</li>
<li>Erhöhte Sicherheit</li>
</ul>
</div>`,
};

// Описания для iPhone на немецком
const iphoneDescriptions: Record<string, string> = {
  'iPhone 17': `<div class="product-description">
<h2>📱 Apple iPhone 17 - Innovation für alle</h2>
<p>Das <strong>Apple iPhone 17</strong> setzt neue Maßstäbe mit fortschrittlicher Technologie und elegantem Design.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Chip:</strong> A18 Bionic - Revolutionäre Performance</li>
<li><strong>Kamera:</strong> 48 MP Hauptkamera mit verbesserter Nachtsicht</li>
<li><strong>Display:</strong> 6,1" Super Retina XDR - Lebendige Farben</li>
<li><strong>Batterie:</strong> Bis zu 20 Stunden Video-Wiedergabe</li>
<li><strong>Speicher:</strong> 256 GB / 512 GB - Ausreichend für alles</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Black, Blue, Lavender, Sage, Silver</li>
</ul>

<h3>💡 Besondere Features</h3>
<ul>
<li>Action Button für schnellen Zugriff</li>
<li>USB-C Anschluss</li>
<li>iOS 18 mit KI-Features</li>
<li>Wasserdicht IP68</li>
</ul>
</div>`,

  'iPhone 17 Air': `<div class="product-description">
<h2>📱 Apple iPhone 17 Air - Leicht und Leistungsstark</h2>
<p>Das <strong>Apple iPhone 17 Air</strong> kombiniert elegantes Design mit beeindruckender Performance.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Chip:</strong> A18 Bionic - Höchste Performance</li>
<li><strong>Kamera:</strong> 48 MP Pro-Kamera-System</li>
<li><strong>Display:</strong> 6,1" Super Retina XDR - Brillante Darstellung</li>
<li><strong>Batterie:</strong> Bis zu 22 Stunden Video-Wiedergabe</li>
<li><strong>Speicher:</strong> 256 GB / 512 GB / 1 TB</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Cloud White, Light Gold, Sky Blue, Space Black</li>
</ul>

<h3>💡 Besondere Features</h3>
<ul>
<li>Ultra-dünnes Design</li>
<li>Verbesserte Kamera-Performance</li>
<li>Längere Batterielaufzeit</li>
<li>5G Connectivity</li>
</ul>
</div>`,

  'iPhone 17 Pro': `<div class="product-description">
<h2>📱 Apple iPhone 17 Pro - Pro Performance</h2>
<p>Das <strong>Apple iPhone 17 Pro</strong> bietet professionelle Features für anspruchsvolle Nutzer.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Chip:</strong> A18 Pro - Pro-Level Performance</li>
<li><strong>Kamera:</strong> 48 MP Pro-Kamera mit Teleobjektiv</li>
<li><strong>Display:</strong> 6,1" Super Retina XDR ProMotion - 120 Hz</li>
<li><strong>Batterie:</strong> Bis zu 23 Stunden Video-Wiedergabe</li>
<li><strong>Speicher:</strong> 256 GB / 512 GB / 1 TB</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Cosmic Orange, Deep Blue, Silver</li>
</ul>

<h3>💡 Pro Features</h3>
<ul>
<li>ProRAW und ProRes Video</li>
<li>Titanium Gehäuse</li>
<li>Action Button</li>
<li>USB-C mit Thunderbolt</li>
</ul>
</div>`,

  'iPhone 17 Pro Max': `<div class="product-description">
<h2>📱 Apple iPhone 17 Pro Max - Das Ultimative</h2>
<p>Das <strong>Apple iPhone 17 Pro Max</strong> ist das leistungsstärkste iPhone mit größtem Display.</p>

<h3>✨ Hauptmerkmale</h3>
<ul>
<li><strong>Chip:</strong> A18 Pro - Maximale Performance</li>
<li><strong>Kamera:</strong> 48 MP Pro-Kamera mit 5x Teleobjektiv</li>
<li><strong>Display:</strong> 6,7" Super Retina XDR ProMotion - 120 Hz</li>
<li><strong>Batterie:</strong> Bis zu 29 Stunden Video-Wiedergabe</li>
<li><strong>Speicher:</strong> 256 GB / 512 GB / 1 TB / 2 TB</li>
</ul>

<h3>🎨 Verfügbare Farben</h3>
<ul>
<li>Cosmic Orange, Deep Blue, Silver</li>
</ul>

<h3>💡 Max Features</h3>
<ul>
<li>Größtes iPhone Display</li>
<li>Beste Kamera-Performance</li>
<li>Längste Batterielaufzeit</li>
<li>ProRes Video Recording</li>
</ul>
</div>`,
};

async function main() {
  console.log('📝 Hinzufügen von Produktbeschreibungen...\n');

  // Обновляем описания для ноутбуков
  let laptopsUpdated = 0;
  const laptops = await prisma.product.findMany({
    where: {
      category: {
        slug: 'laptops',
      },
    },
  });

  for (const product of laptops) {
    // Ищем описание по ключевым словам модели
    let description = null;
    const modelLower = product.model.toLowerCase();
    
    if (modelLower.includes('predator helios neo 14')) {
      description = laptopDescriptions['Acer Predator Helios Neo 14 PHN14-51-79UB 14,5 (Intel Core Ultra 716GB1TB (SSD)RTX 4070) (NH.QRNAA.001)'];
    } else if (modelLower.includes('nitro v 15') && modelLower.includes('i9') && modelLower.includes('4060')) {
      description = laptopDescriptions['Acer Nitro V 15 ANV15-51 15.6 (Intel Core i932GB1TB SSDRTX 4060) (NH.QQEAA.027)'];
    } else if (modelLower.includes('nitro v 15') && modelLower.includes('i5') && modelLower.includes('4050')) {
      description = laptopDescriptions['Acer Nitro V 15 ANV15-51 15.6 (Intel Core i516GB512GB (SSD)RTX 4050) (NH.QNBEU.001)'];
    } else if (modelLower.includes('nitro v 16')) {
      description = laptopDescriptions['Acer Nitro V 16 ANV16-42 16 (AMD Ryzen 516GB1TB (SSD)RTX 5060) (NH.U1GEU.003)'];
    } else if (modelLower.includes('nitro v') && modelLower.includes('5060')) {
      description = laptopDescriptions['Acer Nitro V ANV15-52 15,6 (Intel Core i516GB512GB (SSD)RTX 5060) (NH.QZ8EP.00E)'];
    } else if (modelLower.includes('anv15-41') || (modelLower.includes('ryzen 5') && modelLower.includes('rtx 3050'))) {
      description = laptopDescriptions['Acer ANV15-41 R5-6600H 15.6 (AMD Ryzen 516GB512GB (SSD)RTX 3050) (NH.QSHEU.00P)'];
    } else if (modelLower.includes('aspire 17')) {
      description = laptopDescriptions['Acer Aspire 17 A17-51 17,3 (Intel Core 716GB1TB (SSD)RTX 2050) (NX.J1UEG.012)'];
    } else if (modelLower.includes('aspire lite')) {
      description = laptopDescriptions['Acer Aspire Lite AL15-33P-38GK 15,6 (Intel Core 316GB512GB (SSD)Intel UHD) (NX.DDPEX.001)'];
    } else if (modelLower.includes('chromebook plus 514')) {
      description = laptopDescriptions['Acer Chromebook Plus 514 -CB514-3HT-R8C2 (AMD Ryzen 38GB256 GB (SSD)AMD Radeon Graphics)'];
    }

    if (description) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          baseDescription: description,
        },
      });
      console.log(`✅ ${product.model.substring(0, 60)}...`);
      laptopsUpdated++;
    } else {
      console.log(`⚠️ Описание не найдено для: ${product.model}`);
    }
  }

  // Обновляем описания для iPhone
  let iphonesUpdated = 0;
  for (const [model, description] of Object.entries(iphoneDescriptions)) {
    const product = await prisma.product.findFirst({
      where: {
        model: model,
      },
    });

    if (product) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          baseDescription: description,
        },
      });
      console.log(`✅ ${product.model}`);
      iphonesUpdated++;
    }
  }

  console.log(`\n📊 Zusammenfassung:`);
  console.log(`   Laptops aktualisiert: ${laptopsUpdated}`);
  console.log(`   iPhones aktualisiert: ${iphonesUpdated}`);
}

main()
  .catch((e) => {
    console.error('❌ Fehler:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
