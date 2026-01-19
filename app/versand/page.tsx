import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Versand & Lieferung - HUNSLOR',
  description: 'Informationen zu Versand, Lieferung und Rücksendung bei HUNSLOR.',
};

export default function VersandPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Versand & Lieferung</h1>
        
        <div className="max-w-4xl space-y-8 text-text-muted">
          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Versandoptionen</h2>
            <div className="space-y-4">
              <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
                <h3 className="text-xl font-semibold mb-2 text-white">Standardversand</h3>
                <p className="mb-2"><strong className="text-neon-green">Kosten:</strong> 4,90 €</p>
                <p className="mb-2"><strong className="text-neon-green">Lieferzeit:</strong> 2-3 Werktage</p>
                <p className="text-sm">Ihre Bestellung wird per DHL oder DPD versendet. Sie erhalten eine Tracking-Nummer per E-Mail.</p>
              </div>

              <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
                <h3 className="text-xl font-semibold mb-2 text-white">Expressversand</h3>
                <p className="mb-2"><strong className="text-neon-green">Kosten:</strong> 9,90 €</p>
                <p className="mb-2"><strong className="text-neon-green">Lieferzeit:</strong> 1 Werktag</p>
                <p className="text-sm">Ihre Bestellung wird am nächsten Werktag zugestellt (bei Bestellung bis 14:00 Uhr).</p>
              </div>

              <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
                <h3 className="text-xl font-semibold mb-2 text-white">Kostenloser Versand</h3>
                <p className="mb-2"><strong className="text-neon-green">Ab Bestellwert:</strong> 100 €</p>
                <p className="mb-2"><strong className="text-neon-green">Lieferzeit:</strong> 2-3 Werktage</p>
                <p className="text-sm">Bei Bestellungen ab 100 € versenden wir kostenlos innerhalb Deutschlands.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Liefergebiete</h2>
            <p className="leading-relaxed mb-4">
              Wir liefern aktuell innerhalb Deutschlands. Die Lieferung erfolgt an die von Ihnen angegebene Adresse.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Deutschland (alle Bundesländer)</li>
              <li>Lieferung an Packstationen möglich</li>
              <li>Lieferung an Postfilialen möglich</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Lieferstatus verfolgen</h2>
            <p className="leading-relaxed">
              Sobald Ihre Bestellung versendet wurde, erhalten Sie eine E-Mail mit der Tracking-Nummer. 
              Sie können den Status Ihrer Sendung jederzeit online verfolgen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Rücksendung</h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Sie haben das Recht, Ihre Bestellung innerhalb von 14 Tagen ohne Angabe von Gründen zu widerrufen. 
                Die Frist beginnt mit dem Tag, an dem Sie die Ware erhalten haben.
              </p>
              
              <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
                <h3 className="text-xl font-semibold mb-2 text-white">Rücksendebedingungen</h3>
                <ul className="space-y-2 list-disc list-inside text-sm">
                  <li>Die Ware muss in originalem Zustand und Verpackung zurückgesendet werden</li>
                  <li>Alle Zubehörteile und Dokumente müssen enthalten sein</li>
                  <li>Die Rücksendekosten trägt der Kunde, es sei denn, die Ware ist fehlerhaft</li>
                  <li>Bitte kontaktieren Sie uns vor der Rücksendung per E-Mail</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Fragen zum Versand?</h2>
            <p className="leading-relaxed">
              Bei Fragen zu Versand, Lieferung oder Rücksendung kontaktieren Sie uns gerne:
            </p>
            <p className="mt-4">
              <strong className="text-neon-green">E-Mail:</strong> <a href="mailto:info@hunslor.de" className="text-neon-green hover:text-neon-green-dark">info@hunslor.de</a><br />
              <strong className="text-neon-green">Telefon:</strong> <a href="tel:+4915256788930" className="text-neon-green hover:text-neon-green-dark">+49 152 567 889 30</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
