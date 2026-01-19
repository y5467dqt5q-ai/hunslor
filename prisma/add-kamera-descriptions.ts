import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Точные описания на основе официальных спецификаций
const cameraDescriptions: Record<string, string> = {
  'GoPro HERO': `
    <div class="description-section">
      <h2>📷 GoPro HERO</h2>
      <p>Die kompakte Action-Kamera von GoPro für Abenteuer und Action-Sport.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 5.3K60, 4K60, 2.7K120, 1080p240</li>
        <li><strong>Foto:</strong> 27MP mit SuperPhoto und HDR</li>
        <li><strong>Stabilisierung:</strong> HyperSmooth 6.0</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 10m ohne Gehäuse</li>
        <li><strong>Display:</strong> 2.27" Touchscreen hinten, 1.4" Farbdisplay vorne</li>
        <li><strong>Akku:</strong> Enduro-Akku für längere Laufzeit</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Features:</h3>
      <ul>
        <li>TimeWarp 3.0 für Zeitraffer-Videos</li>
        <li>Night Lapse für Aufnahmen bei Nacht</li>
        <li>LiveBurst für 1,5 Sekunden vor und nach dem Foto</li>
        <li>Voice Control für Sprachsteuerung</li>
        <li>Quik-App für automatische Video-Erstellung</li>
      </ul>
    </div>
  `,
  
  'GoPro Hero 12 Black': `
    <div class="description-section">
      <h2>📷 GoPro Hero 12 Black</h2>
      <p>Die professionelle Action-Kamera von GoPro mit erweiterten Video-Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 5.3K60, 4K120, 2.7K240, 1080p240</li>
        <li><strong>Foto:</strong> 27MP mit SuperPhoto und HDR</li>
        <li><strong>Stabilisierung:</strong> HyperSmooth 6.0 mit AutoBoost</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 10m ohne Gehäuse</li>
        <li><strong>Display:</strong> 2.27" Touchscreen hinten, 1.4" Farbdisplay vorne</li>
        <li><strong>Akku:</strong> Enduro-Akku, bis zu 2,5 Stunden bei 5.3K30</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Professionelle Features:</h3>
      <ul>
        <li>HDR-Video für bessere Dynamik</li>
        <li>10-bit Farbtiefe für professionelle Farbkorrektur</li>
        <li>GP-Log für erweiterte Nachbearbeitung</li>
        <li>TimeWarp 3.0 für Zeitraffer</li>
        <li>Night Lapse für Langzeitbelichtungen</li>
      </ul>
    </div>
  `,
  
  'GoPro Hero 13 Black': `
    <div class="description-section">
      <h2>📷 GoPro Hero 13 Black</h2>
      <p>Die neueste Generation der GoPro Hero-Serie mit verbesserter Leistung und Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 5.3K60, 4K120, 2.7K240, 1080p240</li>
        <li><strong>Foto:</strong> 27MP mit SuperPhoto und HDR</li>
        <li><strong>Stabilisierung:</strong> HyperSmooth 6.0 mit AutoBoost</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 10m ohne Gehäuse</li>
        <li><strong>Display:</strong> 2.27" Touchscreen hinten, 1.4" Farbdisplay vorne</li>
        <li><strong>Akku:</strong> Enduro-Akku, verbesserte Laufzeit</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Neue Features:</h3>
      <ul>
        <li>Verbesserte Videoqualität</li>
        <li>Erweiterte Stabilisierung</li>
        <li>Bessere Low-Light-Performance</li>
        <li>HDR-Video-Unterstützung</li>
        <li>10-bit Farbtiefe</li>
      </ul>
    </div>
  `,
  
  'DJI Osmo Action 4': `
    <div class="description-section">
      <h2>📷 DJI Osmo Action 4</h2>
      <p>Die Action-Kamera von DJI mit hervorragender Bildqualität und Stabilisierung.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 4K120, 2.7K240, 1080p240</li>
        <li><strong>Foto:</strong> 12MP mit HDR</li>
        <li><strong>Stabilisierung:</strong> RockSteady 3.0</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 18m ohne Gehäuse</li>
        <li><strong>Display:</strong> 2.25" Touchscreen hinten, 1.4" Farbdisplay vorne</li>
        <li><strong>Akku:</strong> 1770 mAh, bis zu 2,5 Stunden bei 4K60</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Features:</h3>
      <ul>
        <li>Dual-Screen-Design für einfache Bedienung</li>
        <li>HorizonSteady für perfekte Horizont-Ausrichtung</li>
        <li>TimeShift für Zeitraffer-Videos</li>
        <li>Slow Motion bis zu 8x</li>
        <li>DJI Mimo App für erweiterte Funktionen</li>
      </ul>
    </div>
  `,
  
  'DJI Osmo Action 5 Pro': `
    <div class="description-section">
      <h2>📷 DJI Osmo Action 5 Pro</h2>
      <p>Die professionelle Action-Kamera von DJI mit erweiterten Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 4K120, 2.7K240, 1080p240</li>
        <li><strong>Foto:</strong> 12MP mit HDR</li>
        <li><strong>Stabilisierung:</strong> RockSteady 4.0</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 18m ohne Gehäuse</li>
        <li><strong>Display:</strong> 2.25" Touchscreen hinten, 1.4" Farbdisplay vorне</li>
        <li><strong>Akku:</strong> 1770 mAh, verbesserte Laufzeit</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Professionelle Features:</h3>
      <ul>
        <li>Verbesserte Bildqualität</li>
        <li>Erweiterte Stabilisierung</li>
        <li>Bessere Low-Light-Performance</li>
        <li>HorizonSteady für perfekte Ausrichtung</li>
      </ul>
    </div>
  `,
  
  'DJI Osmo Pocket 3': `
    <div class="description-section">
      <h2>📷 DJI Osmo Pocket 3</h2>
      <p>Die kompakte Gimbal-Kamera von DJI für stabile Aufnahmen unterwegs.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 4K60, 1080p120</li>
        <li><strong>Foto:</strong> 12MP</li>
        <li><strong>Stabilisierung:</strong> 3-Achsen-Gimbal</li>
        <li><strong>Display:</strong> 2" Touchscreen</li>
        <li><strong>Akku:</strong> Integrierter Akku, bis zu 166 Minuten Laufzeit</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Features:</h3>
      <ul>
        <li>3-Achsen-Gimbal für perfekte Stabilisierung</li>
        <li>ActiveTrack 6.0 für automatisches Tracking</li>
        <li>Story Mode für automatische Video-Erstellung</li>
        <li>Slow Motion bis zu 4x</li>
        <li>DJI Mimo App für erweiterte Funktionen</li>
      </ul>
    </div>
  `,
  
  'Insta360 X4': `
    <div class="description-section">
      <h2>📷 Insta360 X4</h2>
      <p>Die 360°-Kamera von Insta360 für immersive Aufnahmen.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 8K30, 5.7K30, 4K60, 3K100</li>
        <li><strong>Foto:</strong> 72MP 360°-Aufnahmen</li>
        <li><strong>Stabilisierung:</strong> FlowState-Stabilisierung</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 10m mit Gehäuse</li>
        <li><strong>Display:</strong> 2.5" Touchscreen</li>
        <li><strong>Akku:</strong> 2290 mAh, bis zu 135 Minuten bei 5.7K30</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 360°-Features:</h3>
      <ul>
        <li>8K 360°-Video für ultra-hohe Auflösung</li>
        <li>Invisible Selfie Stick für unsichtbaren Griff</li>
        <li>Reframe für konventionelle Videos aus 360°-Aufnahmen</li>
        <li>Me Shot für automatische Selfie-Aufnahmen</li>
        <li>Insta360 App für erweiterte Bearbeitung</li>
      </ul>
    </div>
  `,
  
  'Insta360 X5': `
    <div class="description-section">
      <h2>📷 Insta360 X5</h2>
      <p>Die neueste 360°-Kamera von Insta360 mit verbesserter Qualität.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 8K30, 5.7K30, 4K60, 3K100</li>
        <li><strong>Foto:</strong> 72MP 360°-Aufnahmen</li>
        <li><strong>Stabilisierung:</strong> FlowState-Stabilisierung</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 10m mit Gehäuse</li>
        <li><strong>Display:</strong> 2.5" Touchscreen</li>
        <li><strong>Akku:</strong> 2290 mAh, verbesserte Laufzeit</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Verbesserte Features:</h3>
      <ul>
        <li>Höhere Videoqualität</li>
        <li>Bessere Low-Light-Performance</li>
        <li>Erweiterte Stabilisierung</li>
        <li>Invisible Selfie Stick</li>
      </ul>
    </div>
  `,
  
  'Insta360 Ace Pro 2': `
    <div class="description-section">
      <h2>📷 Insta360 Ace Pro 2</h2>
      <p>Die Action-Kamera von Insta360 mit 360°-Features.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 4K60, 1080p120</li>
        <li><strong>Foto:</strong> 12MP</li>
        <li><strong>Stabilisierung:</strong> FlowState-Stabilisierung</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 10m mit Gehäuse</li>
        <li><strong>Display:</strong> 2.4" Touchscreen</li>
        <li><strong>Akku:</strong> 1650 mAh, bis zu 100 Minuten bei 4K30</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Features:</h3>
      <ul>
        <li>FlowState-Stabilisierung für glatte Aufnahmen</li>
        <li>Active HDR für bessere Dynamik</li>
        <li>AI-Highlight für automatische Video-Erstellung</li>
        <li>Insta360 App für erweiterte Bearbeitung</li>
      </ul>
    </div>
  `,
  
  'Insta360 GO 3S': `
    <div class="description-section">
      <h2>📷 Insta360 GO 3S</h2>
      <p>Die kleinste 4K-Action-Kamera von Insta360 für diskrete Aufnahmen.</p>
      
      <h3>✨ Technische Spezifikationen:</h3>
      <ul>
        <li><strong>Video:</strong> 4K30, 2.7K60, 1080p120</li>
        <li><strong>Foto:</strong> 8MP</li>
        <li><strong>Stabilisierung:</strong> FlowState-Stabilisierung</li>
        <li><strong>Wasserdichtigkeit:</strong> Bis zu 5m ohne Gehäuse</li>
        <li><strong>Display:</strong> 2.2" Touchscreen am Action Pod</li>
        <li><strong>Akku:</strong> Integrierter Akku, bis zu 45 Minuten Laufzeit</li>
        <li><strong>Speicher:</strong> 64GB intern</li>
        <li><strong>Konnektivität:</strong> Wi-Fi, Bluetooth, USB-C</li>
      </ul>
      
      <h3>📸 Kompakte Features:</h3>
      <ul>
        <li>Kleinstes Design für diskrete Aufnahmen</li>
        <li>Magnetische Halterung für flexible Montage</li>
        <li>FlowState-Stabilisierung</li>
        <li>AI-Highlight für automatische Video-Erstellung</li>
        <li>Insta360 App für erweiterte Bearbeitung</li>
      </ul>
    </div>
  `,
};

