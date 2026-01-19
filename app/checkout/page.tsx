'use client';

import { useState } from 'react';
import { useCartStore, useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Button from '@/components/Button';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, getTotal } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Deutschland',
    paymentMethod: 'card',
  });

  const total = getTotal();

  if (items.length === 0) {
    router.push('/cart');
    return null;
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Anmeldung erforderlich</h1>
            <p className="text-text-muted mb-6">Bitte melden Sie sich an, um fortzufahren</p>
            <div className="flex gap-4 justify-center">
              <Link href="/account/login">
                <Button variant="primary">Anmelden</Button>
              </Link>
              <Link href="/account/register">
                <Button variant="secondary">Registrieren</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Переходим на страницу оплаты с данными адреса в query параметрах
    const params = new URLSearchParams({
      name: formData.name,
      email: formData.email,
      street: formData.street,
      city: formData.city,
      postalCode: formData.postalCode,
      country: formData.country,
    });

    router.push(`/checkout/payment?${params.toString()}`);
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Kasse</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6">
              <h2 className="text-xl font-semibold mb-4">Lieferadresse</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">E-Mail</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Straße</label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">PLZ</label>
                    <input
                      type="text"
                      required
                      value={formData.postalCode}
                      onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Stadt</label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2.5 rounded-button bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6">
              <h2 className="text-xl font-semibold mb-4">Zahlungsmethode</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === 'card'}
                    onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                    className="w-4 h-4 text-neon-green border-card-border focus:ring-neon-green focus:ring-2"
                  />
                  <span className="group-hover:text-neon-green transition-colors duration-250">Kreditkarte</span>
                </label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6 sticky top-24">
              <h2 className="text-xl font-semibold mb-4">Bestellübersicht</h2>
              
              <div className="space-y-2 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-text-muted">{item.title} × {item.quantity}</span>
                    <span>{(item.price * item.quantity).toFixed(2)} €</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-card-border pt-4 mb-6">
                <div className="flex justify-between text-lg font-bold">
                  <span>Gesamt</span>
                  <span className="text-neon-green">{total.toFixed(2)} €</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full"
              >
                Zur Zahlung
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
