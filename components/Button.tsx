'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
}

export default function Button({ 
  children, 
  variant = 'secondary',
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'px-4 sm:px-5 py-2.5 rounded-button font-medium transition-all duration-250 flex items-center justify-center gap-2 w-full sm:w-auto min-w-0';
  
  const variants = {
    primary: disabled
      ? 'bg-neon-green/20 border border-neon-green/20 text-neon-green/50 cursor-not-allowed'
      : 'bg-neon-green/10 border border-neon-green text-neon-green hover:bg-neon-green/20 hover:shadow-neon active:bg-neon-green/30 active:scale-95',
    secondary: disabled
      ? 'border border-neon-green/20 text-neon-green/50 cursor-not-allowed'
      : 'border border-neon-green/30 text-neon-green hover:border-neon-green hover:shadow-neon hover:bg-neon-green/10 active:bg-neon-green/20 active:scale-95',
    ghost: disabled
      ? 'text-neon-green/50 cursor-not-allowed'
      : 'text-neon-green hover:text-neon-green-dark hover:bg-neon-green/5 active:bg-neon-green/10 active:scale-95',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
