import React from 'react';

interface EsteeLauderLogoProps {
  variant?: 'full' | 'wordmark' | 'monogram';
  theme?: 'dark' | 'light' | 'navy';
  className?: string;
  subtext?: string;
}

export const EsteeLauderLogo: React.FC<EsteeLauderLogoProps> = ({
  variant = 'full',
  theme = 'navy',
  className = '',
  subtext = 'Prestige Production Planning & Detailed Scheduling',
}) => {
  const isDarkBg = theme === 'navy' || theme === 'dark';
  const textColor = isDarkBg ? 'text-white' : 'text-[#001E38]';
  const subtextColor = isDarkBg ? 'text-[#D4AF37]' : 'text-[#9A7B38]';
  const goldBorder = isDarkBg ? 'border-[#C5A059]' : 'border-[#9A7B38]';

  // The iconic interlocking EL Monogram Crest
  const renderMonogram = (size = 'w-9 h-9') => (
    <div
      className={`relative ${size} shrink-0 rounded-md bg-gradient-to-br from-[#001E38] via-[#002B54] to-[#001426] border border-[#C5A059]/60 shadow-xs flex items-center justify-center overflow-hidden`}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#D4AF37]/20 via-transparent to-transparent opacity-80" />
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-7 h-7 drop-shadow-sm"
        aria-hidden="true"
      >
        <circle cx="50" cy="50" r="44" stroke="#D4AF37" strokeWidth="2.5" strokeDasharray="3 2" />
        <circle cx="50" cy="50" r="40" stroke="#C5A059" strokeWidth="1.5" />
        {/* Stylized Interlocking E & L Luxury Monogram */}
        {/* E letterform */}
        <path
          d="M32 30 H56 M32 30 V70 M32 50 H50 M32 70 H56"
          stroke="#FBF9F5"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* L letterform interlaced */}
        <path
          d="M45 27 V68 M45 68 H68"
          stroke="#D4AF37"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Serifs / Finishing flourishes */}
        <line x1="30" y1="30" x2="34" y2="30" stroke="#FBF9F5" strokeWidth="2.5" />
        <line x1="30" y1="70" x2="34" y2="70" stroke="#FBF9F5" strokeWidth="2.5" />
        <line x1="68" y1="65" x2="68" y2="71" stroke="#D4AF37" strokeWidth="2.5" />
      </svg>
    </div>
  );

  if (variant === 'monogram') {
    return <div className={`inline-flex items-center ${className}`}>{renderMonogram()}</div>;
  }

  if (variant === 'wordmark') {
    return (
      <div className={`inline-flex flex-col ${className}`}>
        <span
          className={`font-serif tracking-[0.22em] text-base font-medium uppercase leading-tight ${textColor}`}
          style={{ fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif' }}
        >
          ESTÉE LAUDER
        </span>
        {subtext && (
          <span
            className={`text-[9px] tracking-[0.16em] uppercase font-sans font-semibold mt-0.5 ${subtextColor}`}
          >
            {subtext}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-3 ${className}`}>
      {renderMonogram()}
      <div className="flex flex-col">
        <div className="flex items-center space-x-1.5">
          <span
            className={`font-serif tracking-[0.24em] text-[15px] sm:text-base font-semibold uppercase leading-tight ${textColor}`}
            style={{ fontFamily: 'Georgia, "Playfair Display", "Times New Roman", serif' }}
          >
            ESTÉE LAUDER
          </span>
        </div>
        <div className="flex items-center space-x-1.5 mt-0.5">
          <span
            className={`text-[8.5px] tracking-[0.18em] font-sans font-bold uppercase ${subtextColor}`}
          >
            THE ESTÉE LAUDER COMPANIES
          </span>
          <span className="text-slate-400 text-[8px]">•</span>
          <span
            className={`text-[8.5px] tracking-[0.12em] font-sans font-medium uppercase ${
              isDarkBg ? 'text-slate-300' : 'text-slate-600'
            }`}
          >
            PPDS
          </span>
        </div>
      </div>
    </div>
  );
};
