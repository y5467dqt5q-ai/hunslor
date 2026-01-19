import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Описания для каждого цвета AirPods Max 2
const max2Descriptions: Record<string, string> = {
  'Blue': 'Blue',
  'Midnight': 'Midnight',
  'Orange': 'Orange',
  'Purple': 'Purple',
  'Starlight': 'Starlight',
};

async function main() {
  console.log('🎧 Обновление описаний для всех цветов AirPods Max 2...\n');

  const max2Products = await prisma.product.findMany({
    where: {
      model: {
        contains: 'AirPods Max 2',
      },
      category: {
        slug: 'headphones',
      },
    },
    include: {
      variants: true,
    },
  });

  for (const product of max2Products) {
    const colorMatch = product.model.match(/\(([^)]+)\)/);
    const color = colorMatch ? colorMatch[1] : null;

    if (!color || !max2Descriptions[color]) {
      continue;
    }

    const description = `<h2>🎧 Apple AirPods Max 2 (${color})</h2>
<p>Die Apple AirPods Max 2 in ${color} bieten Premium-Klangqualität und aktive Geräuschunterdrückung in einem eleganten Over-Ear-Design.</p>

<h3>✨ Hauptmerkmale:</h3>
<ul>
<li><strong>Design:</strong> Over-Ear Kopfhörer mit Aluminium-Gehäuse in ${color}</li>
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
</ul>`;

    await prisma.product.update({
      where: { id: product.id },
      data: {
        baseDescription: description,
      },
    });

    console.log(`✅ Обновлено описание: ${product.model}`);
  }

  console.log(`\n✅ Готово!`);
}

main()
  .catch((e) => {
    console.error('❌ Ошибка:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
