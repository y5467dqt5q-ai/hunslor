import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Описания на немецком языке для новых смартфонов
const descriptions: Record<string, string> = {
  'Google Pixel 10': `
    <div class="description-section">
      <h2>📱 Google Pixel 10</h2>
      <p>Das neueste Flaggschiff-Smartphone von Google mit KI-Features und herausragender Kamera.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.3" OLED, 120Hz, HDR10+</li>
        <li><strong>Prozessor:</strong> Google Tensor G5</li>
        <li><strong>RAM:</strong> 12GB</li>
        <li><strong>Speicher:</strong> 128GB / 256GB / 512GB</li>
        <li><strong>Kamera:</strong> 50MP Hauptkamera, 12MP Ultraweitwinkel, 10.5MP Frontkamera</li>
        <li><strong>Batterie:</strong> 4614 mAh, 30W Schnellladung, Wireless Charging</li>
        <li><strong>Betriebssystem:</strong> Android 15</li>
        <li><strong>Schutz:</strong> IP68 wasser- und staubdicht</li>
      </ul>
      
      <h3>📸 KI-Features:</h3>
      <ul>
        <li>Magic Eraser für automatische Objektentfernung</li>
        <li>Night Sight für bessere Nachtaufnahmen</li>
        <li>Real Tone für natürliche Hauttöne</li>
        <li>Live Translate für Echtzeit-Übersetzung</li>
      </ul>
    </div>
  `,
  
  'Xiaomi 15 Ultra': `
    <div class="description-section">
      <h2>📱 Xiaomi 15 Ultra</h2>
      <p>Das Premium-Flaggschiff von Xiaomi mit Leica-Kamera und leistungsstarkem Snapdragon-Prozessor.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.73" AMOLED, 120Hz, 3200x1440, HDR10+</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 4</li>
        <li><strong>RAM:</strong> 16GB LPDDR5X</li>
        <li><strong>Speicher:</strong> 256GB / 512GB / 1TB UFS 4.0</li>
        <li><strong>Kamera:</strong> 50MP Leica Hauptkamera, 50MP Ultraweitwinkel, 50MP Teleobjektiv, 32MP Frontkamera</li>
        <li><strong>Batterie:</strong> 5500 mAh, 120W HyperCharge, 50W Wireless Charging</li>
        <li><strong>Betriebssystem:</strong> MIUI 16 (Android 15)</li>
        <li><strong>Schutz:</strong> IP68 wasser- und staubdicht</li>
      </ul>
      
      <h3>📸 Leica-Kamera-System:</h3>
      <ul>
        <li>Leica Authentic Look für natürliche Farben</li>
        <li>Leica Vibrant Look für lebendige Farben</li>
        <li>Pro-Modus mit vollständiger manueller Kontrolle</li>
        <li>8K Video-Aufnahme</li>
      </ul>
    </div>
  `,
  
  'Xiaomi 15T Pro': `
    <div class="description-section">
      <h2>📱 Xiaomi 15T Pro</h2>
      <p>Das leistungsstarke Smartphone von Xiaomi mit schnellem Ladegerät und großem Display.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.67" AMOLED, 120Hz, HDR10+</li>
        <li><strong>Prozessor:</strong> Snapdragon 8 Gen 3</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Speicher:</strong> 256GB / 512GB UFS 4.0</li>
        <li><strong>Kamera:</strong> 50MP Hauptkamera, 8MP Ultraweitwinkel, 2MP Makro, 20MP Frontkamera</li>
        <li><strong>Batterie:</strong> 5000 mAh, 120W HyperCharge</li>
        <li><strong>Betriebssystem:</strong> MIUI 16 (Android 15)</li>
        <li><strong>Schutz:</strong> IP54 spritzwassergeschützt</li>
      </ul>
      
      <h3>⚡ Features:</h3>
      <ul>
        <li>120W HyperCharge - vollständig geladen in 19 Minuten</li>
        <li>120Hz AMOLED Display für flüssige Animationen</li>
        <li>Dual-Stereo-Lautsprecher</li>
        <li>5G-Konnektivität</li>
      </ul>
    </div>
  `,
  
  'Xiaomi Redmi Note 15 Pro+': `
    <div class="description-section">
      <h2>📱 Xiaomi Redmi Note 15 Pro+ 5G</h2>
      <p>Das erschwingliche Smartphone mit 5G-Konnektivität und leistungsstarker Kamera.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Display:</strong> 6.67" AMOLED, 120Hz, HDR10+</li>
        <li><strong>Prozessor:</strong> MediaTek Dimensity 8300 Ultra</li>
        <li><strong>RAM:</strong> 12GB LPDDR5X</li>
        <li><strong>Speicher:</strong> 256GB / 512GB UFS 3.1</li>
        <li><strong>Kamera:</strong> 200MP Hauptkamera, 8MP Ultraweitwinkel, 2MP Makro, 16MP Frontkamera</li>
        <li><strong>Batterie:</strong> 5000 mAh, 120W HyperCharge</li>
        <li><strong>Betriebssystem:</strong> MIUI 16 (Android 15)</li>
        <li><strong>Schutz:</strong> IP54 spritzwassergeschützt</li>
      </ul>
      
      <h3>📸 Kamera-Features:</h3>
      <ul>
        <li>200MP Hauptkamera für ultra-hohe Auflösung</li>
        <li>Night Mode für bessere Nachtaufnahmen</li>
        <li>Pro-Modus für manuelle Kontrolle</li>
        <li>4K Video-Aufnahme</li>
      </ul>
    </div>
  `,
};

async function main() {
  console.log('📝 Добавление описаний для новых смартфонов...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartphones',
      },
      OR: [
        { model: { contains: 'Google Pixel 10' } },
        { model: { contains: 'Xiaomi 15 Ultra' } },
        { model: { contains: 'Xiaomi 15T Pro' } },
        { model: { contains: 'Xiaomi Redmi Note 15 Pro+' } },
      ],
    },
  });

  console.log(`Найдено товаров: ${products.length}\n`);

  for (const product of products) {
    let description = '';

    if (product.model.includes('Google Pixel 10')) {
      description = descriptions['Google Pixel 10'];
    } else if (product.model.includes('Xiaomi 15 Ultra')) {
      description = descriptions['Xiaomi 15 Ultra'];
    } else if (product.model.includes('Xiaomi 15T Pro')) {
      description = descriptions['Xiaomi 15T Pro'];
    } else if (product.model.includes('Xiaomi Redmi Note 15 Pro+')) {
      description = descriptions['Xiaomi Redmi Note 15 Pro+'];
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
