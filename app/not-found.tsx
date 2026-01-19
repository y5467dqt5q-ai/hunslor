import Link from 'next/link';
import Button from '@/components/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="flex items-center justify-center gap-4 mb-8">
          <h1 className="text-8xl font-bold text-neon-green">404</h1>
          <div className="h-20 w-px bg-card-border"></div>
          <div className="text-left">
            <h2 className="text-2xl font-semibold mb-2">Seite nicht gefunden</h2>
            <p className="text-text-muted">Diese Seite existiert nicht.</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/">
            <Button variant="primary">Zur Startseite</Button>
          </Link>
          <Link href="/catalog">
            <Button variant="secondary">Zum Katalog</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
