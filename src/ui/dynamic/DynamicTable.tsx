import React from 'react';

export interface DynamicTableProps {
  schema: any;
  data: any[];
  onEdit?: (item: any) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  isTrashView?: boolean;
  
  // 🚀 NUEVAS PROPIEDADES AVANZADAS
  searchTerm?: string;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({ 
  schema, data, onEdit, onDelete, onRestore, isTrashView,
  searchTerm = "", selectedIds = [], onToggleSelect, onToggleSelectAll
}) => {
  if (!schema || !schema.fields) return <p>Esquema de módulo inválido</p>;

  // 🔍 1. LÓGICA DE BÚSQUEDA INTELIGENTE (Client-Side)
  const datosFiltrados = data.filter((item) => {
    if (!searchTerm) return true; // Si no hay búsqueda, muestra todo
    const term = searchTerm.toLowerCase();
    
    // Busca coincidencias en CUALQUIER columna de texto o número
    return schema.fields.some((field: any) => {
      const val = item[field.name];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(term);
    });
  });

  // 2. LÓGICA DE SELECCIÓN MÚLTIPLE
  const todosSeleccionados = datosFiltrados.length > 0 && selectedIds.length === datosFiltrados.length;

  return (
    <table className="responsive-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
          
          {/* 🟩 COLUMNA DE CHECKBOX MAESTRO */}
          {onToggleSelectAll && (
            <th style={{ padding: '12px 15px', width: '40px' }}>
              <input
                type="checkbox"
                checked={todosSeleccionados}
                onChange={onToggleSelectAll}
                style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                title="Seleccionar todo"
              />
            </th>
          )}

          {schema.fields.map((field: any) => (
            <th key={field.name} style={{ padding: '12px 15px', color: '#374151', fontSize: '0.9rem' }}>
              {field.label}
            </th>
          ))}
          <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {datosFiltrados.length === 0 ? (
          <tr>
            <td colSpan={schema.fields.length + (onToggleSelectAll ? 2 : 1)} style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              {searchTerm ? 'No se encontraron resultados para tu búsqueda. 🕵️‍♂️' : 'No hay registros para mostrar.'}
            </td>
          </tr>
        ) : (
          datosFiltrados.map((item, index) => (
            <tr 
              key={item.id || index} 
              style={{ 
                borderBottom: '1px solid #e5e7eb', 
                // ✨ EFECTO VISUAL: Resalta la fila si está seleccionada
                backgroundColor: selectedIds.includes(item.id) ? '#eff6ff' : 'white',
                transition: 'background-color 0.2s'
              }}
            >
              
              {/* 🟩 CHECKBOX INDIVIDUAL */}
              {onToggleSelect && (
                <td style={{ padding: '12px 15px' }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    onChange={() => onToggleSelect(item.id)}
                    style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#2563eb' }}
                  />
                </td>
              )}

              {schema.fields.map((field: any) => (
                <td key={field.name} data-label={field.label} style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#1f2937' }}>
                  
                  {/* Booleanos interceptados */}
                  {field.type === 'checkbox' ? (
                    <span style={{
                      padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold',
                      backgroundColor: item[field.name] ? '#d1fae5' : '#fee2e2',
                      color: item[field.name] ? '#065f46' : '#991b1b'
                    }}>
                      {item[field.name] ? '✅ Sí' : '❌ No'}
                    </span>
                  ) 
                  
                  /* Imágenes o texto normal */
                  : field.name.toLowerCase().includes('imagen') && item[field.name] ? (
                    <img src={item[field.name]} alt="img" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                  ) : (
                    item[field.name]
                  )}

                </td>
              ))}
              
              <td style={{ padding: '12px 15px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {!isTrashView && onEdit && (
                  <button onClick={() => onEdit(item)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }} title="Editar">✏️</button>
                )}
                {isTrashView && onRestore && (
                  <button onClick={() => onRestore(item.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }} title="Restaurar">🔄</button>
                )}
                <button onClick={() => onDelete(item.id)} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }} title={isTrashView ? "Eliminar Definitivamente" : "Mover a Papelera"}>🗑️</button>
              </td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
};

export default DynamicTable;