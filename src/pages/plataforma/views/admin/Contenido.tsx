import React, { useState } from 'react';
import { MicroentrenamientosTab } from './contenidos/MicroentrenamientosTab';
import { CoachTab } from './contenidos/CoachTab';
import { AcademiaTab } from './contenidos/AcademiaTab';
import { BibliotecaTab } from './contenidos/BibliotecaTab';

export const Contenido: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'micro' | 'coach' | 'academia' | 'biblioteca'>('micro');

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', borderBottom: '1px solid var(--border-color)', overflowX: 'auto', paddingBottom: '2px' }}>
        <button
          onClick={() => setActiveTab('micro')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 0.5rem', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'micro' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'micro' ? '2px solid var(--primary-color)' : '2px solid transparent',
            whiteSpace: 'nowrap', transition: 'all 0.2s', marginBottom: '-1px'
          }}
        >
          Microentrenamientos
        </button>
        <button
          onClick={() => setActiveTab('coach')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 0.5rem', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'coach' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'coach' ? '2px solid var(--primary-color)' : '2px solid transparent',
            whiteSpace: 'nowrap', transition: 'all 0.2s', marginBottom: '-1px'
          }}
        >
          ReActiva Coach
        </button>
        <button
          onClick={() => setActiveTab('academia')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 0.5rem', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'academia' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'academia' ? '2px solid var(--primary-color)' : '2px solid transparent',
            whiteSpace: 'nowrap', transition: 'all 0.2s', marginBottom: '-1px'
          }}
        >
          Academia ReActiva
        </button>
        <button
          onClick={() => setActiveTab('biblioteca')}
          style={{
            background: 'none', border: 'none', padding: '0.75rem 0.5rem', cursor: 'pointer',
            fontSize: '0.9rem', fontWeight: 600, color: activeTab === 'biblioteca' ? 'var(--primary-color)' : 'var(--text-muted)',
            borderBottom: activeTab === 'biblioteca' ? '2px solid var(--primary-color)' : '2px solid transparent',
            whiteSpace: 'nowrap', transition: 'all 0.2s', marginBottom: '-1px'
          }}
        >
          Biblioteca Multimedia
        </button>
      </div>

      <div>
        {activeTab === 'micro' && <MicroentrenamientosTab />}
        {activeTab === 'coach' && <CoachTab />}
        {activeTab === 'academia' && <AcademiaTab />}
        {activeTab === 'biblioteca' && <BibliotecaTab />}
      </div>
    </div>
  );
};
