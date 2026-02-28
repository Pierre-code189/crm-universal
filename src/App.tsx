// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { AuthProvider, useAuth } from './features/auth/AuthContext';
import { TenantProvider, useTenant } from './core/tenants/TenantContext';

import { LoginPage } from './features/auth/LoginPage';
import { ProtectedRoute } from './features/auth/ProtectedRoute';
import { SuperAdminRoute } from './features/auth/SuperAdminRoute';
import { SuperAdminDashboard } from './features/admin/SuperAdminDashboard';
import { SetupPasswordPage } from './features/auth/SetupPasswordPage';

import { DynamicTable } from './ui/dynamic/DynamicTable';
import { DynamicForm } from './ui/dynamic/DynamicForm';
import { Modal } from './ui/components/Modal';
import { Dashboard } from './ui/dynamic/Dashboard'; 
import WhatsAppConnector from './ui/dynamic/WhatsAppConnector';

import './App.css';

const PanelCRM = () => {
  const { tenant, isLoading, repository } = useTenant();
  const { user, logout, isLoading: authLoading } = useAuth();

  const [moduloActivo, setModuloActivo] = useState<string>('dashboard');
  const [datosModulo, setDatosModulo] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<any | null>(null);
  const [verPapelera, setVerPapelera] = useState(false);
  
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'exito' | 'error'} | null>(null);
  const [registroAEliminar, setRegistroAEliminar] = useState<string | null>(null);

  // 🚀 ESTADOS DE UX AVANZADA
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filtroFecha, setFiltroFecha] = useState<string>(''); 
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  useEffect(() => {
    setSearchTerm('');
    setSelectedIds([]);
    setFiltroFecha(''); 
    cargarDatos();
  }, [moduloActivo, tenant, verPapelera]);

  const mostrarMensaje = (texto: string, tipo: 'exito' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarDatos = async () => {
    if (!tenant || !repository || moduloActivo === 'dashboard') return;
    
    setDatosModulo([]); 
    const esquemaActual = tenant.modules[moduloActivo];
    if (!esquemaActual) return;
    
    const repo: any = repository;
    try {
      const data = await repo.getAll(esquemaActual.collectionName, verPapelera);
      setDatosModulo(data);
    } catch (error) {
      mostrarMensaje("Error al sincronizar datos", "error");
    }
  };

  const handleGuardarRegistro = async (datos: any) => {
    if (!tenant || !repository || !moduloActivo) return;
    const colName = tenant.modules[moduloActivo].collectionName;
    const repo: any = repository;
    try {
      if (registroEnEdicion) {
        await repo.update(colName, registroEnEdicion.id, datos);
        mostrarMensaje("Registro actualizado", "exito");
      } else {
        await repo.create(colName, datos);
        mostrarMensaje("Registro creado con éxito", "exito");
      }
      setModalAbierto(false);
      await cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al guardar", "error");
    }
  };

  const ejecutarEliminacion = async () => {
    if (!tenant || !repository || !moduloActivo || !registroAEliminar) return;
    const repo: any = repository;
    try {
      if (verPapelera) {
        await repo.hardDelete(tenant.modules[moduloActivo].collectionName, registroAEliminar);
        mostrarMensaje("Destruido permanentemente", "exito");
      } else {
        await repo.delete(tenant.modules[moduloActivo].collectionName, registroAEliminar);
        mostrarMensaje("Movido a la papelera", "exito");
      }
    } catch (error) {
      mostrarMensaje("Error al procesar", "error");
    }
    setRegistroAEliminar(null);
    await cargarDatos(); 
  };

  const handleRestaurarRegistro = async (id: string) => {
    if (!tenant || !repository || !moduloActivo) return;
    const repo: any = repository;
    try {
      await repo.restore(tenant.modules[moduloActivo].collectionName, id);
      mostrarMensaje("¡Registro restaurado!", "exito");
      await cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al restaurar", "error");
    }
  };

  const handleCambiarModulo = (modulo: string) => {
    setModuloActivo(modulo);
    setVerPapelera(false);
    setMenuMovilAbierto(false); 
  };

  // ==========================================
  // 🧠 MOTOR DE DATOS PROCESADOS (Filtros en Vivo)
  // ==========================================
  let datosProcesados = [...datosModulo];

  if (moduloActivo === 'pedidos' && filtroFecha) {
    const [year, month, day] = filtroFecha.split('-');
    const fechaFormateada = `${day}/${month}/${year}`;
    const fechaFormateadaCorta = `${parseInt(day)}/${parseInt(month)}/${year}`;

    datosProcesados = datosProcesados.filter(item => {
      if (!item.fecha) return false;
      return item.fecha.includes(fechaFormateada) || item.fecha.includes(fechaFormateadaCorta);
    });
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    const esquema = tenant?.modules[moduloActivo];
    if (esquema) {
      datosProcesados = datosProcesados.filter((item) => {
        return esquema.fields.some((field: any) => {
          const val = item[field.name];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
      });
    }
  }

  // ==========================================
  // ⚡ LÓGICA DE SELECCIÓN MÚLTIPLE
  // ==========================================
  const handleToggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === datosProcesados.length && datosProcesados.length > 0) {
      setSelectedIds([]); 
    } else {
      setSelectedIds(datosProcesados.map(item => item.id)); 
    }
  };

  const ejecutarEliminacionMultiple = async () => {
    if (!tenant || !repository || !moduloActivo || selectedIds.length === 0) return;
    
    const esDefinitivo = verPapelera;
    if (!window.confirm(`¿Estás seguro de ${esDefinitivo ? 'destruir' : 'eliminar'} ${selectedIds.length} registros al mismo tiempo?`)) return;

    const repo: any = repository;
    const colName = tenant.modules[moduloActivo].collectionName;

    try {
      const promesas = selectedIds.map(id => 
        esDefinitivo ? repo.hardDelete(colName, id) : repo.delete(colName, id)
      );
      await Promise.all(promesas);
      
      mostrarMensaje(`¡${selectedIds.length} registros procesados con éxito!`, "exito");
      setSelectedIds([]); 
      await cargarDatos();
    } catch (error) {
      mostrarMensaje("Error en la operación múltiple", "error");
    }
  };

  if (isLoading || authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <h2 style={{ marginTop: '20px', color: '#1e40af' }}>Cargando entorno...</h2>
      </div>
    );
  }

  if (!tenant) return <p>No se encontró configuración.</p>;

  return (
    <div className="crm-layout">
      
      {/* 🚀 CAPA 1: MENÚ LATERAL (SIDEBAR) */}
      <aside className={`crm-sidebar ${menuMovilAbierto ? 'abierto' : ''}`}>
        <div className="sidebar-brand">
          <div className="crm-avatar" style={{ backgroundColor: tenant.themeColor }}>
            {tenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="crm-title">{tenant.name}</h1>
            <span className="crm-subtitle" style={{ color: tenant.themeColor }}>SaaS Engine</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-label">General</p>
          
          <button 
            onClick={() => handleCambiarModulo('dashboard')} 
            className={`nav-item ${moduloActivo === 'dashboard' ? 'active' : ''}`} 
            style={{ 
              backgroundColor: moduloActivo === 'dashboard' ? `${tenant.themeColor}15` : 'transparent', 
              color: moduloActivo === 'dashboard' ? tenant.themeColor : '#4b5563', 
              borderRight: moduloActivo === 'dashboard' ? `4px solid ${tenant.themeColor}` : '4px solid transparent' 
            }}
          >
            📊 Panel General
          </button>
          
          <button 
            onClick={() => handleCambiarModulo('whatsapp')} 
            className={`nav-item ${moduloActivo === 'whatsapp' ? 'active' : ''}`} 
            style={{ 
              backgroundColor: moduloActivo === 'whatsapp' ? `${tenant.themeColor}15` : 'transparent', 
              color: moduloActivo === 'whatsapp' ? tenant.themeColor : '#4b5563', 
              borderRight: moduloActivo === 'whatsapp' ? `4px solid ${tenant.themeColor}` : '4px solid transparent' 
            }}
          >
            📱 WhatsApp Bot
          </button>

          <p className="nav-label" style={{ marginTop: '25px' }}>Módulos del Negocio</p>
          
          {Object.entries(tenant.modules)
          .sort((a: any, b: any) => (a[1].orden || 99) - (b[1].orden || 99))
          .map(([key, config]: [string, any]) => {
            const isActive = moduloActivo === key;
            return (
              <button
                key={key}
                onClick={() => handleCambiarModulo(key)}
                className={`nav-item ${isActive ? 'active' : ''}`}
                style={{ 
                  backgroundColor: isActive ? `${tenant.themeColor}15` : 'transparent', 
                  color: isActive ? tenant.themeColor : '#4b5563', 
                  borderRight: isActive ? `4px solid ${tenant.themeColor}` : '4px solid transparent' 
                }}
              >
                📁 {config.title}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info-mini">
            <span className="user-email-mini" title={user?.email || ''}>{user?.email}</span>
            <span className="user-role-mini">Administrador de Cuenta</span>
          </div>
          <button onClick={logout} className="btn-logout-sidebar">🚪 Cerrar Sesión</button>
        </div>
      </aside>

      {/* 🌑 OVERLAY MÓVIL: Oscurece el fondo cuando el menú está abierto en el celular */}
      {menuMovilAbierto && <div className="mobile-overlay" onClick={() => setMenuMovilAbierto(false)}></div>}

      {/* 🚀 CAPA 2: ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="crm-main-content">
        
        {/* HEADER MÓVIL (Solo visible en celulares) */}
        <header className="mobile-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div className="crm-avatar-mini" style={{ backgroundColor: tenant.themeColor }}>{tenant.name.charAt(0)}</div>
             <span style={{ color: '#1f2937', fontWeight: 'bold', fontSize: '1.1rem' }}>{tenant.name}</span>
           </div>
           <button className="btn-hamburger" onClick={() => setMenuMovilAbierto(true)}>☰</button>
        </header>

        {/* NOTIFICACIONES */}
        {mensaje && (
          <div className={`toast-notification ${mensaje.tipo === 'exito' ? 'toast-success' : 'toast-error'}`}>
            {mensaje.texto}
          </div>
        )}

        {/* 🚀 BARRA DE HERRAMIENTAS AVANZADA (Oculta en Dashboard y WhatsApp) */}
        {moduloActivo !== 'dashboard' && moduloActivo !== 'whatsapp' && (
          <div className="crm-toolbar" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', alignItems: 'center', marginBottom: '20px' }}>
            
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
              <div className="search-wrapper" style={{ position: 'relative', width: '100%', maxWidth: '350px' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
                <input 
                  type="search" 
                  placeholder={`Buscar en ${tenant.modules[moduloActivo]?.title}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '10px 15px 10px 35px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', outline: 'none', backgroundColor: 'white' }}
                />
              </div>
              
              {moduloActivo === 'pedidos' && (
                <div className="date-filter-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '4px 12px', borderRadius: '8px', border: '1px solid #d1d5db' }}>
                  <span style={{ fontSize: '1.1rem' }}>📅</span>
                  <input 
                    type="date" 
                    value={filtroFecha}
                    onChange={(e) => setFiltroFecha(e.target.value)}
                    style={{ border: 'none', outline: 'none', color: '#4b5563', backgroundColor: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}
                    title="Filtrar por fecha"
                  />
                  {filtroFecha && (
                    <button onClick={() => setFiltroFecha('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontWeight: 'bold', padding: '0 5px' }} title="Quitar filtro">✖</button>
                  )}
                </div>
              )}
            </div>

            <div className="toolbar-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              {selectedIds.length > 0 && (
                <button onClick={ejecutarEliminacionMultiple} style={{ backgroundColor: '#ef4444', color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', animation: 'fadeIn 0.2s' }}>
                  {verPapelera ? '🔥 Destruir' : '🗑️ Eliminar'} ({selectedIds.length})
                </button>
              )}

              <button 
                onClick={() => setVerPapelera(!verPapelera)}
                className="btn-trash-toggle"
                style={{ backgroundColor: verPapelera ? '#fef2f2' : 'white', color: verPapelera ? '#ef4444' : '#374151', border: `1px solid ${verPapelera ? '#ef4444' : '#d1d5db'}`, padding: '10px 15px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
              >
                {verPapelera ? '📂 Volver a Registros' : '🗑️ Papelera'}
              </button>
              
              {!verPapelera && (
                <button 
                  onClick={() => { setRegistroEnEdicion(null); setModalAbierto(true); }} 
                  className="btn-new-record"
                  style={{ backgroundColor: tenant.themeColor, color: 'white', padding: '10px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  + Nuevo Registro
                </button>
              )}
            </div>
          </div>
        )}

        {/* TABLA O COMPONENTES */}
        <div 
          className="content-wrapper" 
          style={{ 
            backgroundColor: moduloActivo === 'dashboard' ? 'transparent' : 'white', 
            boxShadow: moduloActivo === 'dashboard' ? 'none' : '0 4px 6px rgba(0,0,0,0.05)', 
            padding: moduloActivo === 'dashboard' ? '0' : '20px',
            borderRadius: '12px',
            border: moduloActivo === 'dashboard' ? 'none' : '1px solid #f3f4f6'
          }}
        >
          {moduloActivo === 'dashboard' ? (
            <Dashboard tenant={tenant} repository={repository} />
          ) : moduloActivo === 'whatsapp' ? (
            <WhatsAppConnector tenantId={tenant.id} />
          ) : (
            moduloActivo && tenant.modules[moduloActivo] && (
              <DynamicTable 
                schema={tenant.modules[moduloActivo]} 
                data={datosProcesados} 
                onEdit={!verPapelera ? (reg) => { setRegistroEnEdicion(reg); setModalAbierto(true); } : undefined}
                onDelete={(id: string) => setRegistroAEliminar(id)} 
                onRestore={verPapelera ? (id: string) => handleRestaurarRegistro(id) : undefined}
                isTrashView={verPapelera}
                selectedIds={selectedIds}
                onToggleSelect={handleToggleSelect}
                onToggleSelectAll={handleToggleSelectAll}
              />
            )
          )}
        </div>

      </main>

      {/* MODALES */}
      {modalAbierto && (
        <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={registroEnEdicion ? 'Editar Registro' : 'Nuevo Registro'}>
          <DynamicForm schema={tenant.modules[moduloActivo]} initialData={registroEnEdicion || {}} onSubmit={handleGuardarRegistro} onCancel={() => setModalAbierto(false)} />
        </Modal>
      )}

      {registroAEliminar && (
        <Modal isOpen={!!registroAEliminar} onClose={() => setRegistroAEliminar(null)} title="⚠️ Confirmar Acción">
          <div style={{ padding: '10px 20px', textAlign: 'center', color: 'black' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '25px', fontWeight: '500' }}>
              {verPapelera ? "Este registro será destruido de forma permanente. Esta acción no se puede deshacer. ¿Deseas continuar?" : "¿Estás seguro de que deseas mover este registro a la papelera?"}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button onClick={() => setRegistroAEliminar(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 'bold' }}>Cancelar</button>
              <button onClick={ejecutarEliminacion} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
                {verPapelera ? "Sí, Destruir" : "Sí, Enviar a Papelera"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider> 
        <TenantProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/crear-password" element={<SetupPasswordPage />} />
            <Route path="/superadmin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} />
            <Route path="/" element={<ProtectedRoute><PanelCRM /></ProtectedRoute>} />
          </Routes>
        </TenantProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}