import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kontakt - HUNSLOR',
  description: 'Kontaktieren Sie HUNSLOR - Wir helfen Ihnen gerne weiter.',
};

export default function KontaktPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Kontakt</h1>
        
        <div className="max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-neon-green">Kontaktinformationen</h2>
              <div className="space-y-4 text-text-muted">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Telefon</h3>
                  <p>
                    <a href="tel:+4915256788930" className="text-neon-green hover:text-neon-green-dark transition-colors duration-250">
                      +49 152 567 889 30
                    </a>
                  </p>
                  <p className="text-sm mt-1">Mo-Fr: 9:00 - 18:00 Uhr</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">E-Mail</h3>
                  <p>
                    <a href="mailto:info@hunslor.de" className="text-neon-green hover:text-neon-green-dark transition-colors duration-250">
                      info@hunslor.de
                    </a>
                  </p>
                  <p className="text-sm mt-1">Wir antworten innerhalb von 24 Stunden</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Standort</h3>
                  <p>Deutschland</p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 text-neon-green">Öffnungszeiten</h2>
              <div className="space-y-2 text-text-muted">
                <p><strong className="text-white">Montag - Freitag:</strong> 9:00 - 18:00 Uhr</p>
                <p><strong className="text-white">Samstag:</strong> 10:00 - 16:00 Uhr</p>
                <p><strong className="text-white">Sonntag:</strong> Geschlossen</p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4 text-neon-green">Häufige Fragen</h2>
              <div className="space-y-4 text-text-muted">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Wie kann ich eine Bestellung aufgeben?</h3>
                  <p className="text-sm">Sie können direkt auf unserer Website bestellen. Wählen Sie einfach Ihre gewünschten Produkte aus und folgen Sie dem Bestellprozess.</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Wie lange dauert der Versand?</h3>
                  <p className="text-sm">Standardversand innerhalb Deutschlands beträgt 2-3 Werktage. Expressversand ist ebenfalls verfügbar.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Kann ich eine Bestellung stornieren?</h3>
                  <p className="text-sm">Ja, Sie haben 14 Tage Zeit, Ihre Bestellung zu stornieren. Bitte kontaktieren Sie uns per E-Mail oder Telefon.</p>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2 text-white">Bieten Sie Garantie auf die Produkte?</h3>
                  <p className="text-sm">Ja, alle Produkte werden mit der offiziellen Herstellergarantie geliefert. Zusätzlich bieten wir unseren eigenen Kundenservice.</p>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
