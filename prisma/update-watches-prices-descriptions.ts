import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Официальные цены на часы (в евро, без завышения)
const watchPrices: Record<string, number> = {
  // Apple Watch Series 10
  'Apple Watch Series 10': 429, // GPS базовый
  'Apple Watch Series 10 GPS + LTE': 529, // GPS + LTE
  
  // Apple Watch Series 11
  'Apple Watch Series 11': 429, // GPS базовый
  
  // Apple Watch Ultra
  'Apple Watch Ultra 2': 899,
  'Apple Watch Ultra 3': 999,
  
  // Garmin Fenix 7
  'Garmin Fenix 7': 599,
  'Garmin Fenix 7S': 599,
  'Garmin Fenix 7X': 699,
  'Garmin Fenix 7 Sapphire': 799,
  'Garmin Fenix 7X Solar': 899,
  
  // Garmin Fenix 8
  'Garmin Fenix 8': 899,
  
  // Garmin Fenix E
  'Garmin Fenix E': 799,
};

// Описания на немецком
const watchDescriptions: Record<string, string> = {
  'Apple Watch Series 10': `
    <div class="description-section">
      <h2>🎯 Apple Watch Series 10</h2>
      <p>Die neueste Smartwatch von Apple mit verbesserter Leistung und innovativen Features.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> Always-On Retina Display mit verbesserter Helligkeit</li>
        <li><strong>Prozessor:</strong> S10 Chip für schnelle Performance</li>
        <li><strong>Gesundheit:</strong> Erweiterte Gesundheitsüberwachung mit EKG, Blutsauerstoff und mehr</li>
        <li><strong>Fitness:</strong> Umfassende Fitness-Tracking-Funktionen</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 50 Meter wasserdicht</li>
        <li><strong>Akku:</strong> Bis zu 18 Stunden Batterielaufzeit</li>
      </ul>
      
      <h3>📱 Konnektivität:</h3>
      <ul>
        <li>GPS für präzise Standortverfolgung</li>
        <li>Optional: GPS + Cellular für unabhängige Konnektivität</li>
        <li>Bluetooth und Wi-Fi</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Elegantes Design mit verschiedenen Gehäusematerialien: Aluminium, Edelstahl oder Titan. Verfügbar in verschiedenen Größen (42mm, 46mm) und Bandoptionen.</p>
    </div>
  `,
  
  'Apple Watch Series 11': `
    <div class="description-section">
      <h2>🚀 Apple Watch Series 11</h2>
      <p>Die neueste Generation der Apple Watch mit noch mehr Leistung und Features.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> Größeres, helleres Always-On Display</li>
        <li><strong>Prozessor:</strong> S11 Chip mit verbesserter Effizienz</li>
        <li><strong>Gesundheit:</strong> Erweiterte Gesundheitsfunktionen und Notfall-Erkennung</li>
        <li><strong>Fitness:</strong> Präzises Training-Tracking für alle Sportarten</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 50 Meter wasserdicht</li>
        <li><strong>Akku:</strong> Verbesserte Batterielaufzeit</li>
      </ul>
      
      <h3>📱 Konnektivität:</h3>
      <ul>
        <li>GPS für präzise Standortverfolgung</li>
        <li>Bluetooth und Wi-Fi</li>
      </ul>
      
      <h3>🎨 Design:</h3>
      <p>Modernes Design mit verschiedenen Farben und Bandoptionen für jeden Stil.</p>
    </div>
  `,
  
  'Apple Watch Ultra': `
    <div class="description-section">
      <h2>🏔️ Apple Watch Ultra</h2>
      <p>Die ultimative Smartwatch für Abenteurer und Sportler mit extremen Bedingungen.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> Größtes, hellstes Display aller Apple Watches</li>
        <li><strong>Gehäuse:</strong> Titan-Gehäuse für maximale Robustheit</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 100 Meter wasserdicht (EN13319)</li>
        <li><strong>Akku:</strong> Bis zu 36 Stunden normale Nutzung, bis zu 60 Stunden im Low Power Mode</li>
        <li><strong>Action Button:</strong> Programmierbare physische Taste für schnellen Zugriff</li>
        <li><strong>Dual-Frequency GPS:</strong> Präziseste Standortverfolgung</li>
      </ul>
      
      <h3>🏃 Spezial-Features:</h3>
      <ul>
        <li>Dive Computer App für Tauchen</li>
        <li>Erweiterte Höhenmessung</li>
        <li>Robustes Design für extreme Bedingungen</li>
        <li>Spezielle Bänder für verschiedene Aktivitäten</li>
      </ul>
      
      <h3>📱 Konnektivität:</h3>
      <ul>
        <li>GPS + Cellular für unabhängige Konnektivität</li>
        <li>Internationale Notfall-SOS-Funktion</li>
      </ul>
    </div>
  `,
  
  'Garmin Fenix': `
    <div class="description-section">
      <h2>🏃 Garmin Fenix</h2>
      <p>Premium-Multisport-Smartwatch für Athleten und Abenteurer.</p>
      
      <h3>✨ Hauptmerkmale:</h3>
      <ul>
        <li><strong>Display:</strong> Transreflektives MIP Display oder AMOLED (je nach Modell)</li>
        <li><strong>Gehäuse:</strong> Robustes Design aus Edelstahl, Titan oder DLC-Titan</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 100 Meter wasserdicht</li>
        <li><strong>Akku:</strong> Bis zu 18 Tage im Smartwatch-Modus, bis zu 57 Stunden im GPS-Modus</li>
        <li><strong>Solar:</strong> Solar-Ladefunktion bei ausgewählten Modellen</li>
        <li><strong>GPS:</strong> Multi-GNSS-Unterstützung für präzise Navigation</li>
      </ul>
      
      <h3>🏃 Sport-Features:</h3>
      <ul>
        <li>Über 30 vorinstallierte Sport-Apps</li>
        <li>Erweiterte Trainingsmetriken und -analysen</li>
        <li>Höhenmessung mit Barometer</li>
        <li>Kompasse und Karten-Navigation</li>
        <li>Pulse-Oximeter für Höhenakklimatisation</li>
      </ul>
      
      <h3>📱 Smart Features:</h3>
      <ul>
        <li>Smartphone-Benachrichtigungen</li>
        <li>Garmin Pay für kontaktloses Bezahlen</li>
        <li>Musik-Speicherung und -wiedergabe</li>
        <li>Wettervorhersagen und Warnungen</li>
      </ul>
      
      <h3>💎 Premium-Modelle:</h3>
      <ul>
        <li><strong>Sapphire:</strong> Kratzfeste Saphirglas-Linse</li>
        <li><strong>Solar:</strong> Solar-Ladefunktion für verlängerte Akkulaufzeit</li>
        <li><strong>AMOLED:</strong> Lebendige Farben und hoher Kontrast</li>
      </ul>
    </div>
  `,
};

