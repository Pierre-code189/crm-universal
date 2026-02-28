import { useState } from 'react';

export const useCrudModule = (tenant: any, repository: any, moduloActivo: string, verPapelera: boolean) => {
  const [datosModulo, setDatosModulo] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState<{texto: string, tipo: 'exito' | 'error'} | null>(null);

  const mostrarMensaje = (texto: string, tipo: 'exito' | 'error') => {
    setMensaje({ texto, tipo });
    setTimeout(() => setMensaje(null), 4000);
  };

  const cargarDatos = async () => {
    if (!tenant || !repository || moduloActivo === 'dashboard') return;
    setDatosModulo([]); 
    const esquemaActual = tenant.modules[moduloActivo];
    if (!esquemaActual) return;
    
    try {
      const data = await repository.getAll(esquemaActual.collectionName, verPapelera);
      setDatosModulo(data);
    } catch (error) {
      mostrarMensaje("Error al sincronizar datos", "error");
    }
  };

  const handleGuardarRegistro = async (datos: any, registroEnEdicion: any, onSuccess: () => void) => {
    if (!tenant || !repository || !moduloActivo) return;
    const colName = tenant.modules[moduloActivo].collectionName;
    try {
      if (registroEnEdicion) {
        await repository.update(colName, registroEnEdicion.id, datos);
        mostrarMensaje("Registro actualizado", "exito");
      } else {
        await repository.create(colName, datos);
        mostrarMensaje("Registro creado con éxito", "exito");
      }
      onSuccess();
      await cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al guardar", "error");
    }
  };

  const ejecutarEliminacion = async (registroAEliminar: string, onSuccess: () => void) => {
    if (!tenant || !repository || !moduloActivo || !registroAEliminar) return;
    try {
      if (verPapelera) {
        await repository.hardDelete(tenant.modules[moduloActivo].collectionName, registroAEliminar);
        mostrarMensaje("Destruido permanentemente", "exito");
      } else {
        await repository.delete(tenant.modules[moduloActivo].collectionName, registroAEliminar);
        mostrarMensaje("Movido a la papelera", "exito");
      }
      onSuccess();
      await cargarDatos(); 
    } catch (error) {
      mostrarMensaje("Error al procesar", "error");
    }
  };

  const handleRestaurarRegistro = async (id: string) => {
    if (!tenant || !repository || !moduloActivo) return;
    try {
      await repository.restore(tenant.modules[moduloActivo].collectionName, id);
      mostrarMensaje("¡Registro restaurado!", "exito");
      await cargarDatos();
    } catch (error) {
      mostrarMensaje("Error al restaurar", "error");
    }
  };

  const ejecutarEliminacionMultiple = async (selectedIds: string[], onSuccess: () => void) => {
    if (!tenant || !repository || !moduloActivo || selectedIds.length === 0) return;
    const esDefinitivo = verPapelera;
    if (!window.confirm(`¿Estás seguro de ${esDefinitivo ? 'destruir' : 'eliminar'} ${selectedIds.length} registros?`)) return;

    const colName = tenant.modules[moduloActivo].collectionName;
    try {
      const promesas = selectedIds.map((id: string) => 
        esDefinitivo ? repository.hardDelete(colName, id) : repository.delete(colName, id)
      );
      await Promise.all(promesas);
      mostrarMensaje(`¡${selectedIds.length} procesados con éxito!`, "exito");
      onSuccess(); 
      await cargarDatos();
    } catch (error) {
      mostrarMensaje("Error en operación múltiple", "error");
    }
  };

  return {
    datosModulo,
    mensaje,
    cargarDatos,
    handleGuardarRegistro,
    ejecutarEliminacion,
    handleRestaurarRegistro,
    ejecutarEliminacionMultiple
  };
};