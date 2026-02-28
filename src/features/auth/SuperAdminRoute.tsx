// src/features/auth/SuperAdminRoute.tsx
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';
import type { ReactNode } from 'react';

export const SuperAdminRoute = ({ children }: { children: ReactNode }) => {
  // ¡Traemos de vuelta el isLoading!
  const { user, isLoading } = useAuth(); 
  const location = useLocation();

  // Traemos el correo desde el entorno seguro
  const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL;

  // 1. LA SALA DE ESPERA: Si Firebase sigue pensando, mostramos esto y detenemos el código.
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#111827', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <h2>Verificando credenciales de máxima seguridad...</h2>
      </div>
    );
  }

  // 2. Si Firebase terminó y confirma que NO hay nadie, lo manda al login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // 3. Si hay alguien, pero no es el correo maestro, lo devuelve a la tabla normal
  if (user.email !== SUPER_ADMIN_EMAIL) {
    return <Navigate to="/" replace />;
  }

  // 4. Si es el Súper Administrador, las puertas del Búnker se abren
  return <>{children}</>;
};