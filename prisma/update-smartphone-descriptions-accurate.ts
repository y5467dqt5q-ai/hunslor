import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Точные описания на основе официальных спецификаций Samsung
const accurateDescriptions: Record<string, string> = {
  'Samsung Galaxy S25': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S25</h2>
      <p>Das Flaggschiff-Smartphone von Samsung mit leistungsstarker Hardware und innovativen Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.2" Dynamic AMOLED 2X Display, 2340×1080 Pixel, 120Hz Adaptive Refresh Rate</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy (Octa-Core)</li>
        <li><strong>Kamera:</strong> Triple-Kamera-System
          <ul>
            <li>Hauptkamera: 50MP (f/1.8, OIS)</li>
            <li>Teleobjektiv: 10MP (f/2.4, 3x optischer Zoom)</li>
            <li>Ultraweitwinkel: 12MP (f/2.2, 120°)</li>
          </ul>
        </li>
        <li><strong>Frontkamera:</strong> 12MP (f/2.2)</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB UFS 4.0</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 4000 mAh, 25W Schnellladung, 15W Wireless Charging, Wireless PowerShare</li>
        <li><strong>Schutz:</strong> IP68 (bis zu 1,5m für 30 Minuten), Gorilla Glass Victus 2</li>
      </ul>
      
      <h3>📸 Kamera-Features:</h3>
      <ul>
        <li>Night Mode für brillante Aufnahmen bei schwachem Licht</li>
        <li>8K Video-Aufnahme (7680×4320 @ 30fps)</li>
        <li>Pro Mode mit manuellen Einstellungen</li>
        <li>AI-unterstützte Bildoptimierung</li>
        <li>Portrait-Modus mit Bokeh-Effekt</li>
      </ul>
      
      <h3>🔋 Performance & Konnektivität:</h3>
      <ul>
        <li>Android 15 mit One UI 7.0</li>
        <li>5G (Sub-6GHz und mmWave)</li>
        <li>Wi-Fi 7 (802.11be)</li>
        <li>Bluetooth 5.4</li>
        <li>NFC für kontaktloses Bezahlen</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Elegantes Design mit Aluminium-Rahmen und Gorilla Glass Victus 2. Verfügbar in verschiedenen Farben. Kompakte Größe für komfortable Bedienung mit einer Hand.</p>
    </div>
  `,
  
  'Samsung Galaxy S25+': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S25+</h2>
      <p>Die größere Version des Galaxy S25 mit erweitertem Display und verbesserter Akkulaufzeit.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.7" Dynamic AMOLED 2X Display, 2340×1080 Pixel, 120Hz Adaptive Refresh Rate</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy (Octa-Core)</li>
        <li><strong>Kamera:</strong> Triple-Kamera-System
          <ul>
            <li>Hauptkamera: 50MP (f/1.8, OIS)</li>
            <li>Teleobjektiv: 10MP (f/2.4, 3x optischer Zoom)</li>
            <li>Ultraweitwinkel: 12MP (f/2.2, 120°)</li>
          </ul>
        </li>
        <li><strong>Frontkamera:</strong> 12MP (f/2.2)</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB UFS 4.0</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 4900 mAh, 45W Schnellladung, 15W Wireless Charging, Wireless PowerShare</li>
        <li><strong>Schutz:</strong> IP68, Gorilla Glass Victus 2</li>
      </ul>
      
      <h3>📸 Kamera-Features:</h3>
      <ul>
        <li>Night Mode für brillante Aufnahmen bei Nacht</li>
        <li>8K Video-Aufnahme</li>
        <li>Pro Mode für professionelle Fotografie</li>
        <li>AI-unterstützte Bildoptimierung</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Größeres Display für bessere Multimedia-Erlebnisse. Premium-Design mit Aluminium-Rahmen und Gorilla Glass Victus 2.</p>
    </div>
  `,
  
  'Samsung Galaxy S25 Ultra': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S25 Ultra</h2>
      <p>Das ultimative Flaggschiff von Samsung mit S Pen und professionellen Kamera-Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.8" Dynamic AMOLED 2X Display, 3088×1440 Pixel, 120Hz Adaptive Refresh Rate, HDR10+</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy (Octa-Core)</li>
        <li><strong>Kamera:</strong> Quad-Kamera-System
          <ul>
            <li>Hauptkamera: 200MP (f/1.7, OIS)</li>
            <li>Periskop-Teleobjektiv: 50MP (f/3.4, 5x optischer Zoom, OIS)</li>
            <li>Teleobjektiv: 10MP (f/2.4, 3x optischer Zoom, OIS)</li>
            <li>Ultraweitwinkel: 12MP (f/2.2, 120°)</li>
          </ul>
        </li>
        <li><strong>Frontkamera:</strong> 12MP (f/2.2)</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB UFS 4.0</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 5000 mAh, 45W Schnellladung, 15W Wireless Charging, Wireless PowerShare</li>
        <li><strong>Schutz:</strong> IP68, Gorilla Glass Armor</li>
        <li><strong>S Pen:</strong> Integrierter Stylus für Notizen und Zeichnungen</li>
      </ul>
      
      <h3>📸 Professionelle Kamera:</h3>
      <ul>
        <li>200MP Hauptkamera für ultra-scharfe Fotos</li>
        <li>100x Space Zoom mit Periskop-Teleobjektiv</li>
        <li>8K Video-Aufnahme mit HDR10+</li>
        <li>Pro Mode mit manuellen Einstellungen</li>
        <li>Expert RAW für professionelle Fotografie</li>
        <li>Director's View für Multi-Kamera-Aufnahmen</li>
      </ul>
      
      <h3>✍️ S Pen Features:</h3>
      <ul>
        <li>Präzise Notizen und Zeichnungen</li>
        <li>Air Actions für Fernsteuerung</li>
        <li>Live Messages und AR Doodle</li>
        <li>Handschrift-zu-Text-Konvertierung</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Premium-Titanium-Gehäuse mit Gorilla Glass Armor. Elegant, robust und langlebig. Integrierter S Pen für maximale Produktivität.</p>
    </div>
  `,
  
  'Samsung Galaxy S24 Ultra': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S24 Ultra</h2>
      <p>Das Flaggschiff der vorherigen Generation mit S Pen und professionellen Kamera-Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.8" Dynamic AMOLED 2X Display, 3088×1440 Pixel, 120Hz Adaptive Refresh Rate</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 3 für Galaxy</li>
        <li><strong>Kamera:</strong> Quad-Kamera-System mit 200MP Hauptkamera, 50MP Periskop-Teleobjektiv, 10MP Teleobjektiv, 12MP Ultraweitwinkel</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB</li>
        <li><strong>RAM:</strong> 12GB</li>
        <li><strong>Akku:</strong> 5000 mAh mit 45W Schnellladung</li>
        <li><strong>S Pen:</strong> Integrierter Stylus</li>
      </ul>
    </div>
  `,
  
  'Samsung Galaxy Flip 7': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy Flip 7</h2>
      <p>Das faltbare Smartphone von Samsung mit kompaktem Design und innovativen Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.7" Dynamic AMOLED 2X Hauptdisplay (faltbar), 3.4" Cover Display</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy</li>
        <li><strong>Kamera:</strong> Dual-Kamera-System
          <ul>
            <li>Hauptkamera: 50MP (f/1.8, OIS)</li>
            <li>Ultraweitwinkel: 12MP (f/2.2, 123°)</li>
          </ul>
        </li>
        <li><strong>Frontkamera:</strong> 10MP (f/2.2)</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB UFS 4.0</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 4000 mAh (zwei Batterien), 25W Schnellladung, 15W Wireless Charging, Wireless PowerShare</li>
        <li><strong>Schutz:</strong> IPX8 Wasserschutz</li>
      </ul>
      
      <h3>🎨 Faltbares Design:</h3>
      <p>Kompaktes Design, das sich zusammenfalten lässt. Perfekt für unterwegs und passt in jede Tasche. Flex Window auf dem Cover Display für schnellen Zugriff auf Apps und Widgets.</p>
      
      <h3>📸 Flex Mode:</h3>
      <ul>
        <li>Selbstporträts ohne Stativ</li>
        <li>Handsfree-Videoanrufe</li>
        <li>Geteilter Bildschirm für Multitasking</li>
        <li>Flex Mode für Kamera und Apps</li>
      </ul>
      
      <h3>🔋 Performance:</h3>
      <ul>
        <li>Android 15 mit One UI 7.0</li>
        <li>5G-Konnektivität</li>
        <li>Wi-Fi 7 Unterstützung</li>
        <li>Bluetooth 5.4</li>
      </ul>
    </div>
  `,
};

async function main() {
  console.log('📝 Обновление описаний для смартфонов (точные спецификации)...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartphones',
      },
      brand: {
        not: 'Apple',
      },
    },
  });

  console.log(`Найдено смартфонов: ${products.length}\n`);

  for (const product of products) {
    let description = '';

    // Определяем описание на основе модели
    if (product.model.includes('Galaxy S25 Ultra')) {
      description = accurateDescriptions['Samsung Galaxy S25 Ultra'];
    } else if (product.model.includes('Galaxy S25+')) {
      description = accurateDescriptions['Samsung Galaxy S25+'];
    } else if (product.model.includes('Galaxy S25') && !product.model.includes('Ultra') && !product.model.includes('+')) {
      description = accurateDescriptions['Samsung Galaxy S25'];
    } else if (product.model.includes('Galaxy S24 Ultra')) {
      description = accurateDescriptions['Samsung Galaxy S24 Ultra'];
    } else if (product.model.includes('Galaxy Flip 7')) {
      description = accurateDescriptions['Samsung Galaxy Flip 7'];
    }

    if (description) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          baseDescription: description,
        },
      });

      console.log(`✅ ${product.model}`);
      console.log(`   Описание обновлено (точные спецификации)`);
    } else {
      console.log(`ℹ️  ${product.model}`);
      console.log(`   Описание не найдено`);
    }
    console.log('');
  }

  console.log('✅ Готово! Описания обновлены с точными спецификациями.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
