import React from 'react';
import { Mail, Target } from 'lucide-react';
import { Logo } from './Logo';

export const Footer = () => {
  return (
    <footer className="bg-white py-16 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-2">
            <Logo scrolled={true} className="mb-6" />
            <p className="text-slate-600 max-w-sm leading-relaxed">
              Transformamos la rutina laboral con pausas activas breves, efectivas y fáciles de aplicar.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Contacto</h4>
            <ul className="space-y-4 text-slate-600">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#10b981]" /> info@metodoreactiva.com
              </li>
              <li className="flex items-center gap-2">
                <span className="font-bold text-lg leading-none text-[#10b981]">@</span> reactiva.kinesio
              </li>
              <li className="flex items-center gap-2">
                <Target className="w-4 h-4 text-[#10b981]" /> Argentina
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold text-slate-900 mb-6">Legal</h4>
            <ul className="space-y-4 text-slate-600">
              <li><a href="#" className="hover:text-[#10b981] transition-colors">Términos y condiciones</a></li>
              <li><a href="#" className="hover:text-[#10b981] transition-colors">Política de privacidad</a></li>
            </ul>
          </div>
        </div>
        
        <div className="text-center pt-8 border-t border-slate-200 text-sm text-slate-500">
          <p className="mb-2">Este sitio no está afiliado a Meta, Facebook, Instagram ni ninguna red social. Los resultados pueden variar.</p>
          <p>© 2025 Reactiva. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};
