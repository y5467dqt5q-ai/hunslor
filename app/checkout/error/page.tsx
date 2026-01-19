'use client';

import Link from 'next/link';
import Button from '@/components/Button';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ErrorContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-red-500/30 p-8 text-center">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-red-500/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          
          <h1 className="text-3xl font-bold mb-2 text-red-400">Zahlung fehlgeschlagen</h1>
          <p className="text-text-muted mb-6">
            Leider konnte Ihre Zahlung nicht verarbeitet werden. Bitte versuchen Sie es erneut oder verwenden Sie eine andere Zahlungsmethode.
          </p>

          <div className="bg-background/40 rounded-lg p-4 border border-card-border mb-6 text-left">
            <h3 className="font-semibold mb-3">Mögliche Lösungen:</h3>
            <ul className="space-y-2 text-sm text-text-muted">
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Überprüfen Sie Ihre Kreditkartendaten und versuchen Sie es erneut</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Verwenden Sie eine andere Kreditkarte oder Zahlungsmethode</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Kontaktieren Sie Ihre Bank, um mögliche Probleme zu klären</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Stellen Sie sicher, dass auf Ihrer Karte ausreichend Guthaben vorhanden ist</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-400 mt-1">•</span>
                <span>Überprüfen Sie, ob Ihre Karte für Online-Zahlungen aktiviert ist</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/checkout" className="flex-1">
              <Button variant="primary" className="w-full">
                Erneut versuchen
              </Button>
            </Link>
            <Link href="/catalog" className="flex-1">
              <Button variant="secondary" className="w-full">
                Zum Katalog
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-xs text-text-muted">
            Bei weiteren Fragen kontaktieren Sie bitte unseren Support
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Lade...</div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}
