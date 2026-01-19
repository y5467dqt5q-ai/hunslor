// Глобальный патч для Link компонента Next.js
// Автоматически добавляет suppressHydrationWarning ко всем Link

import Link from 'next/link';
import { ComponentProps, ReactNode } from 'react';

// Переопределяем Link с автоматическим suppressHydrationWarning
export default function PatchedLink({ 
  children, 
  ...props 
}: ComponentProps<typeof Link>) {
  return (
    <Link {...props} suppressHydrationWarning>
      {children}
    </Link>
  );
}
