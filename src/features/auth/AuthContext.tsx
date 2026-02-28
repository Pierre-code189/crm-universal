// src/features/auth/AuthContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; // <-- Lo importamos como Tipo

import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as signOutMain, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  signOut as signOutSecondary 
} from 'firebase/auth';
import type { User } from 'firebase/auth'; // <-- Lo importamos como Tipo

// Importamos los motores centrales que configuraste en el Paso 1
import { masterAuth, secondaryAuth } from '../../infrastructure/database/firebaseManager';

// ... (El resto de tu código hacia abajo se mantiene exactamente igual) ...

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  // ¡NUEVA FUNCIÓN! Tipado para la invitación
  invitarCliente: (email: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Escuchamos el motor principal para mantener tu sesión segura
    const unsubscribe = onAuthStateChanged(masterAuth, (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(masterAuth, email, pass);
  };

  const logout = async () => {
    await signOutMain(masterAuth);
  };

  // ==========================================
  // SISTEMA DE APROVISIONAMIENTO (Invitaciones)
  // ==========================================
  const invitarCliente = async (emailCliente: string) => {
    try {
      // 1. Creamos una contraseña temporal aleatoria súper segura que ni tú conocerás
      const passwordTemporal = Math.random().toString(36).slice(-10) + "A1!x";
      
      // 2. Usamos el MOTOR FANTASMA para crear la cuenta en Firebase sin afectar tu sesión
      await createUserWithEmailAndPassword(secondaryAuth, emailCliente, passwordTemporal);
      
      // 3. Le enviamos el correo oficial para que él mismo ponga su propia contraseña
      await sendPasswordResetEmail(secondaryAuth, emailCliente);
      
      // 4. Cerramos la sesión del motor fantasma de inmediato para no dejar rastros
      await signOutSecondary(secondaryAuth);
      
      return { success: true };
    } catch (error: any) {
      console.error("Error al invitar cliente:", error);
      // Extraemos códigos de error comunes de Firebase
      let mensaje = "Error desconocido al crear la cuenta.";
      if (error.code === 'auth/email-already-in-use') mensaje = "Este correo ya está registrado en el sistema.";
      if (error.code === 'auth/invalid-email') mensaje = "El formato del correo es inválido.";
      
      return { success: false, error: mensaje };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, invitarCliente }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);