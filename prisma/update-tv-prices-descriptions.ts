import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Карта цен и описаний для TV товаров
const tvData: Record<string, { price: number; description: string }> = {
  'Samsung 55 QE55Q7F': {
    price: 1199,
    description: `<h2>🎬 Samsung QE55Q7F 55 Zoll QLED 4K Smart TV</h2>
<p>Der Samsung QE55Q7F ist ein Premium 4K QLED Fernseher mit beeindruckender Bildqualität und modernsten Smart-Funktionen.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 55 Zoll (139,7 cm) QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie für lebendige Farben und hohen Kontrast</li>
<li><strong>HDR:</strong> HDR10+ Unterstützung für erweiterte Dynamik</li>
<li><strong>Smart TV:</strong> Tizen OS mit integriertem WLAN und Bluetooth</li>
<li><strong>Gaming:</strong> Game Mode mit niedriger Latenz für optimale Gaming-Erfahrung</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, CI+ Slot</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Digital Plus, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>Variable Refresh Rate (VRR)</li>
<li>Auto Game Mode</li>
<li>AMD FreeSync Premium Pro</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>Voice Control (Bixby, Alexa, Google Assistant)</li>
<li>Screen Mirroring</li>
<li>Multi-View Funktion</li>
</ul>`
  },
  'Samsung 55 QE55QN90D': {
    price: 1899,
    description: `<h2>🌟 Samsung QE55QN90D 55 Zoll Neo QLED 4K Smart TV</h2>
<p>Der Samsung QE55QN90D ist ein High-End Neo QLED Fernseher mit Mini-LED Backlight für außergewöhnliche Bildqualität.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 55 Zoll (139,7 cm) Neo QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Mini-LED Backlight mit Quantum Matrix Technology</li>
<li><strong>HDR:</strong> HDR10+ Adaptive, Dolby Vision IQ</li>
<li><strong>Helligkeit:</strong> Bis zu 2000 nits Peak Helligkeit</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor 4K</li>
<li><strong>Gaming:</strong> 144Hz Refresh Rate, Game Mode 2.0</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Object Tracking Sound+, Q-Symphony 3.0</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>144Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium Pro</li>
<li>NVIDIA G-SYNC kompatibel</li>
<li>Ultra-low Input Lag</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling 4K</li>
<li>Voice Control (Bixby, Alexa, Google Assistant)</li>
<li>Multi-View bis zu 4 Bildschirme</li>
</ul>`
  },
  'Samsung 65 QE65QN80F': {
    price: 1999,
    description: `<h2>🎬 Samsung QE65QN80F 65 Zoll Neo QLED 4K Smart TV</h2>
<p>Der Samsung QE65QN80F bietet ein großzügiges 65-Zoll Neo QLED Display mit beeindruckender Bildqualität.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 65 Zoll (164,1 cm) Neo QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie mit Mini-LED Backlight</li>
<li><strong>HDR:</strong> HDR10+ Adaptive für optimale Bildqualität</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor</li>
<li><strong>Gaming:</strong> 120Hz Refresh Rate, Game Mode</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Atmos, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium</li>
<li>Auto Game Mode</li>
<li>Motion Xcelerator Turbo+</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling</li>
<li>Voice Control</li>
<li>Multi-View Funktion</li>
</ul>`
  },
  'Samsung 65 QE65S85F': {
    price: 2499,
    description: `<h2>💎 Samsung QE65S85F 65 Zoll QD-OLED 4K Smart TV</h2>
<p>Der Samsung QE65S85F kombiniert QD-OLED Technologie mit Quantum Dot für perfekte Schwarzwerte und lebendige Farben.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 65 Zoll (164,1 cm) QD-OLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot OLED für perfekte Schwarzwerte und hohen Kontrast</li>
<li><strong>HDR:</strong> HDR10+ Adaptive, Dolby Vision IQ</li>
<li><strong>Helligkeit:</strong> Bis zu 1500 nits Peak Helligkeit</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor 4K</li>
<li><strong>Gaming:</strong> 144Hz Refresh Rate, Game Mode 2.0</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Object Tracking Sound+, Dolby Atmos</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>144Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium Pro</li>
<li>NVIDIA G-SYNC kompatibel</li>
<li>Ultra-low Input Lag</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling 4K</li>
<li>Voice Control</li>
<li>Multi-View bis zu 4 Bildschirme</li>
</ul>`
  },
  'Samsung 65 QE85Q7F': {
    price: 1799,
    description: `<h2>🎬 Samsung QE65Q7F 65 Zoll QLED 4K Smart TV</h2>
<p>Der Samsung QE65Q7F bietet ein großzügiges 65-Zoll QLED Display mit exzellenter Bildqualität.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 65 Zoll (164,1 cm) QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie für lebendige Farben</li>
<li><strong>HDR:</strong> HDR10+ Unterstützung</li>
<li><strong>Smart TV:</strong> Tizen OS mit integriertem WLAN</li>
<li><strong>Gaming:</strong> Game Mode mit niedriger Latenz</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, CI+ Slot</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Digital Plus, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>Variable Refresh Rate (VRR)</li>
<li>Auto Game Mode</li>
<li>AMD FreeSync Premium</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>Voice Control</li>
<li>Screen Mirroring</li>
<li>Multi-View Funktion</li>
</ul>`
  },
  'Samsung 75 QE75QN80F': {
    price: 2799,
    description: `<h2>🎬 Samsung QE75QN80F 75 Zoll Neo QLED 4K Smart TV</h2>
<p>Der Samsung QE75QN80F bietet ein beeindruckendes 75-Zoll Neo QLED Display für ein immersives Heimkino-Erlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 75 Zoll (189,2 cm) Neo QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie mit Mini-LED Backlight</li>
<li><strong>HDR:</strong> HDR10+ Adaptive</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor</li>
<li><strong>Gaming:</strong> 120Hz Refresh Rate, Game Mode</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Atmos, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium</li>
<li>Auto Game Mode</li>
<li>Motion Xcelerator Turbo+</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling</li>
<li>Voice Control</li>
<li>Multi-View Funktion</li>
</ul>`
  },
  'Samsung 75 QE85Q7F': {
    price: 2499,
    description: `<h2>🎬 Samsung QE75Q7F 75 Zoll QLED 4K Smart TV</h2>
<p>Der Samsung QE75Q7F bietet ein großzügiges 75-Zoll QLED Display für ein beeindruckendes Heimkino-Erlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 75 Zoll (189,2 cm) QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie für lebendige Farben</li>
<li><strong>HDR:</strong> HDR10+ Unterstützung</li>
<li><strong>Smart TV:</strong> Tizen OS mit integriertem WLAN</li>
<li><strong>Gaming:</strong> Game Mode mit niedriger Latenz</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, CI+ Slot</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Digital Plus, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>Variable Refresh Rate (VRR)</li>
<li>Auto Game Mode</li>
<li>AMD FreeSync Premium</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>Voice Control</li>
<li>Screen Mirroring</li>
<li>Multi-View Funktion</li>
</ul>`
  },
  'Samsung 77 QE65S85F': {
    price: 3999,
    description: `<h2>💎 Samsung QE77S85F 77 Zoll QD-OLED 4K Smart TV</h2>
<p>Der Samsung QE77S85F bietet ein beeindruckendes 77-Zoll QD-OLED Display für ein Premium Heimkino-Erlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 77 Zoll (195,6 cm) QD-OLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot OLED für perfekte Schwarzwerte</li>
<li><strong>HDR:</strong> HDR10+ Adaptive, Dolby Vision IQ</li>
<li><strong>Helligkeit:</strong> Bis zu 1500 nits Peak Helligkeit</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor 4K</li>
<li><strong>Gaming:</strong> 144Hz Refresh Rate, Game Mode 2.0</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Object Tracking Sound+, Dolby Atmos</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>144Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium Pro</li>
<li>NVIDIA G-SYNC kompatibel</li>
<li>Ultra-low Input Lag</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling 4K</li>
<li>Voice Control</li>
<li>Multi-View bis zu 4 Bildschirme</li>
</ul>`
  },
  'Samsung 83 QE65S85F': {
    price: 4999,
    description: `<h2>💎 Samsung QE83S85F 83 Zoll QD-OLED 4K Smart TV</h2>
<p>Der Samsung QE83S85F bietet ein monumentales 83-Zoll QD-OLED Display für ein ultimatives Heimkino-Erlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 83 Zoll (210,8 cm) QD-OLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot OLED für perfekte Schwarzwerte</li>
<li><strong>HDR:</strong> HDR10+ Adaptive, Dolby Vision IQ</li>
<li><strong>Helligkeit:</strong> Bis zu 1500 nits Peak Helligkeit</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor 4K</li>
<li><strong>Gaming:</strong> 144Hz Refresh Rate, Game Mode 2.0</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Object Tracking Sound+, Dolby Atmos</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>144Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium Pro</li>
<li>NVIDIA G-SYNC kompatibel</li>
<li>Ultra-low Input Lag</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling 4K</li>
<li>Voice Control</li>
<li>Multi-View bis zu 4 Bildschirme</li>
</ul>`
  },
  'Samsung 85 QE75QN80F': {
    price: 3999,
    description: `<h2>🎬 Samsung QE85QN80F 85 Zoll Neo QLED 4K Smart TV</h2>
<p>Der Samsung QE85QN80F bietet ein monumentales 85-Zoll Neo QLED Display für ein ultimatives Heimkino-Erlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 85 Zoll (215,9 cm) Neo QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie mit Mini-LED Backlight</li>
<li><strong>HDR:</strong> HDR10+ Adaptive</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor</li>
<li><strong>Gaming:</strong> 120Hz Refresh Rate, Game Mode</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Atmos, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium</li>
<li>Auto Game Mode</li>
<li>Motion Xcelerator Turbo+</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling</li>
<li>Voice Control</li>
<li>Multi-View Funktion</li>
</ul>`
  },
  'Samsung 85 QE85Q7F': {
    price: 3499,
    description: `<h2>🎬 Samsung QE85Q7F 85 Zoll QLED 4K Smart TV</h2>
<p>Der Samsung QE85Q7F bietet ein monumentales 85-Zoll QLED Display für ein ultimatives Heimkino-Erlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 85 Zoll (215,9 cm) QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie für lebendige Farben</li>
<li><strong>HDR:</strong> HDR10+ Unterstützung</li>
<li><strong>Smart TV:</strong> Tizen OS mit integriertem WLAN</li>
<li><strong>Gaming:</strong> Game Mode mit niedriger Latenz</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, CI+ Slot</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Digital Plus, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>Variable Refresh Rate (VRR)</li>
<li>Auto Game Mode</li>
<li>AMD FreeSync Premium</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>Voice Control</li>
<li>Screen Mirroring</li>
<li>Multi-View Funktion</li>
</ul>`
  },
  'Samsung 100 QE75QN80F': {
    price: 8999,
    description: `<h2>🎬 Samsung QE100QN80F 100 Zoll Neo QLED 4K Smart TV</h2>
<p>Der Samsung QE100QN80F ist ein monumentaler 100-Zoll Neo QLED Fernseher für ein ultimatives Premium Heimkino-Erlebnis.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Display:</strong> 100 Zoll (254,0 cm) Neo QLED 4K Ultra HD (3840 × 2160 Pixel)</li>
<li><strong>Technologie:</strong> Quantum Dot Technologie mit Mini-LED Backlight</li>
<li><strong>HDR:</strong> HDR10+ Adaptive</li>
<li><strong>Smart TV:</strong> Tizen OS mit Neural Quantum Processor</li>
<li><strong>Gaming:</strong> 120Hz Refresh Rate, Game Mode</li>
<li><strong>Anschlüsse:</strong> 4× HDMI 2.1, 2× USB, Ethernet, eARC</li>
<li><strong>Tuner:</strong> DVB-S2, DVB-C, DVB-T2 HD</li>
<li><strong>Sound:</strong> Dolby Atmos, Q-Symphony kompatibel</li>
</ul>

<h3>🎮 Gaming Features:</h3>
<ul>
<li>120Hz Variable Refresh Rate</li>
<li>AMD FreeSync Premium</li>
<li>Auto Game Mode</li>
<li>Motion Xcelerator Turbo+</li>
</ul>

<h3>📺 Smart Features:</h3>
<ul>
<li>Samsung TV Plus</li>
<li>AI Upscaling</li>
<li>Voice Control</li>
<li>Multi-View Funktion</li>
</ul>`
  },
};

async function main() {
  console.log('📺 Обновление цен и описаний для TV товаров...\n');

  let updated = 0;
  let notFound = 0;

  for (const [modelName, data] of Object.entries(tvData)) {
    try {
      const product = await prisma.product.findFirst({
        where: {
          model: {
            contains: modelName.split(' ').slice(1).join(' '), // Ищем по части модели без "Samsung"
          },
          category: {
            slug: 'tv',
          },
        },
      });

      if (!product) {
        console.log(`⚠️  Товар не найден: ${modelName}`);
        notFound++;
        continue;
      }

      await prisma.product.update({
        where: { id: product.id },
        data: {
          basePrice: data.price,
          baseDescription: data.description,
        },
      });

      console.log(`✅ Обновлен: ${product.model}`);
      console.log(`   Цена: ${data.price} €`);
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
