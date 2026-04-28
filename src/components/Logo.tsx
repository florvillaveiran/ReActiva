import React from 'react';

interface LogoProps {
  className?: string;
  scrolled?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", scrolled = false, light = false }) => {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      {/* Icono Principal Exclusivo: Nueva 'R' Geométrica 3D Azul Corporativo */}
      <svg viewBox="0 0 100 100" fill="none" className="w-[48px] h-[48px] md:w-[54px] md:h-[54px] flex-shrink-0 drop-shadow-md transition-transform hover:scale-105 duration-300">
        <defs>
          <filter id="ribbon-shadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#000000" floodOpacity="0.30" />
          </filter>
        </defs>
        
        {/* Pilar Trasero (Azul Marino Profundo) - Fuerza y estabilidad */}
        <path d="M 28 85 L 28 20" stroke="#1E40AF" strokeWidth="17" strokeLinecap="round" />
        
        {/* Bucle Central (Azul Eléctrico) - Agilidad */}
        <path d="M 28 20 L 55 20 A 19 19 0 0 1 55 58 L 28 58" stroke="#3B82F6" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" filter="url(#ribbon-shadow)" />
        
        {/* Pierna Delantera (Cian Brillante) - Movimiento frontal */}
        <path d="M 45 58 L 73 85" stroke="#38BDF8" strokeWidth="17" strokeLinecap="round" strokeLinejoin="round" filter="url(#ribbon-shadow)" />
      </svg>
    </div>
  );
};
