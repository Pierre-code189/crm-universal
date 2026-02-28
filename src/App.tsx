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

// 🧠 Importamos la Arquitectura Separada
import { useDataManager } from './hooks/useDataManager';
import { useCrudModule } from './hooks/useCrudModule';
import { Sidebar } from './ui/layout/Sidebar';
import { ModuleToolbar } from './ui/layout/ModuleToolbar';

import { EmptyState } from './ui/components/EmptyState';

import './App.css';

const PanelCRM = () => {
  const { tenant, isLoading, repository } = useTenant();
  const { user, logout, isLoading: authLoading } = useAuth();

  // Estados UI Básicos
  const [moduloActivo, setModuloActivo] = useState<string>('dashboard');
  const [modalAbierto, setModalAbierto] = useState(false);
  const [registroEnEdicion, setRegistroEnEdicion] = useState<any | null>(null);
  const [verPapelera, setVerPapelera] = useState(false);
  const [registroAEliminar, setRegistroAEliminar] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  // 1. Conectamos Base de Datos (Firebase)
  const { datosModulo, mensaje, cargarDatos, handleGuardarRegistro, ejecutarEliminacion, handleRestaurarRegistro, ejecutarEliminacionMultiple } = useCrudModule(tenant, repository, moduloActivo, verPapelera);

  // 2. Conectamos Filtros y Paginación (RAM)
  const { searchTerm, setSearchTerm, filtroFecha, setFiltroFecha, paginaActual, setPaginaActual, datosPaginados, totalPaginas, datosFiltrados, resetFilters } = useDataManager({ datosModulo, moduloActivo, tenant });

  // Efecto de inicialización al cambiar de pantalla
  useEffect(() => {
    resetFilters();
    setSelectedIds([]);
    cargarDatos();
  }, [moduloActivo, tenant, verPapelera]);

  const handleCambiarModulo = (modulo: string) => {
    setModuloActivo(modulo);
    setVerPapelera(false);
    setMenuMovilAbierto(false); 
  };

  if (isLoading || authLoading) return <div className="loading-container"><div className="spinner"></div></div>;
  if (!tenant) return <p>No se encontró configuración.</p>;

  return (
    <div className="crm-layout">
      
      {/* 🧩 COMPONENTE AISLADO: Sidebar */}
      <Sidebar tenant={tenant} user={user} moduloActivo={moduloActivo} menuMovilAbierto={menuMovilAbierto} handleCambiarModulo={handleCambiarModulo} logout={logout} />
      {menuMovilAbierto && <div className="mobile-overlay" onClick={() => setMenuMovilAbierto(false)}></div>}

      <main className="crm-main-content">
        <header className="mobile-header">
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
             <div className="crm-avatar-mini" style={{ backgroundColor: tenant.themeColor }}>{tenant.name.charAt(0)}</div>
             <span style={{ color: '#1f2937', fontWeight: 'bold' }}>{tenant.name}</span>
           </div>
           <button className="btn-hamburger" onClick={() => setMenuMovilAbierto(true)}>☰</button>
        </header>

        {mensaje && <div className={`toast-notification ${mensaje.tipo === 'exito' ? 'toast-success' : 'toast-error'}`}>{mensaje.texto}</div>}

        {/* 🧩 COMPONENTE AISLADO: Barra de Herramientas */}
        <ModuleToolbar 
          moduloActivo={moduloActivo} tenant={tenant} searchTerm={searchTerm} setSearchTerm={setSearchTerm} filtroFecha={filtroFecha} setFiltroFecha={setFiltroFecha}
          verPapelera={verPapelera} setVerPapelera={setVerPapelera} selectedIds={selectedIds} ejecutarEliminacionMultiple={() => ejecutarEliminacionMultiple(selectedIds, () => setSelectedIds([]))}
          datosFiltrados={datosFiltrados} setRegistroEnEdicion={setRegistroEnEdicion} setModalAbierto={setModalAbierto}
        />

        <div className="content-wrapper" style={{ backgroundColor: moduloActivo === 'dashboard' ? 'transparent' : 'white', boxShadow: moduloActivo === 'dashboard' ? 'none' : '0 4px 6px rgba(0,0,0,0.05)', padding: moduloActivo === 'dashboard' ? '0' : '20px', borderRadius: '12px', border: moduloActivo === 'dashboard' ? 'none' : '1px solid #f3f4f6' }}>
          {moduloActivo === 'dashboard' ? <Dashboard tenant={tenant} repository={repository} /> : 
           moduloActivo === 'whatsapp' ? <WhatsAppConnector tenantId={tenant.id} /> : (
            tenant.modules[moduloActivo] && (
              <>
                {/* LÓGICA DE EMPTY STATES */}
                {datosModulo.length === 0 && !searchTerm && !filtroFecha ? (
                  <EmptyState 
                    title={`Sin registros en ${tenant.modules[moduloActivo].title}`}
                    description={`Tu base de datos de ${tenant.modules[moduloActivo].title} está completamente vacía. Comienza añadiendo nueva información.`}
                    icon="📂"
                    actionLabel="+ Crear el primer registro"
                    onAction={() => { setRegistroEnEdicion(null); setModalAbierto(true); }}
                    themeColor={tenant.themeColor}
                  />
                ) : datosFiltrados.length === 0 ? (
                  <EmptyState 
                    title="No hay resultados"
                    description={`No encontramos ningún registro que coincida con tus filtros actuales. Intenta buscando con otras palabras.`}
                    icon="🔍"
                    actionLabel="Limpiar filtros"
                    onAction={() => { setSearchTerm(''); setFiltroFecha(''); }}
                    themeColor={tenant.themeColor}
                  />
                ) : (
                  <>
                    <DynamicTable 
                      schema={tenant.modules[moduloActivo]} data={datosPaginados} 
                      onEdit={!verPapelera ? (reg) => { setRegistroEnEdicion(reg); setModalAbierto(true); } : undefined}
                      onDelete={(id) => setRegistroAEliminar(id)} onRestore={verPapelera ? handleRestaurarRegistro : undefined}
                      isTrashView={verPapelera} selectedIds={selectedIds} 
                      onToggleSelect={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])}
                      onToggleSelectAll={() => setSelectedIds(selectedIds.length === datosFiltrados.length ? [] : datosFiltrados.map(i => i.id))}
                    />

                    {/* CONTROLES DE PAGINACIÓN */}
                    {datosFiltrados.length > 10 && (
                      <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px', marginTop: '20px' }}>
                        <button disabled={paginaActual === 1} onClick={() => setPaginaActual(prev => prev - 1)} style={{ padding: '8px 15px', borderRadius: '6px', cursor: paginaActual === 1 ? 'not-allowed' : 'pointer' }}>⬅️ Anterior</button>
                        <span style={{ color: '#4b5563' }}>Página <strong>{paginaActual}</strong> de {totalPaginas}</span>
                        <button disabled={paginaActual === totalPaginas} onClick={() => setPaginaActual(prev => prev + 1)} style={{ padding: '8px 15px', borderRadius: '6px', cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer' }}>Siguiente ➡️</button>
                      </div>
                    )}
                  </>
                )}
              </>
            )
          )}
        </div>
      </main>

      {modalAbierto && (
        <Modal isOpen={modalAbierto} onClose={() => setModalAbierto(false)} title={registroEnEdicion ? 'Editar Registro' : 'Nuevo Registro'}>
          <DynamicForm schema={tenant.modules[moduloActivo]} initialData={registroEnEdicion || {}} onSubmit={(datos) => handleGuardarRegistro(datos, registroEnEdicion, () => setModalAbierto(false))} onCancel={() => setModalAbierto(false)} />
        </Modal>
      )}

      {registroAEliminar && (
        <Modal isOpen={!!registroAEliminar} onClose={() => setRegistroAEliminar(null)} title="⚠️ Confirmar Acción">
          <div style={{ padding: '10px 20px', textAlign: 'center', color: 'black' }}>
            <p style={{ fontSize: '1.1rem', marginBottom: '25px', fontWeight: '500' }}>{verPapelera ? "Este registro será destruido permanentemente. ¿Deseas continuar?" : "¿Deseas mover este registro a la papelera?"}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px' }}>
              <button onClick={() => setRegistroAEliminar(null)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancelar</button>
              <button onClick={() => ejecutarEliminacion(registroAEliminar, () => setRegistroAEliminar(null))} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: '#ef4444', color: 'white', cursor: 'pointer' }}>
                {verPapelera ? "Sí, Destruir" : "Sí, a Papelera"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default function App() { return <BrowserRouter><AuthProvider><TenantProvider><Routes><Route path="/login" element={<LoginPage />} /><Route path="/crear-password" element={<SetupPasswordPage />} /><Route path="/superadmin" element={<SuperAdminRoute><SuperAdminDashboard /></SuperAdminRoute>} /><Route path="/" element={<ProtectedRoute><PanelCRM /></ProtectedRoute>} /></Routes></TenantProvider></AuthProvider></BrowserRouter>; }