import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie-Richtlinie - HUNSLOR',
  description: 'Informationen zur Verwendung von Cookies auf HUNSLOR.',
};

export default function CookiesPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Cookie-Richtlinie</h1>
        
        <div className="max-w-4xl space-y-8 text-text-muted">
          <section>
            <p className="leading-relaxed mb-4">
              <strong className="text-white">Stand:</strong> Januar 2025
            </p>
            <p className="leading-relaxed">
              Diese Cookie-Richtlinie erklärt, wie HUNSLOR Cookies und ähnliche Technologien verwendet, wenn Sie 
              unsere Website besuchen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Was sind Cookies?</h2>
            <p className="leading-relaxed">
              Cookies sind kleine Textdateien, die auf Ihrem Endgerät (Computer, Tablet oder Mobilgerät) gespeichert 
              werden, wenn Sie eine Website besuchen. Cookies ermöglichen es der Website, sich an Ihre Aktionen und 
              Präferenzen zu erinnern, sodass Sie nicht bei jedem Besuch erneut Informationen eingeben müssen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Wie verwenden wir Cookies?</h2>
            <div className="space-y-4">
              <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
                <h3 className="text-xl font-semibold mb-2 text-white">Notwendige Cookies</h3>
                <p className="leading-relaxed mb-2">
                  Diese Cookies sind für das Funktionieren der Website unbedingt erforderlich. Sie ermöglichen 
                  grundlegende Funktionen wie Sicherheit, Netzwerkverwaltung und Zugänglichkeit.
                </p>
                <p className="text-sm">
                  <strong className="text-neon-green">Beispiele:</strong> Warenkorb-Funktion, Anmeldeinformationen, 
                  Sicherheitseinstellungen
                </p>
              </div>

              <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
                <h3 className="text-xl font-semibold mb-2 text-white">Funktionale Cookies</h3>
                <p className="leading-relaxed mb-2">
                  Diese Cookies ermöglichen es der Website, erweiterte Funktionalität und Personalisierung bereitzustellen. 
                  Sie können von uns oder von Drittanbietern gesetzt werden, deren Dienste wir auf unseren Seiten verwenden.
                </p>
                <p className="text-sm">
                  <strong className="text-neon-green">Beispiele:</strong> Spracheinstellungen, Regionseinstellungen, 
                  Präferenzen
                </p>
              </div>

              <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
                <h3 className="text-xl font-semibold mb-2 text-white">Analytische Cookies</h3>
                <p className="leading-relaxed mb-2">
                  Diese Cookies helfen uns zu verstehen, wie Besucher mit unserer Website interagieren, indem sie 
                  Informationen anonym sammeln und melden.
                </p>
                <p className="text-sm">
                  <strong className="text-neon-green">Beispiele:</strong> Seitenaufrufe, Verweildauer, Fehleranalyse
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Cookie-Verwaltung</h2>
            <p className="leading-relaxed mb-4">
              Sie haben die Möglichkeit, Cookies in Ihren Browser-Einstellungen zu verwalten. Die meisten Browser 
              akzeptieren Cookies automatisch, aber Sie können Ihre Browser-Einstellungen so ändern, dass Cookies 
              abgelehnt werden, wenn Sie dies wünschen.
            </p>
            <div className="bg-card-bg-start p-6 rounded-lg border border-card-border">
              <h3 className="text-xl font-semibold mb-2 text-white">Wie Sie Cookies deaktivieren können:</h3>
              <ul className="space-y-2 list-disc list-inside text-sm">
                <li><strong>Chrome:</strong> Einstellungen → Datenschutz und Sicherheit → Cookies</li>
                <li><strong>Firefox:</strong> Einstellungen → Datenschutz & Sicherheit → Cookies und Website-Daten</li>
                <li><strong>Safari:</strong> Einstellungen → Datenschutz → Cookies und Website-Daten</li>
                <li><strong>Edge:</strong> Einstellungen → Cookies und Websiteberechtigungen</li>
              </ul>
            </div>
            <p className="leading-relaxed mt-4 text-sm">
              <strong className="text-neon-green">Hinweis:</strong> Wenn Sie Cookies deaktivieren, funktionieren 
              möglicherweise nicht alle Funktionen unserer Website ordnungsgemäß.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Drittanbieter-Cookies</h2>
            <p className="leading-relaxed">
              Einige Cookies werden von Drittanbietern gesetzt, die auf unserer Website erscheinen. Wir haben keine 
              Kontrolle über diese Cookies. Bitte besuchen Sie die Websites dieser Drittanbieter, um mehr über deren 
              Cookie-Richtlinien zu erfahren.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Änderungen dieser Cookie-Richtlinie</h2>
            <p className="leading-relaxed">
              Wir können diese Cookie-Richtlinie von Zeit zu Zeit aktualisieren, um Änderungen in unseren Praktiken 
              oder aus anderen operativen, rechtlichen oder regulatorischen Gründen widerzuspiegeln. Wir empfehlen Ihnen, 
              diese Seite regelmäßig zu überprüfen, um über unsere Verwendung von Cookies informiert zu bleiben.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4 text-neon-green">Kontakt</h2>
            <p className="leading-relaxed">
              Wenn Sie Fragen zu unserer Verwendung von Cookies haben, kontaktieren Sie uns bitte:
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