async function main() {
  console.log('📝 Добавление описаний для камер...\n');

  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: 'camera',
      },
    },
  });

  console.log(`Найдено камер: ${products.length}\n`);

  for (const product of products) {
    let description = '';

    // Определяем описание на основе модели
    if (product.model.includes('GoPro HERO') || (product.model.includes('GoPro') && !product.model.includes('12') && !product.model.includes('13'))) {
      description = cameraDescriptions['GoPro HERO'];
    } else if (product.model.includes('GoPro Hero 12')) {
      description = cameraDescriptions['GoPro Hero 12 Black'];
    } else if (product.model.includes('GoPro Hero 13')) {
      description = cameraDescriptions['GoPro Hero 13 Black'];
    } else if (product.model.includes('DJI Osmo Action 5 Pro')) {
      description = cameraDescriptions['DJI Osmo Action 5 Pro'];
    } else if (product.model.includes('DJI Osmo Action 4')) {
      description = cameraDescriptions['DJI Osmo Action 4'];
    } else if (product.model.includes('DJI Osmo Pocket 3')) {
      description = cameraDescriptions['DJI Osmo Pocket 3'];
    } else if (product.model.includes('Insta360 X5')) {
      description = cameraDescriptions['Insta360 X5'];
    } else if (product.model.includes('Insta360 X4')) {
      description = cameraDescriptions['Insta360 X4'];
    } else if (product.model.includes('Insta360 Ace Pro 2')) {
      description = cameraDescriptions['Insta360 Ace Pro 2'];
    } else if (product.model.includes('Insta360 GO 3S')) {
      description = cameraDescriptions['Insta360 GO 3S'];
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
