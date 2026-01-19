'use client';

import { useCartStore, useToastStore } from '@/lib/store';
import Button from './Button';
import { useState } from 'react';

interface AddToCartButtonProps {
  productId: string;
  variantId: string;
  title: string;
  price: number;
  image?: string;
  variantData?: {
    color?: string;
    memory?: string;
    size?: string;
  };
  className?: string;
}

export default function AddToCartButton({
  productId,
  variantId,
  title,
  price,
  image,
  variantData,
  className = '',
}: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const showToast = useToastStore((state) => state.showToast);
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    // Добавляем товар в корзину
    addItem({
      productId,
      variantId,
      title,
      price,
      quantity: 1,
      image,
      variantData,
    });
    
    // Показываем уведомление через глобальный store
    // Используем небольшую задержку, чтобы убедиться, что store обновился
    setTimeout(() => {
      showToast('Artikel hinzugefügt', title);
    }, 10);
    
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
    }, 2000);
  };

  return (
    <Button
      variant="primary"
      onClick={handleClick}
      className={className}
    >
      {added ? '✓ Hinzugefügt' : 'In den Warenkorb'}
    </Button>
  );
}
