import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Описания на немецком для смартфонов
const smartphoneDescriptions: Record<string, string> = {
  'Samsung Galaxy S25': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S25</h2>
      <p>Das Flaggschiff-Smartphone von Samsung mit innovativen Features und leistungsstarker Hardware.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> 6.2" Dynamic AMOLED 2X Display mit 120Hz Adaptive Refresh Rate</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy</li>
        <li><strong>Kamera:</strong> Triple-Kamera-System mit 50MP Hauptkamera, 10MP Teleobjektiv, 12MP Ultraweitwinkel</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB interner Speicher</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 4000 mAh mit 25W Schnellladung und Wireless Charging</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Elegantes Design mit Gorilla Glass Victus 2 und IP68 Wasserschutz. Verfügbar in verschiedenen Farben.</p>
      
      <h3>📸 Kamera-Features:</h3>
      <ul>
        <li>Night Mode für brillante Aufnahmen bei Nacht</li>
        <li>8K Video-Aufnahme</li>
        <li>Pro Mode für professionelle Fotografie</li>
        <li>AI-unterstützte Bildoptimierung</li>
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
  
  'Samsung Galaxy S25+': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S25+</h2>
      <p>Die größere Version des Galaxy S25 mit erweitertem Display und längerer Akkulaufzeit.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> 6.7" Dynamic AMOLED 2X Display mit 120Hz Adaptive Refresh Rate</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy</li>
        <li><strong>Kamera:</strong> Triple-Kamera-System mit 50MP Hauptkamera, 10MP Teleobjektiv, 12MP Ultraweitwinkel</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB interner Speicher</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 4900 mAh mit 45W Schnellladung und Wireless Charging</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Premium-Design mit Gorilla Glass Victus 2 und IP68 Wasserschutz. Größeres Display für bessere Multimedia-Erlebnisse.</p>
      
      <h3>📸 Kamera-Features:</h3>
      <ul>
        <li>Night Mode für brillante Aufnahmen bei Nacht</li>
        <li>8K Video-Aufnahme</li>
        <li>Pro Mode für professionelle Fotografie</li>
        <li>AI-unterstützte Bildoptimierung</li>
      </ul>
    </div>
  `,
  
  'Samsung Galaxy S25 Ultra': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S25 Ultra</h2>
      <p>Das ultimative Flaggschiff von Samsung mit S Pen und professionellen Kamera-Features.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> 6.8" Dynamic AMOLED 2X Display mit 120Hz Adaptive Refresh Rate</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy</li>
        <li><strong>Kamera:</strong> Quad-Kamera-System mit 200MP Hauptkamera, 50MP Periskop-Teleobjektiv (5x Zoom), 10MP Teleobjektiv (3x Zoom), 12MP Ultraweitwinkel</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB interner Speicher</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 5000 mAh mit 45W Schnellladung und Wireless Charging</li>
        <li><strong>S Pen:</strong> Integrierter Stylus für Notizen und Zeichnungen</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Premium-Titanium-Gehäuse mit Gorilla Glass Armor und IP68 Wasserschutz. Elegant und robust.</p>
      
      <h3>📸 Professionelle Kamera:</h3>
      <ul>
        <li>200MP Hauptkamera für ultra-scharfe Fotos</li>
        <li>100x Space Zoom mit Periskop-Teleobjektiv</li>
        <li>8K Video-Aufnahme mit HDR10+</li>
        <li>Pro Mode mit manuellen Einstellungen</li>
        <li>Expert RAW für professionelle Fotografie</li>
      </ul>
      
      <h3>✍️ S Pen Features:</h3>
      <ul>
        <li>Präzise Notizen und Zeichnungen</li>
        <li>Air Actions für Fernsteuerung</li>
        <li>Live Messages und AR Doodle</li>
      </ul>
    </div>
  `,
  
  'Samsung Galaxy S24 Ultra': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy S24 Ultra</h2>
      <p>Das Flaggschiff der vorherigen Generation mit S Pen und professionellen Kamera-Features.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> 6.8" Dynamic AMOLED 2X Display mit 120Hz Adaptive Refresh Rate</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 3 für Galaxy</li>
        <li><strong>Kamera:</strong> Quad-Kamera-System mit 200MP Hauptkamera, 50MP Periskop-Teleobjektiv, 10MP Teleobjektiv, 12MP Ultraweitwinkel</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB interner Speicher</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 5000 mAh mit 45W Schnellladung</li>
        <li><strong>S Pen:</strong> Integrierter Stylus</li>
      </ul>
    </div>
  `,
  
  'Samsung Galaxy Flip 7': `
    <div class="description-section">
      <h2>📱 Samsung Galaxy Flip 7</h2>
      <p>Das faltbare Smartphone von Samsung mit kompaktem Design und innovativen Features.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> 6.7" Dynamic AMOLED 2X Hauptdisplay, 3.4" Cover Display</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4 für Galaxy</li>
        <li><strong>Kamera:</strong> Dual-Kamera-System mit 50MP Hauptkamera, 12MP Ultraweitwinkel</li>
        <li><strong>Speicher:</strong> 256GB oder 512GB interner Speicher</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Akku:</strong> 4000 mAh mit 25W Schnellladung und Wireless Charging</li>
      </ul>
      
      <h3>🎨 Faltbares Design:</h3>
      <p>Kompaktes Design, das sich zusammenfalten lässt. Perfekt für unterwegs und passt in jede Tasche.</p>
      
      <h3>📸 Flex Mode:</h3>
      <ul>
        <li>Selbstporträts ohne Stativ</li>
        <li>Handsfree-Videoanrufe</li>
        <li>Geteilter Bildschirm für Multitasking</li>
      </ul>
    </div>
  `,
};

async function main() {
  console.log('📝 Добавление описаний для смартфонов...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartphones',
      },
      brand: {
        not: 'Apple', // Не трогаем iPhone
      },
    },
  });

  console.log(`Найдено смартфонов (не iPhone): ${products.length}\n`);

  for (const product of products) {
    let description = '';

    // Определяем описание на основе модели
    if (product.model.includes('Galaxy S25 Ultra')) {
      description = smartphoneDescriptions['Samsung Galaxy S25 Ultra'];
    } else if (product.model.includes('Galaxy S25+')) {
      description = smartphoneDescriptions['Samsung Galaxy S25+'];
    } else if (product.model.includes('Galaxy S25')) {
      description = smartphoneDescriptions['Samsung Galaxy S25'];
    } else if (product.model.includes('Galaxy S24 Ultra')) {
      description = smartphoneDescriptions['Samsung Galaxy S24 Ultra'];
    } else if (product.model.includes('Galaxy Flip 7')) {
      description = smartphoneDescriptions['Samsung Galaxy Flip 7'];
    }

    if (description) {
      await prisma.product.update({
        where: { id: product.id },
        data: {
          baseDescription: description,
        },
      });

      console.log(`✅ ${product.model}`);
      console.log(`   Описание добавлено`);
    } else {
      console.log(`ℹ️  ${product.model}`);
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