async function main() {
  console.log('⌚ Обновление цен и описаний для часов...\n');

  const watches = await prisma.product.findMany({
    where: {
      category: {
        slug: 'smartwatches',
      },
    },
  });

  console.log(`Найдено часов: ${watches.length}\n`);

  for (const watch of watches) {
    let newPrice = 499; // Базовая цена по умолчанию
    let description = '';

    // Определяем цену на основе модели
    const model = watch.model;
    
    if (model.includes('Series 10') && model.includes('GPS + LTE')) {
      newPrice = 529;
      description = watchDescriptions['Apple Watch Series 10'];
    } else if (model.includes('Series 10')) {
      newPrice = 429;
      description = watchDescriptions['Apple Watch Series 10'];
    } else if (model.includes('Series 11')) {
      newPrice = 429;
      description = watchDescriptions['Apple Watch Series 11'];
    } else if (model.includes('Ultra 2')) {
      newPrice = 899;
      description = watchDescriptions['Apple Watch Ultra'];
    } else if (model.includes('Ultra 3')) {
      newPrice = 999;
      description = watchDescriptions['Apple Watch Ultra'];
    } else if (model.includes('Garmin Fenix 8')) {
      newPrice = 899;
      description = watchDescriptions['Garmin Fenix'];
    } else if (model.includes('Garmin Fenix 7X Solar')) {
      newPrice = 899;
      description = watchDescriptions['Garmin Fenix'];
    } else if (model.includes('Garmin Fenix 7 Sapphire')) {
      newPrice = 799;
      description = watchDescriptions['Garmin Fenix'];
    } else if (model.includes('Garmin Fenix 7X')) {
      newPrice = 699;
      description = watchDescriptions['Garmin Fenix'];
    } else if (model.includes('Garmin Fenix 7S')) {
      newPrice = 599;
      description = watchDescriptions['Garmin Fenix'];
    } else if (model.includes('Garmin Fenix 7')) {
      newPrice = 599;
      description = watchDescriptions['Garmin Fenix'];
    } else if (model.includes('Garmin Fenix E')) {
      newPrice = 799;
      description = watchDescriptions['Garmin Fenix'];
    }

    // Обновляем цену и описание
    await prisma.product.update({
      where: { id: watch.id },
      data: {
        basePrice: newPrice,
        baseDescription: description || null,
      },
    });

    console.log(`✅ ${watch.model}`);
    console.log(`   Цена: ${watch.basePrice} → ${newPrice} €`);
    if (description) {
      console.log(`   Описание: добавлено`);
    }
    console.log('');
  }

  console.log('✅ Готово! Цены и описания обновлены.');
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
