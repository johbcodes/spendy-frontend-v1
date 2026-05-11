import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  onClick?: () => void;
  style?: React.CSSProperties;
}
export function Card({
  children,
  className = '',
  hoverable = false,
  onClick,
  style
}: CardProps) {
  return (
    <div
      className={`relative bg-surface rounded-card shadow-sm transition-all duration-300 ease-in-out group ${hoverable ? 'hover:shadow-lg hover:-translate-y-0.5 cursor-pointer' : 'hover:shadow-md hover:-translate-y-0.5'} ${className}`}
      onClick={onClick}
      style={style}
    >
      <div className="absolute -inset-1 rounded-card pointer-events-none z-0">
        <div className="w-full h-full bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 blur-md opacity-40 group-hover:opacity-70 transition-opacity duration-300" />
      </div>
      <div className="relative z-10 bg-surface rounded-card border border-gray-100 p-6 group-hover:border-primary/20 transition-colors duration-300">
        {children}
      </div>
    </div>
  );
}