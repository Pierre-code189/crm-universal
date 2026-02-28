// src/ui/dynamic/Dashboard.tsx
import React, { useState, useEffect } from 'react';

interface DashboardProps {
  tenant: any;
  repository: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ tenant, repository }) => {
  const [metricas, setMetricas] = useState<any>({ totalIngresos: 0, pedidosPendientes: 0, conteoPorModulo: {} });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const calcularMetricas = async () => {
      setCargando(true);
      
      const nuevasMetricas: any = {
        totalIngresos: 0,
        pedidosPendientes: 0,
        conteoPorModulo: {}
      };

      try {
        // 🛠️ SOLUCIÓN: Ejecutamos TODAS las consultas al mismo tiempo en paralelo
        const modulos = Object.keys(tenant.modules);
        
        // Creamos un array de promesas
        const promesas = modulos.map(async (key) => {
          const collectionName = tenant.modules[key].collectionName;
          const data = await repository.getAll(collectionName, false);
          
          return { key, data }; // Devolvemos la llave y sus datos
        });

        // Esperamos a que TODAS terminen simultáneamente (¡Mucho más rápido!)
        const resultados = await Promise.all(promesas);

        // Procesamos los resultados
        resultados.forEach(({ key, data }) => {
          nuevasMetricas.conteoPorModulo[key] = data.length;

          // MATEMÁTICAS ESPECÍFICAS PARA CHOCOPIURA (Pedidos)
          if (key === 'pedidos') {
            data.forEach((pedido: any) => {
              // Convertimos a texto seguro
              const estadoStr = String(pedido.estado || ''); 
              
              // 🛠️ Ahora buscamos la palabra clave, sin importar los emojis
              if (estadoStr.includes('Entregado')) {
                nuevasMetricas.totalIngresos += (Number(pedido.totalPagado) || 0);
              }
              if (estadoStr.includes('Pendiente')) {
                nuevasMetricas.pedidosPendientes++;
              }
            });
          }
        });

        setMetricas(nuevasMetricas);
      } catch (error) {
        console.error("Error calculando métricas del Dashboard:", error);
      } finally {
        setCargando(false);
      }
    };

    calcularMetricas();
  }, [tenant, repository]);


  if (cargando) {
    return <div style={{ padding: '40px', textAlign: 'center', color: '#6b7280' }}>Calculando métricas del negocio... 📊</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* FILA 1: TARJETAS PRINCIPALES (KPIs) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
        
        {/* Tarjeta: Ingresos Totales */}
        <div style={{ padding: '25px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>💰 Ingresos Verificados</h3>
          <h2 style={{ margin: 0, fontSize: '2.5rem' }}>S/ {metricas.totalIngresos.toFixed(2)}</h2>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Pedidos con estado "Entregado"</p>
        </div>

        {/* Tarjeta: Pedidos Pendientes */}
        <div style={{ padding: '25px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', opacity: 0.9 }}>⏳ Pedidos por Atender</h3>
          <h2 style={{ margin: 0, fontSize: '2.5rem' }}>{metricas.pedidosPendientes}</h2>
          <p style={{ margin: '10px 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>Requieren tu atención inmediata</p>
        </div>

      </div>

      {/* FILA 2: RESUMEN DE MÓDULOS (Dinámico) */}
      <div style={{ marginTop: '10px' }}>
        <h3 style={{ color: '#374151', marginBottom: '15px' }}>Resumen del Sistema</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          
          {Object.entries(tenant.modules)
          .sort((a: any, b: any) => (a[1].orden || 99) - (b[1].orden || 99))
          .map(([key, config]: [string, any]) => (
            <div key={key} style={{ padding: '20px', backgroundColor: '#f3f4f6', borderRadius: '10px', border: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: 'bold', textTransform: 'uppercase' }}>{config.title}</span>
                <h3 style={{ margin: '5px 0 0 0', color: '#1f2937', fontSize: '1.5rem' }}>
                  {metricas.conteoPorModulo[key] || 0}
                </h3>
              </div>
              <div style={{ fontSize: '2rem', opacity: 0.2 }}>📁</div>
            </div>
          ))}

        </div>
      </div>

    </div>
  );
};

export default Dashboard;