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

  // 🚀 NUEVOS ESTADOS DE UX AVANZADA
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filtroHoy, setFiltroHoy] = useState(false);

  useEffect(() => {
    // 🧹 Limpiamos selecciones y búsquedas al cambiar de pantalla
    setSearchTerm('');
    setSelectedIds([]);
    setFiltroHoy(false);
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

  // ==========================================
  // 🧠 MOTOR DE DATOS PROCESADOS (Filtros en Vivo)
  // ==========================================
  let datosProcesados = [...datosModulo];

  // 1. Filtro Temporal (Pedidos del Día)
  if (moduloActivo === 'pedidos' && filtroHoy) {
    const hoyStr = new Date().toLocaleDateString('es-PE', { timeZone: 'America/Lima' });
    datosProcesados = datosProcesados.filter(item => {
      // Si el bot de Node.js guarda la fecha como "15/02/2026, 14:30:00"
      return item.fecha && item.fecha.includes(hoyStr);
    });
  }

  // 2. Buscador Inteligente
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
      setSelectedIds([]); // Deseleccionar todos
    } else {
      setSelectedIds(datosProcesados.map(item => item.id)); // Seleccionar todos los visibles
    }
  };

  const ejecutarEliminacionMultiple = async () => {
    if (!tenant || !repository || !moduloActivo || selectedIds.length === 0) return;
    
    const esDefinitivo = verPapelera;
    if (!window.confirm(`¿Estás seguro de ${esDefinitivo ? 'destruir' : 'eliminar'} ${selectedIds.length} registros al mismo tiempo?`)) return;

    const repo: any = repository;
    const colName = tenant.modules[moduloActivo].collectionName;

    try {
      // ¡Promesas en Paralelo para máxima velocidad!
      const promesas = selectedIds.map(id => 
        esDefinitivo ? repo.hardDelete(colName, id) : repo.delete(colName, id)
      );
      await Promise.all(promesas);
      
      mostrarMensaje(`¡${selectedIds.length} registros procesados con éxito!`, "exito");
      setSelectedIds([]); // Limpiamos selección
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
    <div className="crm-container">
      
      {/* HEADER */}
      <div className="crm-header">
        <div className="crm-brand">
          <div className="crm-avatar" style={{ backgroundColor: tenant.themeColor }}>
            {tenant.name.charAt(0)}
          </div>
          <div>
            <h1 className="crm-title">{tenant.name}</h1>
            <span className="crm-subtitle" style={{ color: tenant.themeColor }}>Panel Administrativo</span>
          </div>
        </div>
        <div className="crm-user-controls">
          <span className="crm-email">{user?.email}</span>
          <button onClick={logout} className="btn-logout-client">Salir</button>
        </div>
      </div>

      {/* NOTIFICACIONES */}
      {mensaje && (
        <div className={`toast-notification ${mensaje.tipo === 'exito' ? 'toast-success' : 'toast-error'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* PESTAÑAS */}
      <div className="crm-tabs">
        <button
          onClick={() => { setModuloActivo('whatsapp'); setVerPapelera(false); }}
          className="crm-tab-btn"
          style={{ backgroundColor: moduloActivo === 'whatsapp' ? tenant.themeColor : 'white', color: moduloActivo === 'whatsapp' ? 'white' : '#4b5563' }}
        >
          📱 WhatsApp Bot
        </button>

        <button
          onClick={() => { setModuloActivo('dashboard'); setVerPapelera(false); }}
          className="crm-tab-btn"
          style={{ backgroundColor: moduloActivo === 'dashboard' ? tenant.themeColor : 'white', color: moduloActivo === 'dashboard' ? 'white' : '#4b5563' }}
        >
          📊 Panel General
        </button>

        {Object.entries(tenant.modules)
        .sort((a: any, b: any) => (a[1].orden || 99) - (b[1].orden || 99))
        .map(([key, config]: [string, any]) => {
          const isActive = moduloActivo === key;
          return (
            <button
              key={key}
              onClick={() => { setModuloActivo(key); setVerPapelera(false); }}
              className="crm-tab-btn"
              style={{ backgroundColor: isActive ? tenant.themeColor : 'white', color: isActive ? 'white' : '#4b5563' }}
            >
              {config.title}
            </button>
          );
        })}
      </div>

      {/* 🚀 BARRA DE HERRAMIENTAS AVANZADA (Controles UX) */}
      {moduloActivo !== 'dashboard' && moduloActivo !== 'whatsapp' && (
        <div className="crm-toolbar" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', alignItems: 'center' }}>
          
          {/* Zona Izquierda: Buscador y Filtros */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flex: 1, minWidth: '300px' }}>
            <input 
              type="search" 
              placeholder={`🔍 Buscar en ${tenant.modules[moduloActivo]?.title}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ padding: '8px 15px', borderRadius: '8px', border: '1px solid #d1d5db', width: '100%', maxWidth: '350px', outline: 'none' }}
            />
            
            {moduloActivo === 'pedidos' && (
              <button 
                onClick={() => setFiltroHoy(!filtroHoy)}
                style={{ 
                  padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s',
                  backgroundColor: filtroHoy ? '#ecfdf5' : 'white', 
                  color: filtroHoy ? '#059669' : '#4b5563', 
                  border: `1px solid ${filtroHoy ? '#10b981' : '#d1d5db'}` 
                }}
              >
                {filtroHoy ? '📅 Solo Hoy' : '📅 Histórico'}
              </button>
            )}
          </div>

          {/* Zona Derecha: Acciones */}
          <div className="toolbar-actions" style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            
            {/* Botón Mágico: Eliminar Múltiple */}
            {selectedIds.length > 0 && (
              <button 
                onClick={ejecutarEliminacionMultiple}
                style={{ backgroundColor: '#ef4444', color: 'white', padding: '8px 15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', animation: 'fadeIn 0.2s' }}
              >
                {verPapelera ? '🔥 Destruir' : '🗑️ Eliminar'} ({selectedIds.length})
              </button>
            )}

            <button 
              onClick={() => setVerPapelera(!verPapelera)}
              className="btn-trash-toggle"
              style={{ backgroundColor: verPapelera ? '#fef2f2' : 'white', color: verPapelera ? '#ef4444' : '#374151', border: `1px solid ${verPapelera ? '#ef4444' : '#d1d5db'}` }}
            >
              {verPapelera ? '📂 Volver a Registros' : '🗑️ Papelera'}
            </button>
            
            {!verPapelera && (
              <button 
                onClick={() => { setRegistroEnEdicion(null); setModalAbierto(true); }} 
                className="btn-new-record"
                style={{ backgroundColor: tenant.themeColor }}
              >
                + Nuevo Registro
              </button>
            )}
          </div>
        </div>
      )}

      {/* ÁREA DE CONTENIDO */}
      <div 
        className="table-wrapper" 
        style={{ 
          backgroundColor: moduloActivo === 'dashboard' ? 'transparent' : 'white', 
          boxShadow: moduloActivo === 'dashboard' ? 'none' : '0 4px 6px rgba(0,0,0,0.05)', 
          padding: moduloActivo === 'dashboard' ? '0' : '20px' 
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
              
              // 🧠 Inyectamos los datos ya procesados por el buscador y el filtro de fecha
              data={datosProcesados} 
              
              onEdit={!verPapelera ? (reg) => { setRegistroEnEdicion(reg); setModalAbierto(true); } : undefined}
              onDelete={(id: string) => setRegistroAEliminar(id)} 
              onRestore={verPapelera ? (id: string) => handleRestaurarRegistro(id) : undefined}
              isTrashView={verPapelera}

              // ⚡ Inyectamos los controles de selección múltiple
              selectedIds={selectedIds}
              onToggleSelect={handleToggleSelect}
              onToggleSelectAll={handleToggleSelectAll}
            />
          )
        )}
      </div>

      {/* MODAL DE FORMULARIO */}
      {modalAbierto && (
        <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={registroEnEdicion ? 'Editar Registro' : 'Nuevo Registro'}>
          <DynamicForm schema={tenant.modules[moduloActivo]} initialData={registroEnEdicion || {}} onSubmit={handleGuardarRegistro} onCancel={() => setModalAbierto(false)} />
        </Modal>
      )}

      {/* MODAL ELEGANTE DE CONFIRMACIÓN DE BORRADO INDIVIDUAL */}
      {registroAEliminar && (
        <Modal isOpen={!!registroAEliminar} onClose={() => setRegistroAEliminar(null)} title="⚠️ Confirmar Acción">
          <div style={{ padding: '10px 20px', textAlign: 'center', color: 'black' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '25px', fontWeight: '500' }}>
              {verPapelera 
                ? "Este registro será destruido de forma permanente. Esta acción no se puede deshacer. ¿Deseas continuar?" 
                : "¿Estás seguro de que deseas mover este registro a la papelera?"}
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