import React from 'react';

interface SwagIQBrandProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  withBadge?: boolean;
  badgeText?: string;
}

export const SwagIQBrand: React.FC<SwagIQBrandProps> = ({
  className = '',
  size = 'md',
  withBadge = false,
  badgeText = 'v0.1'
}) => {
  const sizeClasses = {
    xs: 'text-xs',
    sm: 'text-sm',
    md: 'text-base font-extrabold',
    lg: 'text-xl font-black',
    xl: 'text-2xl font-black',
    '2xl': 'text-3xl font-black'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 select-none ${className}`}>
      <span className={`tracking-tight font-display font-black ${sizeClasses[size]}`}>
        <span className="text-white">SWAG</span>
        <span className="text-orange-500">IQ</span>
      </span>
      {withBadge && (
        <span className="text-[9px] px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono font-bold border border-orange-500/30">
          {badgeText}
        </span>
      )}
    </span>
  );
};
