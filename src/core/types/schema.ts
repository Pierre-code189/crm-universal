// src/core/types/schema.ts

export type FieldType = 'text' | 'number' | 'email' | 'boolean';

export interface FieldSchema {
  name: string;    // Nombre interno para la base de datos (ej: 'precio')
  label: string;   // Nombre bonito para mostrar al cliente (ej: 'Precio Unitario')
  type: FieldType; // Tipo de dato
}

export interface ModuleSchema {
  collectionName: string; // La colección de Firebase (ej: 'productos')
  title: string;          // El título de la tabla
  fields: FieldSchema[];  // Las columnas de la tabla
}