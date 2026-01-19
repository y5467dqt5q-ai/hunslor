'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  children?: Category[];
}

interface MegaMenuProps {
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export default function MegaMenu({ categories, isOpen, onClose }: MegaMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-screen max-w-6xl bg-gradient-to-br from-card-bg-start to-card-bg-end border border-card-border rounded-card shadow-card-hover p-8 z-50"
      onMouseLeave={onClose}
    >
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="space-y-3">
            <Link
              href={`/catalog?category=${category.slug}`}
              className="flex items-center gap-2 text-lg font-semibold text-neon-green hover:text-neon-green-dark transition-colors duration-250"
              onClick={onClose}
              suppressHydrationWarning
            >
              {category.icon ? (
                <span className="text-xl" suppressHydrationWarning>{category.icon}</span>
              ) : (
                <span className="text-xl opacity-0" suppressHydrationWarning aria-hidden="true">•</span>
              )}
              <span suppressHydrationWarning>{category.name}</span>
            </Link>
            {category.children && category.children.length > 0 && (
              <ul className="space-y-2 ml-7">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/catalog?category=${child.slug}`}
                      className="text-text-muted hover:text-neon-green transition-colors duration-250 text-sm block py-1"
                      onClick={onClose}
                      suppressHydrationWarning
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
