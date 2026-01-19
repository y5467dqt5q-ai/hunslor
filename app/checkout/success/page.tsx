import Link from 'next/link';
import Button from '@/components/Button';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl font-bold mb-4">Bestellung erfolgreich!</h1>
          <p className="text-text-muted text-lg mb-8">
            Vielen Dank für Ihre Bestellung. Sie erhalten in Kürze eine Bestätigungs-E-Mail.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/account">
              <Button variant="primary">Meine Bestellungen</Button>
            </Link>
            <Link href="/catalog">
              <Button variant="secondary">Weiter einkaufen</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
