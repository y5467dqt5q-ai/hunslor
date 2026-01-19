'use client';

import Link from 'next/link';
import { useCartStore } from '@/lib/store';
import SearchBox from './SearchBox';
import { useEffect, useState } from 'react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string | null;
  isMegaMenu: boolean;
  children?: Category[];
}

interface HeaderClientProps {
  categories: Category[];
}

export default function HeaderClient({ categories }: HeaderClientProps) {
  const items = useCartStore((state) => state.items);
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const itemCount = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;

  return (
    <header className="border-b border-card-border bg-gradient-to-b from-card-bg-start/80 to-card-bg-end/60 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-neon-green hover:text-neon-green-dark transition-colors duration-250" suppressHydrationWarning>
              HUNSLOR
            </Link>
          </div>

          {/* Search */}
          <div className="hidden md:block flex-1 max-w-4xl mx-4">
            <SearchBox />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            <Link
              href="/favorites"
              className="p-2.5 rounded-button border border-neon-green/30 text-neon-green hover:border-neon-green hover:shadow-neon hover:bg-neon-green/10 active:bg-neon-green/20 transition-all duration-250"
              aria-label="Favoriten"
              suppressHydrationWarning
            >
              <span className="text-lg" suppressHydrationWarning>❤️</span>
            </Link>
            <Link
              href="/cart"
              className="px-3 sm:px-5 py-2.5 rounded-button border border-neon-green/30 text-neon-green font-medium hover:border-neon-green hover:shadow-neon hover:bg-neon-green/10 active:bg-neon-green/20 transition-all duration-250 relative whitespace-nowrap"
              suppressHydrationWarning
            >
              <span className="hidden sm:inline" suppressHydrationWarning>Warenkorb</span>
              <span className="sm:hidden" suppressHydrationWarning>🛒</span>
              <span 
                className="absolute -top-2 -right-2 bg-neon-green text-background text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1" 
                suppressHydrationWarning
                style={{ display: itemCount > 0 ? 'flex' : 'none' }}
              >
                {itemCount > 0 ? itemCount : ''}
              </span>
            </Link>
            <Link
              href="/account"
              className="p-2.5 rounded-button border border-neon-green/30 text-neon-green hover:border-neon-green hover:shadow-neon hover:bg-neon-green/10 active:bg-neon-green/20 transition-all duration-250"
              aria-label="Konto"
              suppressHydrationWarning
            >
              <span className="text-lg" suppressHydrationWarning>👤</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
