import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';

interface DashboardProps {
  tenant: any;
  repository: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenant, repository }) => {
  // 🧠 Llamamos a nuestro hook (El Cerebro)
  const { metricas, datosGrafico, actividadReciente, pedidosRaw, cargando } = useDashboardMetrics(tenant, repository);

  // 📥 FUNCIÓN PARA EXPORTAR EL REPORTE GERENCIAL (CORREGIDO)
  const descargarReporteGerencial = () => {
    if (pedidosRaw.length === 0) return alert("No hay pedidos para exportar aún.");
    
    import('../../core/utils/ExportService').then(mod => {
      const esquemaGerencial = {
        title: "Reporte_Gerencial_Dashboard",
        fields: [
          { name: "id", label: "ID Pedido" },
          { name: "fecha", label: "Fecha de Registro" },
          { name: "cliente", label: "Nombre del Cliente" },
          { name: "zona", label: "Zona de Envío" },
          { name: "totalPagado", label: "Total Ingresado (S/)" },
          { name: "estado", label: "Estado Actual" }
        ]
      };
      mod.exportToExcel(pedidosRaw, esquemaGerencial);
    });
  };

  if (cargando) {
    return (
      <div style={{ padding: '60px', textAlign: 'center', color: '#6b7280' }}>
        <div className="spinner" style={{ margin: '0 auto', marginBottom: '15px' }}></div>
        Generando analíticas del negocio...
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      
      {/* 🚀 BARRA DE ACCIONES RÁPIDAS */}
      <div className="quick-actions">
        <h2 style={{ fontSize: '1.2rem', margin: 0, color: '#1f2937' }}>Visión General</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={descargarReporteGerencial} className="btn-quick-action outline" style={{ cursor: 'pointer' }}>
            📄 Descargar Reporte
          </button>
        </div>
      </div>

      {/* 💳 FILA 1: KPIs PREMIUM */}
      <div className="kpi-grid">
        <div className="kpi-card success">
          <div className="kpi-icon">💰</div>
          <div>
            <p className="kpi-label">Ingresos Verificados</p>
            <h2 className="kpi-value">S/ {metricas.totalIngresos.toFixed(2)}</h2>
          </div>
        </div>
        <div className="kpi-card warning">
          <div className="kpi-icon">⏳</div>
          <div>
            <p className="kpi-label">Pedidos en Cola</p>
            <h2 className="kpi-value">{metricas.pedidosPendientes}</h2>
          </div>
        </div>
        <div className="kpi-card neutral">
          <div className="kpi-icon">📦</div>
          <div>
            <p className="kpi-label">Total Módulos Activos</p>
            <h2 className="kpi-value">{Object.keys(tenant.modules).length}</h2>
          </div>
        </div>
      </div>

      {/* 📊 FILA 2: GRÁFICOS Y ACTIVIDAD */}
      <div className="dashboard-main-grid">
        
        {/* GRÁFICO DE TENDENCIAS */}
        <div className="chart-container">
          <h3 className="section-title">Tendencia de Ingresos (Últimas Ventas)</h3>
          {datosGrafico.length > 0 ? (
            // 🛠️ FIX DE RECHARTS: Contenedor con minHeight estricto
            <div style={{ width: '100%', height: '300px', minHeight: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={datosGrafico} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={tenant.themeColor} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={tenant.themeColor} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="fecha" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `S/${value}`} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
                    formatter={(value: any) => [`S/ ${Number(value || 0).toFixed(2)}`, 'Ingresos']}
                  />
                  <Area type="monotone" dataKey="ingresos" stroke={tenant.themeColor} strokeWidth={3} fillOpacity={1} fill="url(#colorIngresos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="empty-chart">No hay suficientes datos de ventas para generar el gráfico.</div>
          )}
        </div>

        {/* FEED DE ACTIVIDAD RECIENTE */}
        <div className="activity-container">
          <h3 className="section-title">Actividad Reciente</h3>
          <div className="activity-list">
            {actividadReciente.map((item, index) => (
              <div key={item.id || index} className="activity-item">
                <div className="activity-dot" style={{ backgroundColor: tenant.themeColor }}></div>
                <div className="activity-content">
                  <p className="activity-text">Registro en <strong>{item._modulo}</strong></p>
                  <span className="activity-id">ID: {item.id ? item.id.substring(0,8) : 'Nuevo'}...</span>
                </div>
              </div>
            ))}
            {actividadReciente.length === 0 && (
              <p style={{ color: '#9ca3af', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No hay actividad reciente.</p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;