import React from 'react';

interface SidebarProps {
  tenant: any;
  user: any;
  moduloActivo: string;
  menuMovilAbierto: boolean;
  handleCambiarModulo: (modulo: string) => void;
  logout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ tenant, user, moduloActivo, menuMovilAbierto, handleCambiarModulo, logout }) => {
  return (
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
        <button onClick={() => handleCambiarModulo('dashboard')} className={`nav-item ${moduloActivo === 'dashboard' ? 'active' : ''}`} style={{ backgroundColor: moduloActivo === 'dashboard' ? `${tenant.themeColor}15` : 'transparent', color: moduloActivo === 'dashboard' ? tenant.themeColor : '#4b5563', borderRight: moduloActivo === 'dashboard' ? `4px solid ${tenant.themeColor}` : '4px solid transparent' }}>📊 Panel General</button>
        <button onClick={() => handleCambiarModulo('whatsapp')} className={`nav-item ${moduloActivo === 'whatsapp' ? 'active' : ''}`} style={{ backgroundColor: moduloActivo === 'whatsapp' ? `${tenant.themeColor}15` : 'transparent', color: moduloActivo === 'whatsapp' ? tenant.themeColor : '#4b5563', borderRight: moduloActivo === 'whatsapp' ? `4px solid ${tenant.themeColor}` : '4px solid transparent' }}>📱 WhatsApp Bot</button>

        <p className="nav-label" style={{ marginTop: '25px' }}>Módulos del Negocio</p>
        {Object.entries(tenant.modules).sort((a: any, b: any) => (a[1].orden || 99) - (b[1].orden || 99)).map(([key, config]: [string, any]) => {
          const isActive = moduloActivo === key;
          return (
            <button key={key} onClick={() => handleCambiarModulo(key)} className={`nav-item ${isActive ? 'active' : ''}`} style={{ backgroundColor: isActive ? `${tenant.themeColor}15` : 'transparent', color: isActive ? tenant.themeColor : '#4b5563', borderRight: isActive ? `4px solid ${tenant.themeColor}` : '4px solid transparent' }}>
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
  );
};