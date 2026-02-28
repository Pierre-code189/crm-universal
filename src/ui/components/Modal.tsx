// src/ui/components/Modal.tsx
import type { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      
      {/* 🚀 AQUÍ ESTÁ EL ARREGLO: Añadimos maxHeight y overflowY */}
      <div style={{ 
        backgroundColor: 'white', 
        padding: '25px', 
        borderRadius: '8px', 
        width: '90%', 
        maxWidth: '500px', 
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        maxHeight: '85vh',  /* El modal nunca será más alto que el 85% de la pantalla */
        overflowY: 'auto'   /* Crea una barra de scroll interna si el formulario es muy largo */
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem', color: '#333' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#666' }}>
            &times;
          </button>
        </div>
        
        {children}
        
      </div>
    </div>
  );
};