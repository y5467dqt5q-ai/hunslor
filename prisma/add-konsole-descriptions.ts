import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Описания на немецком для консолей
const consoleDescriptions: Record<string, string> = {
  'PlayStation 5': `
    <div class="description-section">
      <h2>🎮 PlayStation 5</h2>
      <p>Die nächste Generation der Gaming-Konsole von Sony mit revolutionärer Leistung und immersiven Erlebnissen.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Prozessor:</strong> Custom AMD Zen 2 CPU mit 8 Kernen bei 3.5 GHz</li>
        <li><strong>Grafik:</strong> Custom AMD RDNA 2 GPU mit Ray-Tracing-Unterstützung</li>
        <li><strong>Speicher:</strong> 825GB oder 1TB ultra-schnelle SSD</li>
        <li><strong>Auflösung:</strong> Bis zu 4K bei 120 FPS, 8K-Unterstützung</li>
        <li><strong>Ray Tracing:</strong> Realistische Beleuchtung und Reflexionen</li>
        <li><strong>3D Audio:</strong> Tempest 3D AudioTech für immersiven Sound</li>
      </ul>
      
      <h3>🎯 Features:</h3>
      <ul>
        <li>DualSense Wireless Controller mit haptischem Feedback</li>
        <li>Adaptive Trigger für realistischere Spielerfahrung</li>
        <li>Backward Compatibility mit PS4-Spielen</li>
        <li>PlayStation Plus für Online-Multiplayer</li>
        <li>PlayStation Store für digitale Spiele</li>
      </ul>
      
      <h3>📦 Versionen:</h3>
      <ul>
        <li><strong>Standard:</strong> Mit Ultra HD Blu-ray Disc-Laufwerk</li>
        <li><strong>Digital Edition:</strong> Ohne Disc-Laufwerk, nur digitale Spiele</li>
        <li><strong>Pro:</strong> Erweiterte Leistung mit 2TB SSD</li>
      </ul>
    </div>
  `,
  
  'PlayStation VR2': `
    <div class="description-section">
      <h2>🥽 PlayStation VR2</h2>
      <p>Die nächste Generation der Virtual Reality für PlayStation 5 mit atemberaubender Grafik und präziser Tracking-Technologie.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> OLED-Panel mit 2000×2040 Auflösung pro Auge</li>
        <li><strong>Bildwiederholrate:</strong> 90/120 Hz für flüssige Bewegungen</li>
        <li><strong>HDR:</strong> High Dynamic Range für realistischere Farben</li>
        <li><strong>FOV:</strong> ~110° Sichtfeld für immersives Erlebnis</li>
        <li><strong>Eye Tracking:</strong> Präzise Augenverfolgung für natürliche Interaktion</li>
      </ul>
      
      <h3>🎮 Controller:</h3>
      <ul>
        <li>PlayStation VR2 Sense Controller mit haptischem Feedback</li>
        <li>Adaptive Trigger für realistischere Interaktionen</li>
        <li>Finger-Touch-Erkennung für natürliche Gesten</li>
        <li>Präzises Inside-Out-Tracking ohne externe Kameras</li>
      </ul>
      
      <h3>🎯 Kompatibilität:</h3>
      <ul>
        <li>Exklusiv für PlayStation 5</li>
        <li>Erweiterte VR-Spielebibliothek</li>
        <li>Social Screen für Zuschauer</li>
      </ul>
    </div>
  `,
  
  'Xbox Series X': `
    <div class="description-section">
      <h2>🎮 Xbox Series X</h2>
      <p>Die leistungsstärkste Xbox-Konsole von Microsoft mit Next-Gen-Features und beeindruckender Performance.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Prozessor:</strong> Custom AMD Zen 2 CPU mit 8 Kernen bei 3.8 GHz</li>
        <li><strong>Grafik:</strong> Custom AMD RDNA 2 GPU mit 12 TFLOPS</li>
        <li><strong>Speicher:</strong> 1TB oder 2TB Custom NVMe SSD</li>
        <li><strong>Auflösung:</strong> Bis zu 4K bei 120 FPS, 8K-Unterstützung</li>
        <li><strong>Ray Tracing:</strong> Hardware-beschleunigtes Ray Tracing</li>
        <li><strong>Variable Rate Shading:</strong> Optimierte Grafikleistung</li>
      </ul>
      
      <h3>🎯 Features:</h3>
      <ul>
        <li>Quick Resume für mehrere Spiele gleichzeitig</li>
        <li>Smart Delivery für optimierte Spiele</li>
        <li>Backward Compatibility mit Tausenden von Xbox-Spielen</li>
        <li>Xbox Game Pass für Zugang zu Hunderten von Spielen</li>
        <li>Xbox Live für Online-Multiplayer</li>
      </ul>
      
      <h3>📦 Versionen:</h3>
      <ul>
        <li><strong>Standard:</strong> Mit Ultra HD Blu-ray Disc-Laufwerk</li>
        <li><strong>Digital Edition:</strong> Ohne Disc-Laufwerk, nur digitale Spiele</li>
        <li><strong>2TB Galaxy Black:</strong> Spezial-Edition mit erweitertem Speicher</li>
      </ul>
    </div>
  `,
  
  'Nintendo Switch': `
    <div class="description-section">
      <h2>🎮 Nintendo Switch</h2>
      <p>Die innovative Hybrid-Konsole von Nintendo, die zu Hause und unterwegs gespielt werden kann.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> 7-Zoll OLED-Touchscreen (Switch OLED) oder 6.2-Zoll LCD (Standard)</li>
        <li><strong>Modi:</strong> TV-Modus, Handheld-Modus, Tisch-Modus</li>
        <li><strong>Controller:</strong> Joy-Con mit HD Rumble und Motion Control</li>
        <li><strong>Speicher:</strong> 64GB intern (erweiterbar mit microSD)</li>
        <li><strong>Batterie:</strong> Bis zu 9 Stunden Spielzeit (je nach Spiel)</li>
      </ul>
      
      <h3>🎯 Features:</h3>
      <ul>
        <li>Exklusive Nintendo-Spiele (Mario, Zelda, Pokémon, etc.)</li>
        <li>Lokaler Multiplayer mit mehreren Joy-Con</li>
        <li>Online-Multiplayer mit Nintendo Switch Online</li>
        <li>Indie-Spiele und Retro-Klassiker</li>
        <li>Portable Konsole für unterwegs</li>
      </ul>
      
      <h3>📦 Versionen:</h3>
      <ul>
        <li><strong>Switch 2:</strong> Die neueste Generation mit verbesserter Leistung</li>
        <li><strong>Switch OLED:</strong> Größeres OLED-Display und verbesserte Audioqualität</li>
        <li><strong>Switch Lite:</strong> Kompakte, portable Version</li>
      </ul>
    </div>
  `,
};

