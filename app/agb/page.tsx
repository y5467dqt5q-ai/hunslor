import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Allgemeine Geschäftsbedingungen - HUNSLOR',
  description: 'Allgemeine Geschäftsbedingungen (AGB) von HUNSLOR.',
};

export default function AGBPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Allgemeine Geschäftsbedingungen</h1>
        
        <div className="max-w-4xl space-y-8 text-text-muted">
          <section>
            <p className="leading-relaxed mb-4">
              <strong className="text-white">Stand:</strong> Januar 2025
            </p>
            <p className="leading-relaxed">
              Die nachfolgenden Allgemeinen Geschäftsbedingungen (AGB) regeln das Vertragsverhältnis zwischen 
              HUNSLOR (nachfolgend "Wir" oder "Verkäufer") und Ihnen als Kunde (nachfolgend "Sie" oder "Kunde").
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">1. Geltungsbereich</h2>
            <p className="leading-relaxed">
              Diese AGB gelten für alle Bestellungen über unseren Online-Shop. Abweichende, entgegenstehende oder 
              ergänzende AGB des Kunden werden nicht Vertragsbestandteil, es sei denn, ihrer Geltung wird ausdrücklich 
              schriftlich zugestimmt.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">2. Vertragsschluss</h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Mit der Bestellung geben Sie eine verbindliche Offerte auf den Kauf der Waren ab. Wir werden Ihnen 
                unverzüglich eine Bestätigungs-E-Mail zusenden, in der Ihre Bestellung nochmals aufgeführt wird 
                (Bestellbestätigung). Diese E-Mail stellt noch keine Annahme Ihres Angebots dar, sondern bestätigt 
                nur, dass wir Ihre Bestellung erhalten haben.
              </p>
              <p className="leading-relaxed">
                Der Kaufvertrag kommt durch unsere ausdrückliche Annahme Ihres Angebots zustande, die wir durch 
                Versand der Ware oder durch eine ausdrückliche Annahmeerklärung erklären.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">3. Preise und Zahlung</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Preise</h3>
                <p className="leading-relaxed">
                  Alle Preise verstehen sich in Euro (€) inklusive der gesetzlichen Mehrwertsteuer, zuzüglich 
                  Versandkosten. Die Versandkosten werden Ihnen im Bestellprozess mitgeteilt.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Zahlungsarten</h3>
                <p className="leading-relaxed">
                  Wir akzeptieren folgende Zahlungsarten:
                </p>
                <ul className="space-y-2 list-disc list-inside mt-2">
                  <li>Vorkasse</li>
                  <li>PayPal</li>
                  <li>Kreditkarte (Visa, Mastercard)</li>
                  <li>SEPA-Lastschrift</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">4. Lieferung</h2>
            <p className="leading-relaxed">
              Die Lieferung erfolgt innerhalb Deutschlands. Die Lieferzeit beträgt bei Standardversand 2-3 Werktage, 
              bei Expressversand 1 Werktag. Weitere Informationen finden Sie auf unserer <a href="/versand" className="text-neon-green hover:text-neon-green-dark">Versand-Seite</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">5. Widerrufsrecht</h2>
            <div className="space-y-4">
              <p className="leading-relaxed">
                Sie haben das Recht, binnen vierzehn Tagen ohne Angabe von Gründen diesen Vertrag zu widerrufen. 
                Die Widerrufsfrist beträgt vierzehn Tage ab dem Tag, an dem Sie oder ein von Ihnen benannter Dritter, 
                der nicht der Beförderer ist, die Waren in Besitz genommen haben bzw. hat.
              </p>
              <p className="leading-relaxed">
                Um Ihr Widerrufsrecht auszuüben, müssen Sie uns (HUNSLOR, E-Mail: info@hunslor.de, Telefon: 
                +49 152 567 889 30) mittels einer eindeutigen Erklärung (z.B. ein mit der Post versandter Brief, 
                Telefax oder E-Mail) über Ihren Entschluss, diesen Vertrag zu widerrufen, informieren.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">6. Gewährleistung</h2>
            <p className="leading-relaxed">
              Für Mängel an der Ware haften wir nach Maßgabe der gesetzlichen Bestimmungen. Die Gewährleistungsfrist 
              beträgt 24 Monate ab Lieferung der Ware. Die Gewährleistung erstreckt sich auf die Herstellergarantie, 
              soweit diese über die gesetzliche Gewährleistung hinausgeht.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">7. Haftung</h2>
            <p className="leading-relaxed">
              Wir haften unbeschränkt für Vorsatz und grobe Fahrlässigkeit sowie nach Maßgabe des Produkthaftungsgesetzes. 
              Bei leichter Fahrlässigkeit haften wir nur bei Verletzung einer wesentlichen Vertragspflicht, deren Erfüllung 
              die ordnungsgemäße Durchführung des Vertrages überhaupt erst ermöglicht.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">8. Datenschutz</h2>
            <p className="leading-relaxed">
              Der Schutz Ihrer personenbezogenen Daten ist uns wichtig. Informationen zum Umgang mit Ihren Daten 
              finden Sie in unserer <a href="/datenschutz" className="text-neon-green hover:text-neon-green-dark">Datenschutzerklärung</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">9. Schlussbestimmungen</h2>
            <p className="leading-relaxed">
              Es gilt deutsches Recht unter Ausschluss des UN-Kaufrechts. Gerichtsstand für alle Streitigkeiten aus 
              diesem Vertrag ist, soweit der Kunde Kaufmann ist, unser Geschäftssitz.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
