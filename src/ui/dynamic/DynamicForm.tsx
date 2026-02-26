// src/ui/dynamic/DynamicForm.tsx
import React, { useState } from 'react';

export interface DynamicFormProps {
  schema: any;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ schema, initialData = {}, onSubmit, onCancel }) => {
  // Iniciamos el estado con los datos a editar, o vacío si es nuevo
  const [formData, setFormData] = useState<any>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Si el campo es numérico, lo convertimos a número real para la base de datos
    const parsedValue = type === 'number' ? parseFloat(value) : value;
    
    setFormData({ ...formData, [name]: parsedValue });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
      {schema.fields.map((field: any) => (
        <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <label style={{ fontWeight: 'bold', fontSize: '0.9rem', color: '#374151' }}>
            {field.label}
          </label>
          
          {/* Si el JSON pide un AREA DE TEXTO GRANDE */}
          {field.type === 'textarea' ? (
            <textarea
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              placeholder={`Ingrese ${field.label.toLowerCase()}`}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', minHeight: '80px', fontFamily: 'inherit', color: 'black' }}
              required={field.required !== false}
            />
          ) 
          
          /* Si el JSON pide una LISTA DESPLEGABLE */
          : field.type === 'select' ? (
            <select
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', backgroundColor: 'white', color: 'black' }}
              required={field.required !== false}
            >
              <option value="" disabled>Seleccione una opción</option>
              {field.options?.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) 
          
          /* Si es TEXTO normal o NÚMERO */
          : (
            <input
              type={field.type || 'text'}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              placeholder={field.type === 'number' ? 'Ej: 15.50' : `Ingrese ${field.label.toLowerCase()}`}
              step={field.type === 'number' ? "0.1" : undefined} // Permite decimales
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', color: 'black' }}
              required={field.required !== false}
            />
          )}
        </div>
      ))}
      
      {/* BOTONES DE ACCIÓN */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '15px' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', color: '#374151', cursor: 'pointer', fontWeight: 'bold' }}>
          Cancelar
        </button>
        <button type="submit" style={{ padding: '10px 15px', borderRadius: '6px', border: 'none', background: '#3b82f6', color: 'white', cursor: 'pointer', fontWeight: 'bold' }}>
          Guardar Registro
        </button>
      </div>
    </form>
  );
};

export default DynamicForm;