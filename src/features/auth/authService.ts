// src/features/auth/authService.ts
import { secondaryAuth } from '../../infrastructure/database/firebaseManager'; // RUTA CORREGIDA
import { sendPasswordResetEmail } from 'firebase/auth';

export const invitarCliente = async (email: string) => {
  try {
    await sendPasswordResetEmail(secondaryAuth, email);
    return { success: true };
  } catch (error) {
    return { success: false };
  }
};