import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'info' | 'warning' | 'glass';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-300 ease-in-out disabled:opacity-40 disabled:cursor-not-allowed rounded-xl outline-none';
  
  const variantStyles = {
    primary: 'bg-gradient-to-br from-primary to-primary-hover text-black shadow-[0_4px_15px_rgba(245,158,11,0.2)] hover:shadow-[0_8px_25px_rgba(245,158,11,0.3)] hover:-translate-y-0.5 active:translate-y-0 active:scale-95',
    secondary: 'bg-bg-surface-light text-white border border-white/5 hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0',
    success: 'bg-success/10 text-success border border-success/20 hover:bg-success/20',
    info: 'bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20',
    warning: 'bg-warning/10 text-warning border border-warning/20 hover:bg-warning/20',
    ghost: 'text-text-muted hover:text-white hover:bg-white/5',
    danger: 'bg-error/10 text-error border border-error/20 hover:bg-error/20',
    glass: 'glass border-white/10 text-white hover:bg-white/10 hover:-translate-y-0.5 active:translate-y-0'
  };

  const sizeStyles = {
    xs: 'px-3 py-1.5 text-xs gap-1',
    sm: 'px-4 py-2 text-sm gap-1.5',
    md: 'px-6 py-2.5 text-base gap-2',
    lg: 'px-8 py-3.5 text-lg gap-2.5'
  };

  return (
    <button 
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
}