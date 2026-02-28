import { useState, useMemo } from 'react';

interface UseDataManagerProps {
  datosModulo: any[];
  moduloActivo: string;
  tenant: any;
  registrosPorPagina?: number;
}

export const useDataManager = ({ 
  datosModulo, 
  moduloActivo, 
  tenant, 
  registrosPorPagina = 10 
}: UseDataManagerProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const [paginaActual, setPaginaActual] = useState(1);

  // 🧠 Procesamiento de datos (Filtrado + Búsqueda)
  const datosFiltrados = useMemo(() => {
    let resultado = [...datosModulo];

    // 1. Filtro por Fecha (Solo para pedidos)
    if (moduloActivo === 'pedidos' && filtroFecha) {
      const [year, month, day] = filtroFecha.split('-');
      const fechaFormateada = `${day}/${month}/${year}`;
      resultado = resultado.filter(item => item.fecha?.includes(fechaFormateada));
    }

    // 2. Filtro por Buscador
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const esquema = tenant?.modules[moduloActivo];
      if (esquema) {
        resultado = resultado.filter((item) =>
          esquema.fields.some((field: any) => 
            String(item[field.name] || "").toLowerCase().includes(term)
          )
        );
      }
    }

    return resultado;
  }, [datosModulo, moduloActivo, filtroFecha, searchTerm, tenant]);

  // 📑 Lógica de Paginación
  const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / registrosPorPagina));
  const paginaSegura = paginaActual > totalPaginas ? 1 : paginaActual;
  
  const indiceUltimo = paginaSegura * registrosPorPagina;
  const indicePrimero = indiceUltimo - registrosPorPagina;
  const datosPaginados = datosFiltrados.slice(indicePrimero, indiceUltimo);

  // Función para resetear filtros al cambiar de módulo
  const resetFilters = () => {
    setSearchTerm('');
    setFiltroFecha('');
    setPaginaActual(1);
  };

  return {
    searchTerm, setSearchTerm,
    filtroFecha, setFiltroFecha,
    paginaActual: paginaSegura, setPaginaActual,
    datosPaginados,
    totalPaginas,
    datosFiltrados, // Útil para el contador de resultados o exportación Excel
    resetFilters
  };
};