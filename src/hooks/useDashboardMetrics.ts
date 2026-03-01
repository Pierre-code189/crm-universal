import { useState, useEffect } from 'react';

export const useDashboardMetrics = (tenant: any, repository: any) => {
  const [metricas, setMetricas] = useState<any>({ totalIngresos: 0, pedidosPendientes: 0, conteoPorModulo: {} });
  const [datosGrafico, setDatosGrafico] = useState<any[]>([]);
  const [actividadReciente, setActividadReciente] = useState<any[]>([]);
  const [pedidosRaw, setPedidosRaw] = useState<any[]>([]); // 🚀 Guardamos los pedidos para el Excel
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const calcularMetricas = async () => {
      setCargando(true);
      const nuevasMetricas: any = { totalIngresos: 0, pedidosPendientes: 0, conteoPorModulo: {} };
      const ventasPorDia: Record<string, number> = {};
      let todosLosRegistros: any[] = [];
      let pedidosGuardados: any[] = [];

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
            pedidosGuardados = data; // 📥 Guardamos la data pura para Excel
            data.forEach((pedido: any) => {
              const estadoStr = String(pedido.estado || '');
              const monto = Number(pedido.totalPagado) || 0;

              if (estadoStr.includes('Entregado')) {
                nuevasMetricas.totalIngresos += monto;
                
                // 📊 LÓGICA PARA EL GRÁFICO
                const fechaCorta = pedido.fecha ? pedido.fecha.split(',')[0].trim() : 'Sin Fecha';
                ventasPorDia[fechaCorta] = (ventasPorDia[fechaCorta] || 0) + monto;
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
        })).slice(-7);

        // Ordenar actividad reciente
        const ultimos5 = todosLosRegistros.reverse().slice(0, 5);

        setMetricas(nuevasMetricas);
        setDatosGrafico(chartData);
        setActividadReciente(ultimos5);
        setPedidosRaw(pedidosGuardados);
      } catch (error) {
        console.error("Error calculando métricas:", error);
      } finally {
        setCargando(false);
      }
    };

    calcularMetricas();
  }, [tenant, repository]);

  return { metricas, datosGrafico, actividadReciente, pedidosRaw, cargando };
};