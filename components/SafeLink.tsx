'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

interface SafeLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

// Обертка для Link, которая автоматически добавляет suppressHydrationWarning
export default function SafeLink({ children, ...props }: SafeLinkProps) {
  return (
    <Link {...props} suppressHydrationWarning>
      {children}
    </Link>
  );
}
