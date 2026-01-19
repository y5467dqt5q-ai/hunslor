import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Описания на немецком для Smart Home устройств
const smartHomeDescriptions: Record<string, string> = {
  'Apple HomePod mini': `
    <div class="description-section">
      <h2>🏠 Apple HomePod mini</h2>
      <p>Die kompakte Smart Speaker von Apple mit beeindruckendem Sound und Siri-Integration für Ihr intelligentes Zuhause.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Sound:</strong> Hochwertiger 360-Grad-Sound mit tiefen Bässen</li>
        <li><strong>Siri:</strong> Integrierter Sprachassistent für Steuerung und Fragen</li>
        <li><strong>HomeKit:</strong> Zentrale Steuerung für alle kompatiblen Smart Home Geräte</li>
        <li><strong>Multi-Room Audio:</strong> Synchronisierte Wiedergabe über mehrere HomePod mini</li>
        <li><strong>Intercom:</strong> Kommunikation zwischen allen HomePod Geräten im Haus</li>
        <li><strong>Privatsphäre:</strong> Lokale Verarbeitung, keine Cloud-Aufzeichnung</li>
      </ul>
      
      <h3>🎵 Audio-Features:</h3>
      <ul>
        <li>Automatische Raumkalibrierung für optimalen Sound</li>
        <li>Kompatibel mit Apple Music, Spotify und anderen Streaming-Diensten</li>
        <li>Stereo-Paarung mit einem zweiten HomePod mini möglich</li>
        <li>AirPlay 2 für drahtlose Übertragung</li>
      </ul>
      
      <h3>🏡 Smart Home Integration:</h3>
      <ul>
        <li>Steuerung von HomeKit-kompatiblen Geräten per Sprachbefehl</li>
        <li>Erstellung von Automatisierungen und Szenen</li>
        <li>Fernzugriff auf Smart Home Geräte von unterwegs</li>
        <li>Kompatibel mit Apple TV für erweiterte Funktionen</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Kompaktes, elegantes Design in verschiedenen Farben (Blau, Orange, Space Gray, Weiß, Gelb). Passt perfekt in jeden Raum und ist nur 8,4 cm hoch.</p>
      
      <h3>📱 Kompatibilität:</h3>
      <ul>
        <li>Erfordert iPhone, iPad oder iPod touch mit iOS 14.2 oder neuer</li>
        <li>Wi-Fi 802.11n für drahtlose Verbindung</li>
        <li>Thread-Unterstützung für erweiterte Smart Home Funktionen</li>
      </ul>
    </div>
  `,
};

async function main() {
  console.log('📝 Добавление описаний для Smart Home товаров...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smart-home',
      },
    },
  });

  console.log(`Найдено товаров: ${products.length}\n`);

  for (const product of products) {
    let description = '';

    // Определяем описание на основе модели
    if (product.model.includes('HomePod mini')) {
      description = smartHomeDescriptions['Apple HomePod mini'];
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
