// src/features/admin/SuperAdminDashboard.tsx
import { useState, useEffect } from 'react';
import { collection, getDocs, doc, updateDoc, setDoc } from 'firebase/firestore'; 
import { masterDb } from '../../infrastructure/database/firebaseManager';
import { useAuth } from '../auth/AuthContext';
import { invitarCliente } from '../auth/authService';
import { Modal } from '../../ui/components/Modal';

// IMPORTANTE: Importamos nuestro nuevo archivo de diseño
import './SuperAdminDashboard.css';

interface Cliente {
  id: string;
  email: string;
  estado: string;
  configuracionSaaS?: any;
}

export const SuperAdminDashboard = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'exito' | 'error'} | null>(null);
  const [cargando, setCargando] = useState<boolean>(true);
  const { logout, user } = useAuth();

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteId, setInviteId] = useState('');

  useEffect(() => { cargarClientes(); }, []);

  const mostrarMensaje = (texto: string, tipo: 'exito' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarClientes = async () => {
    setCargando(true);
    try {
      const snap = await getDocs(collection(masterDb, "clientes_config"));
      const lista = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Cliente));
      setClientes(lista.filter(c => c.estado !== 'Eliminado'));
    } catch (e) { mostrarMensaje("Error al conectar", "error"); }
    finally { setCargando(false); }
  };

  const handleEjecutarInvitacion = async (e: React.FormEvent) => {
    e.preventDefault();
    mostrarMensaje("Registrando...", "exito");
    try {
      await setDoc(doc(masterDb, "clientes_config", inviteId), { email: inviteEmail, estado: "Activo", createdAt: new Date().toISOString() });
      const res = await invitarCliente(inviteEmail);
      if (res.success) {
        mostrarMensaje("¡Invitación enviada!", "exito");
        setShowInviteModal(false); setInviteEmail(''); setInviteId('');
        cargarClientes();
      } else { mostrarMensaje("Error al enviar correo", "error"); }
    } catch (err) { mostrarMensaje("Error al invitar", "error"); }
  };

  const handleReiniciarAcceso = async (email: string) => {
    mostrarMensaje(`Reenviando acceso a ${email}...`, "exito");
    const res = await invitarCliente(email);
    res.success ? mostrarMensaje("Correo enviado", "exito") : mostrarMensaje("Error de envío", "error");
  };

  const handleEliminarCliente = async (idCliente: string) => {
    if (!window.confirm("¿Estás seguro de desactivar este cliente?")) return;
    try {
      await updateDoc(doc(masterDb, "clientes_config", idCliente), { estado: 'Eliminado' });
      mostrarMensaje("Cliente movido a papelera", "exito");
      cargarClientes();
    } catch (error) { mostrarMensaje("Error al eliminar", "error"); }
  };

  const handleSubirJSON = (idCliente: string) => {
    const input = document.createElement('input');
    input.type = 'file'; input.accept = '.json';
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const json = JSON.parse(event.target?.result as string);
          await updateDoc(doc(masterDb, "clientes_config", idCliente), { configuracionSaaS: json, ultimaActualizacion: new Date().toISOString() });
          mostrarMensaje("Configuración actualizada", "exito");
          cargarClientes();
        } catch (err) { mostrarMensaje("Archivo JSON inválido", "error"); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  return (
    <div className="bunker-container">
      
      {/* HEADER BÚNKER PREMIUM */}
      <div className="bunker-header">
        <div className="header-brand">
          <div className="header-icon">🛡️</div>
          <div>
            <h1 className="header-title">Búnker Central</h1>
            <span className="header-subtitle">NOVAWEB SAAS ENGINE</span>
          </div>
        </div>
        <div className="header-user-section">
          <div className="user-info">
            <span className="user-role">Súper Administrador</span>
            <span className="user-email">{user?.email}</span>
          </div>
          <button onClick={logout} className="btn-logout">Cerrar Sesión</button>
        </div>
      </div>

      {/* NOTIFICACIONES */}
      {mensaje && (
        <div className={`toast-notification ${mensaje.tipo === 'exito' ? 'toast-success' : 'toast-error'}`}>
          {mensaje.texto}
        </div>
      )}

      {/* TABLA DE DIRECTORIO */}
      <div className="directory-card">
        <div className="directory-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 className="header-title" style={{ margin: 0 }}>Directorio de Clientes</h2>
            <span className="badge-connected">
              <span className="dot-indicator"></span> Conectado
            </span>
          </div>
          <button onClick={() => setShowInviteModal(true)} className="btn-primary">+ Invitar Nuevo Cliente</button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="bunker-table">
            <thead>
              <tr>
                <th>ID Cliente</th>
                <th>Correo Asignado</th>
                <th>Estado</th>
                <th>Archivo Maestro</th>
                <th style={{ textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td style={{ fontWeight: 'bold' }}>{cliente.id}</td>
                  <td>{cliente.email}</td>
                  <td><span className="badge-active">● Activo</span></td>
                  <td>
                    <button onClick={() => handleSubirJSON(cliente.id)} className="btn-action" style={{ border: cliente.configuracionSaaS ? '1px solid #10b981' : 'none', color: cliente.configuracionSaaS ? '#10b981' : 'white', backgroundColor: cliente.configuracionSaaS ? 'transparent' : '#374151' }}>
                      {cliente.configuracionSaaS ? '✅ JSON Subido' : '⬆️ Subir Plano'}
                    </button>
                  </td>
                  <td style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={() => handleReiniciarAcceso(cliente.email)} title="Reiniciar Acceso" className="btn-action btn-warning">🔄</button>
                    <button onClick={() => handleEliminarCliente(cliente.id)} title="Eliminar" className="btn-action btn-danger">🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {cargando && <p style={{ textAlign: 'center', marginTop: '20px', color: '#94a3b8' }}>Sincronizando con la base de datos central...</p>}
      </div>

      {/* MODAL DE INVITACIÓN */}
      {showInviteModal && (
        <Modal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} title="Registrar Nuevo Cliente">
          <form onSubmit={handleEjecutarInvitacion} className="modal-form">
            <div>
              <label>ID del Cliente</label>
              <input type="text" placeholder="chocopiura" value={inviteId} onChange={(e) => setInviteId(e.target.value.toLowerCase().replace(/\s/g, ''))} required />
            </div>
            <div>
              <label>Correo Electrónico</label>
              <input type="email" placeholder="cliente@gmail.com" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
            </div>
            <button type="submit" className="btn-primary" style={{ padding: '12px' }}>Confirmar y Enviar</button>
          </form>
        </Modal>
      )}
    </div>
  );
};