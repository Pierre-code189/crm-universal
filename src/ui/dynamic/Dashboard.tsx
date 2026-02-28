// src/ui/dynamic/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface DashboardProps {
  tenant: any;
  repository: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenant, repository }) => {
  const [metricas, setMetricas] = useState<any>({ totalIngresos: 0, pedidosPendientes: 0, conteoPorModulo: {} });
  const [datosGrafico, setDatosGrafico] = useState<any[]>([]);
  const [actividadReciente, setActividadReciente] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const calcularMetricas = async () => {
      setCargando(true);
      const nuevasMetricas: any = { totalIngresos: 0, pedidosPendientes: 0, conteoPorModulo: {} };
      const ventasPorDia: Record<string, number> = {};
      let todosLosRegistros: any[] = [];

      try {
        const modulos = Object.keys(tenant.modules);
        const promesas = modulos.map(async (key) => {
          const collectionName = tenant.modules[key].collectionName;
          const data = await repository.getAll(collectionName, false);
          return { key, data };
        });

        const resultados = await Promise.all(promesas);

        resultados.forEach(({ key, data }) => {
          nuevasMetricas.conteoPorModulo[key] = data.length;

          // Extraemos los últimos registros para el feed de actividad
          const registrosConModulo = data.map((d: any) => ({ ...d, _modulo: tenant.modules[key].title }));
          todosLosRegistros = [...todosLosRegistros, ...registrosConModulo];

          if (key === 'pedidos') {
            data.forEach((pedido: any) => {
              const estadoStr = String(pedido.estado || '');
              const monto = Number(pedido.totalPagado) || 0;

              if (estadoStr.includes('Entregado')) {
                nuevasMetricas.totalIngresos += monto;
                
                // 📊 LÓGICA PARA EL GRÁFICO: Agrupar por fecha
                const fechaCorta = pedido.fecha ? pedido.fecha.split(',')[0].trim() : 'Sin Fecha';
                if (ventasPorDia[fechaCorta]) {
                  ventasPorDia[fechaCorta] += monto;
                } else {
                  ventasPorDia[fechaCorta] = monto;
                }
              }

              if (estadoStr.includes('Pendiente')) {
                nuevasMetricas.pedidosPendientes++;
              }
            });
          }
        });

        // Formatear datos para Recharts
        const chartData = Object.keys(ventasPorDia).map(fecha => ({
          fecha: fecha,
          ingresos: ventasPorDia[fecha]
        })).slice(-7); // Tomamos solo los últimos 7 días con ventas

        // Ordenar actividad reciente (simulada ordenando al revés por ahora)
        const ultimos5 = todosLosRegistros.reverse().slice(0, 5);

        setMetricas(nuevasMetricas);
        setDatosGrafico(chartData);
        setActividadReciente(ultimos5);
      } catch (error) {
        console.error("Error calculando métricas:", error);
      } finally {
        setCargando(false);
      }
    };

    calcularMetricas();
  }, [tenant, repository]);

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
          <button className="btn-quick-action outline">📄 Descargar Reporte</button>
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
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
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