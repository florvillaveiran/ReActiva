import { useEffect } from 'react';
import { seedEmpresas, seedUsuarios, seedVideos, seedProgresos, seedFormularios } from '../mock/data';

/**
 * MockInitializer – se ejecuta una única vez al montar la app y escribe los datos
 * seed en localStorage cuando no existen. Así garantizamos persistencia entre
 * refrescos y evitamos que la app arranque sin datos.
 */
export const MockInitializer: React.FC = () => {
  useEffect(() => {
    const initKey = 'mock-initialized';
    if (!localStorage.getItem(initKey)) {
      localStorage.setItem('empresas', JSON.stringify(seedEmpresas));
      localStorage.setItem('usuarios', JSON.stringify(seedUsuarios));
      localStorage.setItem('videos', JSON.stringify(seedVideos));
      localStorage.setItem('progresos', JSON.stringify(seedProgresos));
      localStorage.setItem('formularios', JSON.stringify(seedFormularios));
      localStorage.setItem(initKey, 'true');
      console.log('✅ Mock data seeded');
    }
  }, []);
  return null;
};
