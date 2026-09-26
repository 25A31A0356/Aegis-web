import React from 'react';

interface AegisLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  iconOnly?: boolean;
  onClick?: () => void;
}

export const AegisShieldIcon: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = '',
}) => {
  return (
    <img
      src="/logo.png"
      alt="AEGIS ALERT Logo"
      width={size}
      height={size}
      style={{ width: `${size}px`, height: `${size}px` }}
      className={`shrink-0 object-contain drop-shadow-xs select-none ${className}`}
      loading="eager"
    />
  );
};

export const AegisLogo: React.FC<AegisLogoProps> = ({
  className = '',
  size = 'md',
  showSubtitle = true,
  iconOnly = false,
  onClick,
}) => {
  const iconSizes = {
    sm: 28,
    md: 36,
    lg: 44,
    xl: 56,
  };

  const titleSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-xl',
    xl: 'text-2xl',
  };

  const subtitleSizes = {
    sm: 'text-[7px]',
    md: 'text-[8.5px]',
    lg: 'text-[10px]',
    xl: 'text-[11.5px]',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-2.5 select-none ${onClick ? 'cursor-pointer ' : ''}${className}`}
    >
      <AegisShieldIcon size={iconSizes[size]} />
      {!iconOnly && (
        <div className="flex flex-col justify-center text-left">
          <div className="flex items-baseline font-black tracking-tight leading-none">
            <span className={`font-sans font-extrabold text-slate-900 dark:text-white ${titleSizes[size]}`}>
              AEGIS
            </span>
            <span className={`font-sans font-extrabold text-[#0284C7] dark:text-[#38BDF8] ml-1.5 ${titleSizes[size]}`}>
              ALERT
            </span>
          </div>
          {showSubtitle && (
            <span
              className={`font-mono font-bold uppercase tracking-[0.15em] text-slate-500 dark:text-slate-400 mt-1 leading-none ${subtitleSizes[size]}`}
            >
              HAZARD &amp; WEATHER INTELLIGENCE
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AegisLogo;
