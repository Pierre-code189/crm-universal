// src/features/auth/authService.ts
import { secondaryAuth } from '../../infrastructure/database/firebaseManager'; 
import { createUserWithEmailAndPassword, sendPasswordResetEmail, signOut } from 'firebase/auth';

export const invitarCliente = async (emailCliente: string) => {
  try {
    // 1. Creamos la contraseña temporal
    const passwordTemporal = Math.random().toString(36).slice(-10) + "A1!x";
    
    // 2. Creamos la cuenta en el motor fantasma
    await createUserWithEmailAndPassword(secondaryAuth, emailCliente, passwordTemporal);
    
    // 3. Enviamos el correo oficial para que configure su propia contraseña
    await sendPasswordResetEmail(secondaryAuth, emailCliente);
    
    // 4. Cerramos la sesión secundaria
    await signOut(secondaryAuth);
    
    return { success: true };
  } catch (error: any) {
    console.error("Error en authService al invitar cliente:", error);
    let mensaje = "Error desconocido.";
    if (error.code === 'auth/email-already-in-use') mensaje = "El correo ya existe.";
    
    return { success: false, error: mensaje };
  }
};