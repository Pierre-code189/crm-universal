import React from 'react';

interface ModuleToolbarProps {
  moduloActivo: string;
  tenant: any;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filtroFecha: string;
  setFiltroFecha: (fecha: string) => void;
  verPapelera: boolean;
  setVerPapelera: (ver: boolean) => void;
  selectedIds: string[];
  ejecutarEliminacionMultiple: () => void;
  datosFiltrados: any[];
  setRegistroEnEdicion: (registro: any) => void;
  setModalAbierto: (abierto: boolean) => void;
}

export const ModuleToolbar: React.FC<ModuleToolbarProps> = ({
  moduloActivo, tenant, searchTerm, setSearchTerm, filtroFecha, setFiltroFecha,
  verPapelera, setVerPapelera, selectedIds, ejecutarEliminacionMultiple,
  datosFiltrados, setRegistroEnEdicion, setModalAbierto
}) => {
  if (moduloActivo === 'dashboard' || moduloActivo === 'whatsapp') return null;

  return (
    <div className="crm-toolbar" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
        <div className="search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
          <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          <input type="search" placeholder={`Buscar en ${tenant.modules[moduloActivo]?.title}...`} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ padding: '10px 15px 10px 35px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', outline: 'none' }} />
        </div>
        
        {moduloActivo === 'pedidos' && (
          <div className="date-filter-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '4px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
            <span style={{ fontSize: '1.1rem' }}>📅</span>
            <input type="date" value={filtroFecha} onChange={(e) => setFiltroFecha(e.target.value)} style={{ border: 'none', outline: 'none', cursor: 'pointer', fontFamily: 'inherit' }} />
            {filtroFecha && <button onClick={() => setFiltroFecha('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold' }}>✖</button>}
          </div>
        )}
      </div>

      <div className="toolbar-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
        {selectedIds.length > 0 && (
          <button onClick={ejecutarEliminacionMultiple} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            {verPapelera ? '🔥 Destruir' : '🗑️ Eliminar'} ({selectedIds.length})
          </button>
        )}

        <button 
          onClick={() => { import('../../core/utils/ExportService').then(mod => { mod.exportToExcel(datosFiltrados, tenant.modules[moduloActivo]); }); }}
          className="btn-export"
          style={{ backgroundColor: 'white', color: '#10b981', border: '1px solid #10b981', padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          Excel 📥
        </button>

        <button onClick={() => setVerPapelera(!verPapelera)} className="btn-trash-toggle" style={{ backgroundColor: verPapelera ? '#fef2f2' : 'white', color: verPapelera ? '#ef4444' : '#374151', border: `1px solid ${verPapelera ? '#ef4444' : '#d1d5db'}`, padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          {verPapelera ? '📂 Volver' : '🗑️ Papelera'}
        </button>
        
        {!verPapelera && (
          <button onClick={() => { setRegistroEnEdicion(null); setModalAbierto(true); }} className="btn-new-record" style={{ backgroundColor: tenant.themeColor, color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}>
            + Nuevo Registro
          </button>
        )}
      </div>
    </div>
  );
};