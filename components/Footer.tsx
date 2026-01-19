import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="border-t border-card-border bg-gradient-to-t from-card-bg-start/80 to-card-bg-end/60 backdrop-blur-md mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 text-neon-green">HUNSLOR</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Premium Tech Store für Apple, Dyson und mehr. Qualität und Service stehen bei uns an erster Stelle.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Informationen</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/ueber-uns" className="hover:text-neon-green transition-colors duration-250 inline-block">
                  Über uns
                </Link>
              </li>
              <li>
                <Link href="/kontakt" className="hover:text-neon-green transition-colors duration-250 inline-block">
                  Kontakt
                </Link>
              </li>
              <li>
                <Link href="/versand" className="hover:text-neon-green transition-colors duration-250 inline-block">
                  Versand
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Rechtliches</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li>
                <Link href="/datenschutz" className="hover:text-neon-green transition-colors duration-250 inline-block">
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link href="/agb" className="hover:text-neon-green transition-colors duration-250 inline-block">
                  AGB
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="hover:text-neon-green transition-colors duration-250 inline-block">
                  Cookies
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Kontakt</h3>
            <p className="text-text-muted text-sm leading-relaxed">
              Deutschland<br />
              <a href="tel:+4915256788930" className="text-neon-green hover:text-neon-green-dark transition-colors duration-250">
                +49 152 567 889 30
              </a>
              <br />
              <a href="mailto:info@hunslor.de" className="text-neon-green hover:text-neon-green-dark transition-colors duration-250">
                info@hunslor.de
              </a>
            </p>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-card-border text-center text-text-muted text-sm">
          <p>&copy; 2025 HUNSLOR. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </footer>
  );
}
