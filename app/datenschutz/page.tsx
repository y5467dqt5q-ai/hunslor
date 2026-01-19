import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Datenschutzerklärung - HUNSLOR',
  description: 'Datenschutzerklärung von HUNSLOR gemäß DSGVO.',
};

export default function DatenschutzPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Datenschutzerklärung</h1>
        
        <div className="max-w-4xl space-y-8 text-text-muted">
          <section>
            <p className="leading-relaxed mb-4">
              <strong className="text-white">Stand:</strong> Januar 2025
            </p>
            <p className="leading-relaxed">
              Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten 
              passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie 
              persönlich identifiziert werden können.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">1. Verantwortliche Stelle</h2>
            <p className="leading-relaxed">
              Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
            </p>
            <div className="bg-card-bg-start p-6 rounded-lg border border-card-border mt-4">
              <p className="text-white font-medium">HUNSLOR</p>
              <p>Deutschland</p>
              <p className="mt-2">
                <strong>E-Mail:</strong> <a href="mailto:info@hunslor.de" className="text-neon-green hover:text-neon-green-dark">info@hunslor.de</a><br />
                <strong>Telefon:</strong> <a href="tel:+4915256788930" className="text-neon-green hover:text-neon-green-dark">+49 152 567 889 30</a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">2. Datenerfassung auf dieser Website</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Kontaktformular</h3>
                <p className="leading-relaxed">
                  Wenn Sie uns per Kontaktformular Anfragen zukommen lassen, werden Ihre Angaben aus dem 
                  Anfrageformular inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der 
                  Anfrage und für den Fall von Anschlussfragen bei uns gespeichert.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Bestellungen</h3>
                <p className="leading-relaxed">
                  Bei Bestellungen erheben wir folgende Daten: Name, E-Mail-Adresse, Lieferadresse, Rechnungsadresse 
                  und Zahlungsinformationen. Diese Daten werden zur Abwicklung Ihrer Bestellung verwendet.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-2 text-white">Server-Log-Dateien</h3>
                <p className="leading-relaxed">
                  Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten 
                  Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp und 
                  Browserversion, verwendetes Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners, 
                  Uhrzeit der Serveranfrage, IP-Adresse.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">3. Ihre Rechte</h2>
            <p className="leading-relaxed mb-4">
              Sie haben jederzeit das Recht, unentgeltlich Auskunft über Herkunft, Empfänger und Zweck Ihrer 
              gespeicherten personenbezogenen Daten zu erhalten. Sie haben außerdem ein Recht, die Berichtigung, 
              Sperrung oder Löschung dieser Daten zu verlangen.
            </p>
            <ul className="space-y-2 list-disc list-inside">
              <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
              <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
              <li>Recht auf Löschung (Art. 17 DSGVO)</li>
              <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
              <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
              <li>Widerspruchsrecht (Art. 21 DSGVO)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">4. Cookies</h2>
            <p className="leading-relaxed">
              Diese Website nutzt Cookies. Cookies sind kleine Textdateien, die auf Ihrem Endgerät gespeichert werden. 
              Einige Cookies sind notwendig für den Betrieb der Website, andere helfen uns, die Website zu verbessern. 
              Weitere Informationen finden Sie auf unserer <a href="/cookies" className="text-neon-green hover:text-neon-green-dark">Cookie-Seite</a>.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">5. Kontakt bei Datenschutzfragen</h2>
            <p className="leading-relaxed">
              Wenn Sie Fragen zum Datenschutz haben, schreiben Sie uns bitte eine E-Mail oder wenden Sie sich an 
              die für Datenschutz zuständige Person in unserem Unternehmen:
            </p>
            <p className="mt-4">
              <strong className="text-neon-green">E-Mail:</strong> <a href="mailto:info@hunslor.de" className="text-neon-green hover:text-neon-green-dark">info@hunslor.de</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
