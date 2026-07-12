import React, { useState, useEffect } from 'react';
import { Upload, Search, FileImage, FileVideo, FileText, FileAudio, Trash2, Link as LinkIcon, Info, Image as ImageIcon } from 'lucide-react';
import { getDB, MediaFile } from '../../../mock/data';

export const BibliotecaTab: React.FC = () => {
  const [files, setFiles] = useState<MediaFile[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setFiles(getDB().mediaFiles);
  }, []);

  const filtered = files.filter(f => f.name.toLowerCase().includes(search.toLowerCase()));

  const getIcon = (type: string) => {
    switch (type) {
      case 'video': return <FileVideo size={32} color="#3b82f6" />;
      case 'image': return <FileImage size={32} color="#10b981" />;
      case 'pdf': return <FileText size={32} color="#ef4444" />;
      case 'audio': return <FileAudio size={32} color="#8b5cf6" />;
      default: return <ImageIcon size={32} color="#64748b" />;
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const totalSize = files.reduce((acc, f) => acc + f.sizeBytes, 0);

  return (
    <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
      {/* Resumen */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Total Archivos</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-color)' }}>{files.length}</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Videos</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{files.filter(f => f.type === 'video').length}</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Imágenes</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>{files.filter(f => f.type === 'image').length}</p>
        </div>
        <div className="card" style={{ padding: '1rem' }}>
          <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Espacio Usado</p>
          <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--purple-color)' }}>{formatSize(totalSize)}</p>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Buscar archivos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.25rem' }}
          />
        </div>
        <button className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Upload size={16} /> Subir archivo
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
        {filtered.map(file => (
          <div key={file.id} className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
            <div style={{ height: '120px', backgroundColor: '#f8fafc', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem', backgroundImage: file.thumbnailUrl ? `url(${file.thumbnailUrl})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              {!file.thumbnailUrl && getIcon(file.type)}
            </div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-color)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={file.name}>
              {file.name}
            </h4>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <span>{formatSize(file.sizeBytes)}</span>
              <span style={{ textTransform: 'capitalize' }}>{file.type}</span>
            </div>
            
            <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Copiar enlace">
                <LinkIcon size={14} />
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }} title="Uso">
                <Info size={14} />
              </button>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red-color)' }} title="Eliminar (No se puede si está en uso)">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', border: '2px dashed var(--border-color)', borderRadius: '12px' }}>
            <FileImage size={40} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>No se encontraron archivos en la biblioteca multimedia.</p>
          </div>
        )}
      </div>
    </div>
  );
};
