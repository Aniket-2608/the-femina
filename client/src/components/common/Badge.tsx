import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'wine' | 'emerald' | 'gray' | 'outline' | 'success' | 'warning' | 'error' | 'neutral';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'gold',
  size = 'sm',
  className = '',
}) => {
  const variantStyles: Record<string, string> = {
    gold: 'bg-amber-50 text-amber-900 border border-amber-300',
    wine: 'bg-rose-50 text-rose-900 border border-rose-300',
    emerald: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    gray: 'bg-gray-100 text-gray-700 border border-gray-200',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    error: 'bg-rose-50 text-rose-800 border border-rose-200',
    outline: 'bg-transparent text-gray-700 border border-gray-300',
  };

  const sizeStyles = {
    sm: 'text-[10px] tracking-wider uppercase px-2 py-0.5 font-semibold rounded-full',
    md: 'text-xs tracking-wider uppercase px-3 py-1 font-semibold rounded-full',
  };

  return (
    <span className={`inline-flex items-center justify-center ${sizeStyles[size]} ${variantStyles[variant] || variantStyles.neutral} ${className}`}>
      {children}
    </span>
  );
};
