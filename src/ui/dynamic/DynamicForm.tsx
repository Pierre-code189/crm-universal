// src/ui/dynamic/DynamicForm.tsx
import React, { useState, useEffect } from 'react';
import { uploadImageToImgbb } from '../../core/utils/imageUploadService';

interface DynamicFormProps {
  schema: any;
  initialData?: any;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ schema, initialData = {}, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<any>(initialData);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? Number(value) : value,
    }));
  };

  // 🚀 INTERCEPTOR DE IMÁGENES
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imageUrl = await uploadImageToImgbb(file);
      setFormData((prev: any) => ({ ...prev, [fieldName]: imageUrl }));
    } catch (error) {
      alert("Error al subir la imagen. Verifica tu conexión o tu API Key.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      alert("Espera a que termine de subir la imagen antes de guardar.");
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {schema.fields.map((field: any) => {
        
        // 🖼️ RENDERIZADOR ESPECIAL PARA IMÁGENES
        if (field.type === 'image' || field.name === 'imagen' || field.name === 'foto') {
          return (
            <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.9rem' }}>{field.label}</label>
              
              <div style={{ border: '2px dashed #d1d5db', borderRadius: '8px', padding: '20px', textAlign: 'center', backgroundColor: '#f9fafb', position: 'relative', transition: 'all 0.3s' }}>
                {isUploading ? (
                  <div style={{ color: '#3b82f6', fontWeight: 'bold', animation: 'pulse 1.5s infinite' }}>Subiendo a la nube... ☁️</div>
                ) : formData[field.name] ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <img src={formData[field.name]} alt="Vista previa" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
                    <label style={{ color: '#ef4444', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}>
                      Cambiar foto
                      <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, field.name)} style={{ display: 'none' }} />
                    </label>
                  </div>
                ) : (
                  <label style={{ cursor: 'pointer', color: '#6b7280', display: 'block', width: '100%' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '10px' }}>📸</div>
                    Haz clic para subir una imagen
                    <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, field.name)} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>
          );
        }

        // 📝 RENDERIZADOR PARA TEXTOS Y NÚMEROS NORMALES
        return (
          <div key={field.name} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontWeight: 'bold', color: '#374151', fontSize: '0.9rem' }}>{field.label}</label>
            <input
              type={field.type === 'number' ? 'number' : 'text'}
              name={field.name}
              value={formData[field.name] || ''}
              onChange={handleChange}
              placeholder={field.placeholder || `Ingresa ${field.label.toLowerCase()}`}
              required={field.required}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #d1d5db', outline: 'none', fontSize: '1rem' }}
            />
          </div>
        );
      })}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', borderTop: '1px solid #e5e7eb', paddingTop: '20px' }}>
        <button type="button" onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#374151' }}>
          Cancelar
        </button>
        <button type="submit" disabled={isUploading} style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', background: isUploading ? '#9ca3af' : '#10b981', color: 'white', cursor: isUploading ? 'not-allowed' : 'pointer', fontWeight: 'bold', boxShadow: '0 4px 6px rgba(16, 185, 129, 0.2)' }}>
          {isUploading ? 'Procesando...' : '💾 Guardar Registro'}
        </button>
      </div>
    </form>
  );
};