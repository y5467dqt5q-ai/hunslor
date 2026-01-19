'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/store';
import Button from '@/components/Button';
import Link from 'next/link';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setUser } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwörter stimmen nicht überein');
      return;
    }

    if (password.length < 6) {
      setError('Passwort muss mindestens 6 Zeichen lang sein');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Auto login after registration
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const loginData = await loginResponse.json();
        if (loginResponse.ok) {
          setUser(loginData.user, loginData.token);
          router.push('/account');
        } else {
          router.push('/account/login');
        }
      } else {
        // Показываем более детальную ошибку
        const errorMessage = data.error || 'Registrierung fehlgeschlagen';
        const details = data.details ? ` (${data.details})` : '';
        setError(errorMessage + details);
        console.error('Registration error:', data);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Registrieren</h1>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-button text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                placeholder="Max Mustermann"
              />
            </div>

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

            <div>
              <label className="block text-sm font-medium mb-2">Passwort bestätigen</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? 'Wird verarbeitet...' : 'Registrieren'}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-text-muted">
            Bereits ein Konto?{' '}
            <Link href="/account/login" className="text-neon-green hover:text-neon-green-dark transition-colors duration-250">
              Anmelden
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
