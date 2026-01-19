'use client';

import { useCartStore } from '@/lib/store';
import Link from 'next/link';
import Button from '@/components/Button';
import ProductImage from '@/components/ProductImage';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCartStore();
  const router = useRouter();
  const total = getTotal();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <div className="container mx-auto px-4 py-16">
          <h1 className="text-4xl font-bold mb-8">Warenkorb</h1>
          <div className="text-center py-16">
            <p className="text-text-muted text-lg mb-6">Ihr Warenkorb ist leer</p>
            <Link href="/catalog">
              <Button variant="primary">Zum Katalog</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Warenkorb</h1>
          <button
            onClick={clearCart}
            className="text-sm text-text-muted hover:text-neon-green transition-colors duration-250"
          >
            Warenkorb leeren
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-4 flex flex-col sm:flex-row gap-4"
              >
                {/* Image */}
                <Link href={`/products/${item.productId}`} className="flex-shrink-0">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 relative">
                    <ProductImage
                      src={item.image}
                      alt={item.title}
                      className="rounded-button"
                    />
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/products/${item.productId}`}>
                    <h3 className="text-lg font-semibold mb-1 hover:text-neon-green transition-colors duration-250">
                      {item.title}
                    </h3>
                  </Link>
                  
                  {/* Variant info */}
                  {item.variantData && (
                    <div className="text-sm text-text-muted mb-2 space-y-1">
                      {item.variantData.color && (
                        <div>Farbe: {item.variantData.color}</div>
                      )}
                      {item.variantData.memory && (
                        <div>Speicher: {item.variantData.memory}</div>
                      )}
                      {item.variantData.size && (
                        <div>Größe: {item.variantData.size}</div>
                      )}
                    </div>
                  )}

                  <div className="text-xl font-bold text-neon-green mb-2">
                    {(item.price * item.quantity).toFixed(2)} €
                  </div>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 sm:gap-3 mt-4 flex-wrap">
                    <div className="flex items-center gap-1 border border-card-border rounded-button p-1 flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-button hover:bg-neon-green/10 flex items-center justify-center transition-all duration-250 flex-shrink-0"
                        aria-label="Menge reduzieren"
                      >
                        −
                      </button>
                      <span className="text-lg font-medium w-8 text-center flex-shrink-0">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-button hover:bg-neon-green/10 flex items-center justify-center transition-all duration-250 flex-shrink-0"
                        aria-label="Menge erhöhen"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-sm text-text-muted hover:text-red-400 transition-colors duration-250 whitespace-nowrap"
                    >
                      Entfernen
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6 sticky top-24">
              <h2 className="text-2xl font-semibold mb-4">Zusammenfassung</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-text-muted">
                  <span>Zwischensumme</span>
                  <span>{total.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-text-muted">
                  <span>Versand</span>
                  <span>Kostenlos</span>
                </div>
                <div className="border-t border-card-border pt-3 flex justify-between text-xl font-bold">
                  <span>Gesamt</span>
                  <span className="text-neon-green">{total.toFixed(2)} €</span>
                </div>
              </div>

              <Button
                variant="primary"
                className="w-full"
                onClick={() => router.push('/checkout')}
              >
                Zur Kasse
              </Button>

              <Link href="/catalog" className="block mt-4">
                <Button variant="secondary" className="w-full">
                  Weiter einkaufen
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
