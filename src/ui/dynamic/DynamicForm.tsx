// src/ui/dynamic/DynamicForm.tsx
import React, { useState } from 'react';

export interface DynamicFormProps {
  schema: any;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ schema, initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<any>(initialData);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    let valorLimpio: any = value;

    // 🛡️ BARRERA ESTRICTA: Si el campo se llama 'telefono'
    if (name === 'telefono') {
      // 1. replace(/\D/g, ''): Destruye letras, espacios y símbolos al instante.
      // 2. slice(0, 9): Corta el texto como una guillotina si pasa de 9 números.
      valorLimpio = value.replace(/\D/g, '').slice(0, 9);
    } 
    // Si es un campo de precio o número normal
    else if (type === 'number') {
      valorLimpio = value === '' ? '' : parseFloat(value);
    }
    
    // Guardamos el valor purificado en el estado de React
    setFormData({ ...formData, [name]: valorLimpio });
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
              pattern={field.pattern}
              maxLength={field.name === 'telefono' ? 9 : undefined} 
              placeholder={field.placeholder || (field.type === 'number' ? 'Ej: 15.50' : `Ingrese ${field.label.toLowerCase()}`)}
              step={field.type === 'number' ? "0.1" : undefined}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d1d5db', color: 'black' }}
              required={field.required !== false}
            />
          )}
        </div>
      ))}
      
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