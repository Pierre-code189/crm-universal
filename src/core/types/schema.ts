// src/core/types/schema.ts

// 1. Ampliamos los tipos para que coincidan con tu DynamicForm y DynamicTable
export type FieldType = 'text' | 'number' | 'email' | 'boolean' | 'checkbox' | 'textarea' | 'select' | 'date' | 'image';

export interface FieldSchema {
  name: string;    // Nombre interno (ej: 'precio')
  label: string;   // Nombre UI (ej: 'Precio Unitario')
  type: FieldType; // Tipo de dato estricto
  
  // 2. Propiedades opcionales que tu DynamicForm ya intenta usar
  options?: string[];   // Necesario para los campos 'select'
  required?: boolean;   // Para validación de formularios
  placeholder?: string; // Texto de ayuda
  pattern?: string;     // Para validaciones con Regex (ej. teléfonos)
}

export interface ModuleSchema {
  collectionName: string; 
  title: string;          
  orden?: number;         // Para ordenar cómo aparecen en el Dashboard
  fields: FieldSchema[];  
}