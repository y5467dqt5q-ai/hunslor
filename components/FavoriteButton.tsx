'use client';

import { useFavoriteStore } from '@/lib/store';

interface FavoriteButtonProps {
  productId: string;
}

export default function FavoriteButton({ productId }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useFavoriteStore();

  const favorite = isFavorite(productId);

  return (
    <button
      onClick={() => toggleFavorite(productId)}
      className={`p-2 rounded-button border transition-all duration-250 ${
        favorite
          ? 'border-neon-green bg-neon-green/10 text-neon-green shadow-neon'
          : 'border-card-border text-text-muted hover:border-neon-green/50 hover:text-neon-green'
      }`}
      aria-label={favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
    >
      <span className="text-xl">{favorite ? '❤️' : '🤍'}</span>
    </button>
  );
}