async function main() {
  console.log('📝 Добавление описаний для консолей...\n');

  const consoles = await prisma.product.findMany({
    where: {
      category: {
        slug: 'consoles',
      },
    },
  });

  console.log(`Найдено консолей: ${consoles.length}\n`);

  for (const consoleProduct of consoles) {
    let description = '';

    // Определяем описание на основе модели
    if (consoleProduct.model.includes('VR2') || consoleProduct.model.includes('PlayStation VR')) {
      description = consoleDescriptions['PlayStation VR2'];
    } else if (consoleProduct.model.includes('PlayStation 5') || consoleProduct.model.includes('PS5')) {
      description = consoleDescriptions['PlayStation 5'];
    } else if (consoleProduct.model.includes('Xbox')) {
      description = consoleDescriptions['Xbox Series X'];
    } else if (consoleProduct.model.includes('Nintendo') || consoleProduct.model.includes('Switch')) {
      description = consoleDescriptions['Nintendo Switch'];
    }

    if (description) {
      await prisma.product.update({
        where: { id: consoleProduct.id },
        data: {
          baseDescription: description,
        },
      });

      console.log(`✅ ${consoleProduct.model}`);
      console.log(`   Описание добавлено`);
    } else {
      console.log(`ℹ️  ${consoleProduct.model}`);
      console.log(`   Описание не найдено`);
    }
    console.log('');
  }

  console.log('✅ Готово! Описания добавлены.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
