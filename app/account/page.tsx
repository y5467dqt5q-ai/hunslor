'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/Button';

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    price: number;
    variantData: string;
    product: {
      brand: string;
      model: string;
    };
  }[];
}

export default function AccountPage() {
  const { user, token, logout } = useAuthStore();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'profile'>('overview');
  
  // Profile data state
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    street: '',
    city: '',
    postalCode: '',
    country: 'Deutschland',
    dateOfBirth: '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/account/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch('/api/orders', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
    
    // Загружаем профиль пользователя
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/account/profile', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setProfileData({
            name: data.name || '',
            email: data.email || '',
            phone: data.phone || '',
            street: data.address?.street || '',
            city: data.address?.city || '',
            postalCode: data.address?.postalCode || '',
            country: data.address?.country || 'Deutschland',
            dateOfBirth: data.dateOfBirth || '',
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };
    
    if (user && token) {
      fetchProfile();
    }
  }, [user, token, router]);

  if (!user) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, order) => sum + order.total, 0);
  const lastOrder = orders[0];

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('de-DE', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // Форматирование даты для отображения в поле ввода (TT.MM.JJJJ)
  const formatDateForInput = (isoDate: string): string => {
    if (!isoDate) return '';
    try {
      const date = new Date(isoDate);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}.${month}.${year}`;
    } catch {
      return isoDate;
    }
  };

  // Форматирование ввода пользователя (добавление точек)
  const formatDateInput = (value: string): string => {
    // Удаляем все кроме цифр
    const numbers = value.replace(/\D/g, '');
    
    if (numbers.length === 0) return '';
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 4) return `${numbers.slice(0, 2)}.${numbers.slice(2)}`;
    return `${numbers.slice(0, 2)}.${numbers.slice(2, 4)}.${numbers.slice(4, 8)}`;
  };

  // Конвертация из формата TT.MM.JJJJ в ISO (YYYY-MM-DD)
  const convertToISO = (dateString: string): string => {
    if (!dateString || dateString.length < 10) return '';
    const parts = dateString.split('.');
    if (parts.length !== 3) return '';
    const [day, month, year] = parts;
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
    return '';
  };

  const handleProfileChange = (field: string, value: string) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
    setProfileError('');
    setProfileSuccess(false);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileError('');
    setProfileSuccess(false);

    try {
      const address = {
        street: profileData.street,
        city: profileData.city,
        postalCode: profileData.postalCode,
        country: profileData.country,
      };

      const response = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone || null,
          address: address,
          dateOfBirth: profileData.dateOfBirth || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileSuccess(true);
        // Обновляем данные пользователя в store
        if (data.name && data.email) {
          // Обновляем только если нужно
        }
        setTimeout(() => setProfileSuccess(false), 3000);
      } else {
        setProfileError(data.error || 'Fehler beim Speichern der Daten');
      }
    } catch (error) {
      setProfileError('Ein Fehler ist aufgetreten');
    } finally {
      setProfileSaving(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-1">Mein Konto</h1>
              <p className="text-text-muted text-sm">
                Willkommen zurück, <span className="text-neon-green font-medium">{user.name}</span>
              </p>
            </div>
            <Button variant="secondary" onClick={handleLogout}>
              Abmelden
            </Button>
          </div>

          {/* Top overview cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-4">
              <h3 className="text-sm font-medium text-text-muted mb-2">Bestellungen insgesamt</h3>
              <div className="text-3xl font-bold">{totalOrders}</div>
            </div>
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-4">
              <h3 className="text-sm font-medium text-text-muted mb-2">Gesamtausgaben</h3>
              <div className="text-3xl font-bold text-neon-green">
                {totalSpent.toFixed(2)} €
              </div>
            </div>
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-4">
              <h3 className="text-sm font-medium text-text-muted mb-2">Letzte Bestellung</h3>
              {lastOrder ? (
                <div className="space-y-1 text-sm">
                  <div className="font-medium">#{lastOrder.id.slice(0, 8)}</div>
                  <div className="text-text-muted">{formatDate(lastOrder.createdAt)}</div>
                  <div className="text-neon-green font-semibold">
                    {lastOrder.total.toFixed(2)} €
                  </div>
                </div>
              ) : (
                <div className="text-text-muted text-sm">Noch keine Bestellungen</div>
              )}
            </div>
          </div>

          {/* User Info & quick links */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
            <div className="lg:col-span-2 bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6">
              <h2 className="text-xl font-semibold mb-4">Kontoinformationen</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">Name</span>
                  <span className="font-medium">{profileData.name || user.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted">E-Mail</span>
                  <span className="font-medium">{profileData.email || user.email}</span>
                </div>
                {profileData.phone && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Telefon</span>
                    <span className="font-medium">{profileData.phone}</span>
                  </div>
                )}
                {(profileData.street || profileData.city) && (
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted">Adresse</span>
                    <span className="font-medium text-right">
                      {[profileData.street, profileData.city, profileData.postalCode].filter(Boolean).join(', ')}
                    </span>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setActiveTab('profile')}
                  className="text-sm text-neon-green hover:text-neon-green-dark transition-colors duration-250"
                >
                  Daten bearbeiten →
                </button>
              </div>
            </div>

            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6 space-y-4">
              <h2 className="text-xl font-semibold">Schnellzugriff</h2>
              <div className="space-y-2 text-sm">
                <Link
                  href="/favorites"
                  className="flex items-center justify-between px-3 py-2 rounded-button bg-background/40 hover:bg-background/70 border border-card-border/60 hover:border-neon-green/60 transition-colors duration-250"
                >
                  <span>Favoriten</span>
                  <span className="text-text-muted text-xs">Zu Ihren gespeicherten Produkten</span>
                </Link>
                <Link
                  href="/cart"
                  className="flex items-center justify-between px-3 py-2 rounded-button bg-background/40 hover:bg-background/70 border border-card-border/60 hover:border-neon-green/60 transition-colors duration-250"
                >
                  <span>Warenkorb</span>
                  <span className="text-text-muted text-xs">Aktuelle Bestellung fortsetzen</span>
                </Link>
                <Link
                  href="/catalog"
                  className="flex items-center justify-between px-3 py-2 rounded-button bg-background/40 hover:bg-background/70 border border-card-border/60 hover:border-neon-green/60 transition-colors duration-250"
                >
                  <span>Zum Katalog</span>
                  <span className="text-text-muted text-xs">Neue Produkte entdecken</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Tabs for overview / orders (for future expansion) */}
          <div className="mb-6 border-b border-card-border flex gap-6 text-sm">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`pb-3 border-b-2 ${
                activeTab === 'overview'
                  ? 'border-neon-green text-neon-green'
                  : 'border-transparent text-text-muted hover:text-neon-green'
              }`}
            >
              Übersicht
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`pb-3 border-b-2 ${
                activeTab === 'orders'
                  ? 'border-neon-green text-neon-green'
                  : 'border-transparent text-text-muted hover:text-neon-green'
              }`}
            >
              Bestellungen
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`pb-3 border-b-2 ${
                activeTab === 'profile'
                  ? 'border-neon-green text-neon-green'
                  : 'border-transparent text-text-muted hover:text-neon-green'
              }`}
            >
              Meine Daten
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6">
              <h2 className="text-xl font-semibold mb-4">Letzte Aktivitäten</h2>
              {loading ? (
                <div className="text-text-muted text-sm">Lade Daten...</div>
              ) : orders.length === 0 ? (
                <div className="text-text-muted text-sm">
                  Noch keine Bestellungen. Starten Sie mit Ihrem ersten Einkauf im Katalog.
                </div>
              ) : (
                <ul className="space-y-3 text-sm">
                  {orders.slice(0, 5).map((order) => (
                    <li
                      key={order.id}
                      className="flex items-center justify-between border-b border-card-border/60 last:border-0 pb-3 last:pb-0"
                    >
                      <div>
                        <div className="font-medium">
                          Bestellung #{order.id.slice(0, 8)}
                        </div>
                        <div className="text-text-muted">
                          {formatDate(order.createdAt)} • {order.items.length} Artikel
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-neon-green">
                          {order.total.toFixed(2)} €
                        </div>
                        <span className="text-xs px-2 py-1 rounded-full bg-background/60 border border-card-border text-text-muted capitalize">
                          {order.status}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'orders' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Bestellungen</h2>

              {loading ? (
                <div className="text-center py-8 text-text-muted">Lade Bestellungen...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-text-muted mb-4">Sie haben noch keine Bestellungen</p>
                  <Link href="/catalog">
                    <Button variant="primary">Zum Katalog</Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
                        <div>
                          <div className="font-semibold text-lg mb-1">
                            Bestellung #{order.id.slice(0, 8)}
                          </div>
                          <div className="text-sm text-text-muted">
                            {formatDate(order.createdAt)}
                          </div>
                        </div>
                        <div className="flex flex-col sm:items-end gap-2">
                          <div className="text-xl font-bold text-neon-green">
                            {order.total.toFixed(2)} €
                          </div>
                          <span className="text-xs px-2 py-1 rounded-full bg-background/60 border border-card-border text-text-muted capitalize">
                            {order.status}
                          </span>
                        </div>
                      </div>

                      <div className="border-t border-card-border pt-4">
                        <div className="space-y-2">
                          {order.items.map((item) => {
                            const variantData = JSON.parse(item.variantData || '{}');
                            return (
                              <div key={item.id} className="flex justify-between text-sm">
                                <div>
                                  <span className="font-medium">
                                    {item.product.brand} {item.product.model}
                                  </span>
                                  {variantData.color && (
                                    <span className="text-text-muted ml-2">• {variantData.color}</span>
                                  )}
                                  {variantData.memory && (
                                    <span className="text-text-muted ml-2">• {variantData.memory}</span>
                                  )}
                                  <span className="text-text-muted ml-2">× {item.quantity}</span>
                                </div>
                                <span>{(item.price * item.quantity).toFixed(2)} €</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-gradient-to-br from-card-bg-start to-card-bg-end rounded-card border border-card-border p-6">
              <h2 className="text-xl font-semibold mb-6">Meine Daten</h2>
              
              {profileLoading ? (
                <div className="text-text-muted text-sm">Lade Daten...</div>
              ) : (
                <form onSubmit={handleProfileSubmit} className="space-y-6">
                  {profileError && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {profileError}
                    </div>
                  )}
                  
                  {profileSuccess && (
                    <div className="p-4 bg-neon-green/10 border border-neon-green/30 rounded-lg text-neon-green text-sm">
                      ✓ Ihre Daten wurden erfolgreich gespeichert!
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={profileData.name}
                        onChange={(e) => handleProfileChange('name', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                        placeholder="Max Mustermann"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">
                        E-Mail <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={profileData.email}
                        onChange={(e) => handleProfileChange('email', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                        placeholder="ihre@email.de"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Telefonnummer</label>
                      <input
                        type="tel"
                        value={profileData.phone}
                        onChange={(e) => handleProfileChange('phone', e.target.value)}
                        className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                        placeholder="+49 152 567 889 30"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2">Geburtsdatum</label>
                      <input
                        type="text"
                        value={profileData.dateOfBirth ? formatDateForInput(profileData.dateOfBirth) : ''}
                        onChange={(e) => {
                          const formatted = formatDateInput(e.target.value);
                          handleProfileChange('dateOfBirth', formatted ? convertToISO(formatted) : '');
                        }}
                        placeholder="TT.MM.JJJJ"
                        maxLength={10}
                        className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                        pattern="[0-9]{2}\.[0-9]{2}\.[0-9]{4}"
                      />
                      <p className="mt-1 text-xs text-text-muted">Format: TT.MM.JJJJ (z.B. 15.03.1990)</p>
                    </div>
                  </div>

                  <div className="border-t border-card-border pt-6">
                    <h3 className="text-lg font-semibold mb-4">Adresse</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Straße & Hausnummer</label>
                        <input
                          type="text"
                          value={profileData.street}
                          onChange={(e) => handleProfileChange('street', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                          placeholder="Musterstraße 123"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Postleitzahl</label>
                          <input
                            type="text"
                            value={profileData.postalCode}
                            onChange={(e) => handleProfileChange('postalCode', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                            placeholder="12345"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Stadt</label>
                          <input
                            type="text"
                            value={profileData.city}
                            onChange={(e) => handleProfileChange('city', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                            placeholder="Berlin"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-2">Land</label>
                          <input
                            type="text"
                            value={profileData.country}
                            onChange={(e) => handleProfileChange('country', e.target.value)}
                            className="w-full px-4 py-2.5 rounded-lg bg-background border border-card-border text-foreground focus:border-neon-green focus:outline-none transition-colors duration-250"
                            placeholder="Deutschland"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-card-border">
                    <Button
                      type="submit"
                      variant="primary"
                      disabled={profileSaving}
                    >
                      {profileSaving ? 'Wird gespeichert...' : 'Daten speichern'}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
