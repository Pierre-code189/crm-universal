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
    let finalValue: any = value;

    // 🕵️‍♂️ BUSCAMOS EL CAMPO EN EL ESQUEMA PARA VER SI TIENE REGLAS ESPECIALES
    const fieldConfig = schema.fields.find((f: any) => f.name === name);

    // 🛡️ LÓGICA DE LIMPIEZA PARA EL TELÉFONO
    // Si el campo se llama 'telefono' o tiene el patrón de 9 números:
    if (name === 'telefono' || fieldConfig?.pattern === "^[0-9]{9}$") {
      // replace(/\D/g, ''): Elimina cualquier cosa que NO sea un número
      // .slice(0, 9): No permite escribir más de 9 dígitos
      finalValue = value.replace(/\D/g, '').slice(0, 9);
    } 
    // Si el campo es numérico normal (como el precio)
    else if (type === 'number') {
      finalValue = value === '' ? '' : parseFloat(value);
    }
    
    setFormData({ ...formData, [name]: finalValue });
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
              // 🛡️ Cambiamos 'name' por 'field.name' para que TS sepa de qué hablamos
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