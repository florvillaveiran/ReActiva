import React from 'react';

interface LogoProps {
  className?: string;
  scrolled?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", scrolled = false, light = false }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="flex flex-col gap-1">
        <div className="w-3.5 h-3.5 rounded-full bg-[#F5D1B3]" />
        <div className="w-3.5 h-3.5 rounded-full bg-[#F19A9A]" />
        <div className="w-3.5 h-3.5 rounded-full bg-[#C1E9D2]" />
      </div>
      <span className={`font-logo font-bold text-2xl tracking-tight ${light ? 'text-white' : (scrolled ? 'text-slate-900' : 'text-white')}`}>
        Re-Activa
      </span>
    </div>
  );
};
