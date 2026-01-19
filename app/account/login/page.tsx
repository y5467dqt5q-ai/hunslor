'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Button from '@/components/Button';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user, data.token);
        router.push('/account');
      } else {
        setError(data.error || 'Anmeldung fehlgeschlagen');
      }
    } catch (error) {
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Anmelden</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-button text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">E-Mail</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                placeholder="ihre@email.de"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Passwort</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                placeholder="••••••••"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Wird verarbeitet...' : 'Anmelden'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            Noch kein Konto?{' '}
            <Link href="/account/register" className="text-neon-green hover:text-neon-green-dark transition-colors duration-250">
              Registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
