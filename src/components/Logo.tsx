import React from 'react';

interface LogoProps {
  className?: string;
  scrolled?: boolean;
  light?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", scrolled = false, light = false }) => {
  const logoSrc = (scrolled || light) ? "/logo-reactiva-dark.png" : "/logo-reactiva-white.png";
  
  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={logoSrc} 
        alt="Metodo Reactiva" 
        className="h-8 md:h-10 w-auto object-contain transition-all duration-300"
      />
    </div>
  );
};
