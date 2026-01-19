import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Über uns - HUNSLOR',
  description: 'Erfahren Sie mehr über HUNSLOR - Ihren Premium Tech Store für Apple, Dyson und mehr.',
};

export default function UberUnsPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Über uns</h1>
        
        <div className="max-w-4xl space-y-6 text-text-muted">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Willkommen bei HUNSLOR</h2>
            <p className="leading-relaxed">
              HUNSLOR ist Ihr Premium Tech Store für hochwertige Elektronikprodukte. Wir spezialisieren uns auf 
              Apple-Produkte, Dyson-Geräte und weitere ausgewählte Technologie-Marken. Unser Ziel ist es, Ihnen 
              die neuesten und besten Technologieprodukte zu fairen Preisen anzubieten.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Unsere Mission</h2>
            <p className="leading-relaxed">
              Wir glauben daran, dass jeder Zugang zu hochwertiger Technologie haben sollte. Deshalb bieten wir 
              eine sorgfältig kuratierte Auswahl an Premium-Produkten, die Qualität, Innovation und Langlebigkeit 
              vereinen. Unser Team steht Ihnen mit Expertise und persönlichem Service zur Seite.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Warum HUNSLOR?</h2>
            <ul className="space-y-3 list-disc list-inside leading-relaxed">
              <li><strong className="text-neon-green">Authentische Produkte:</strong> Alle unsere Produkte sind 
              original und werden direkt von autorisierten Händlern bezogen.</li>
              <li><strong className="text-neon-green">Kompetente Beratung:</strong> Unser Team hilft Ihnen bei 
              der Auswahl des perfekten Produkts für Ihre Bedürfnisse.</li>
              <li><strong className="text-neon-green">Schneller Versand:</strong> Wir liefern schnell und 
              zuverlässig in ganz Deutschland.</li>
              <li><strong className="text-neon-green">Kundenservice:</strong> Ihr Zufriedenheit ist unser 
              oberstes Ziel. Wir stehen Ihnen bei Fragen und Problemen zur Verfügung.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Unser Sortiment</h2>
            <p className="leading-relaxed">
              Bei HUNSLOR finden Sie eine breite Palette an Produkten:
            </p>
            <ul className="space-y-2 list-disc list-inside leading-relaxed mt-4">
              <li>Apple iPhone, iPad, Mac und Zubehör</li>
              <li>Dyson Staubsauger, Haartrockner und Luftreiniger</li>
              <li>Smartwatches und Fitness-Tracker</li>
              <li>Laptops und Computer</li>
              <li>Kopfhörer und Audio-Geräte</li>
              <li>Smart Home Produkte</li>
              <li>Gaming-Konsolen und VR-Headsets</li>
              <li>Kamera-Equipment</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Kontakt</h2>
            <p className="leading-relaxed">
              Haben Sie Fragen oder Anregungen? Wir freuen uns auf Ihre Nachricht!
            </p>
            <p className="mt-4">
              <strong className="text-neon-green">Telefon:</strong> <a href="tel:+4915256788930" className="text-neon-green hover:text-neon-green-dark">+49 152 567 889 30</a><br />
              <strong className="text-neon-green">E-Mail:</strong> <a href="mailto:info@hunslor.de" className="text-neon-green hover:text-neon-green-dark">info@hunslor.de</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
