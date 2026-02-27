import React from 'react';

export interface DynamicTableProps {
  schema: any;
  data: any[];
  onEdit?: (item: any) => void;
  onDelete: (id: string) => void;
  onRestore?: (id: string) => void;
  isTrashView?: boolean;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({ schema, data, onEdit, onDelete, onRestore, isTrashView }) => {
  if (!schema || !schema.fields) return <p>Esquema de módulo inválido</p>;

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
      <thead>
        <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
          {schema.fields.map((field: any) => (
            <th key={field.name} style={{ padding: '12px 15px', color: '#374151', fontSize: '0.9rem' }}>
              {field.label}
            </th>
          ))}
          <th style={{ padding: '12px 15px', textAlign: 'center', fontSize: '0.9rem' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan={schema.fields.length + 1} style={{ textAlign: 'center', padding: '20px', color: '#6b7280' }}>
              No hay registros para mostrar.
            </td>
          </tr>
        ) : (
          data.map((item, index) => (
            <tr key={item.id || index} style={{ borderBottom: '1px solid #e5e7eb', backgroundColor: 'white' }}>
              {schema.fields.map((field: any) => (
                <td key={field.name} style={{ padding: '12px 15px', fontSize: '0.9rem', color: '#1f2937' }}>
                  
                  {/* 🛠️ SOLUCIÓN: Interceptamos los booleanos (checkbox) para que no se vuelvan invisibles */}
                  {field.type === 'checkbox' ? (
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      backgroundColor: item[field.name] ? '#d1fae5' : '#fee2e2',
                      color: item[field.name] ? '#065f46' : '#991b1b'
                    }}>
                      {item[field.name] ? '✅ Sí' : '❌ No'}
                    </span>
                  ) 
                  
                  /* Lógica original para imágenes y texto normal */
                  : field.name.toLowerCase().includes('imagen') && item[field.name] ? (
                    <img src={item[field.name]} alt="img" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '6px' }} />
                  ) : (
                    item[field.name]
                  )}

                </td>
              ))}
              
              <td style={{ padding: '12px 15px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
                {/* BOTÓN EDITAR (Solo visible si NO estamos en papelera) */}
                {!isTrashView && onEdit && (
                  <button onClick={() => onEdit(item)} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }} title="Editar">✏️</button>
                )}
                
                {/* BOTÓN RESTAURAR (Solo visible si SÍ estamos en papelera) */}
                {isTrashView && onRestore && (
                  <button onClick={() => onRestore(item.id)} style={{ background: '#10b981', color: 'white', border: 'none', padding: '6px 10px', borderRadius: '4px', cursor: 'pointer' }} title="Restaurar">🔄</button>
                )}
                
                {/* BOTÓN ELIMINAR (Siempre visible) */}
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