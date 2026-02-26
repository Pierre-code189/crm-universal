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
import { Dashboard } from './ui/dynamic/Dashboard'; // Importación correcta del Dashboard
import WhatsAppConnector from './ui/dynamic/WhatsAppConnector';

import './App.css';

const PanelCRM = () => {
  const { tenant, isLoading, repository } = useTenant();
  const { user, logout, isLoading: authLoading } = useAuth();

  // Iniciamos por defecto en 'dashboard' (todo en minúscula)
  const [moduloActivo, setModuloActivo] = useState<string>('dashboard');
  const [datosModulo, setDatosModulo] = useState<any[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<any | null>(null);
  const [verPapelera, setVerPapelera] = useState(false);
  
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'exito' | 'error'} | null>(null);
  const [registroAEliminar, setRegistroAEliminar] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, [moduloActivo, tenant, verPapelera]);

  const mostrarMensaje = (texto: string, tipo: 'exito' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarDatos = async () => {
    // Si estamos en el dashboard, no cargamos datos de tabla
    if (!tenant || !repository || moduloActivo === 'dashboard') return;
    
    setDatosModulo([]); // Anti-fantasmas
    const esquemaActual = tenant.modules[moduloActivo];
    const repo: any = repository;
    try {
      const data = await repo.getAll(esquemaActual.collectionName, verPapelera);
      setDatosModulo(data);
    } catch (error) {
      console.error("🕵️‍♂️ EL VERDADERO ERROR AL CARGAR LA TABLA ES:", error);
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
        {/* Pestaña Fija: Dashboard */}

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

        {/* Pestañas Dinámicas */}
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

      {/* CONTROLES (Solo se muestran si NO estamos en el dashboard) */}
      {moduloActivo !== 'dashboard' && (
        <div className="crm-toolbar">
          <div className="badge-db-connected">
            <span className="dot-green"></span> Base de Datos Conectada
          </div>

          <div className="toolbar-actions">
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

      {/* ÁREA DE CONTENIDO (Aquí se invoca el Dashboard y desaparece el error de TS) */}
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
              data={datosModulo} 
              onEdit={!verPapelera ? (reg) => { setRegistroEnEdicion(reg); setModalAbierto(true); } : undefined}
              onDelete={(id: string) => setRegistroAEliminar(id)} 
              onRestore={verPapelera ? (id: string) => handleRestaurarRegistro(id) : undefined}
              isTrashView={verPapelera}
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

      {/* MODAL ELEGANTE DE CONFIRMACIÓN DE BORRADO */}
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