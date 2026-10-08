import React from 'react';

interface PriceDisplayProps {
  price?: number;
  amount?: number;
  compareAtPrice?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PriceDisplay: React.FC<PriceDisplayProps> = ({
  price,
  amount,
  compareAtPrice,
  size = 'md',
  className = '',
}) => {
  const finalPrice = price ?? amount ?? 0;

  const formatINR = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const discountPercent =
    compareAtPrice && compareAtPrice > finalPrice
      ? Math.round(((compareAtPrice - finalPrice) / compareAtPrice) * 100)
      : null;

  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base font-semibold',
    lg: 'text-xl font-bold',
    xl: 'text-2xl lg:text-3xl font-bold',
  };

  return (
    <div className={`flex items-baseline flex-wrap gap-2 ${className}`}>
      <span className={`${sizeClasses[size]} text-luxury-wine tracking-tight`}>
        {formatINR(finalPrice)}
      </span>
      {compareAtPrice && compareAtPrice > finalPrice && (
        <>
          <span className="text-xs lg:text-sm text-gray-400 line-through font-normal">
            {formatINR(compareAtPrice)}
          </span>
          {discountPercent && (
            <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
              {discountPercent}% OFF
            </span>
          )}
        </>
      )}
    </div>
  );
};
