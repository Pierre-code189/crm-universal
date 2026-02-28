// src/features/auth/SetupPasswordPage.tsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyPasswordResetCode, confirmPasswordReset, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { masterAuth, masterDb } from '../../infrastructure/database/firebaseManager';

export const SetupPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Firebase envía el código secreto en la URL bajo el nombre "oobCode"
  const oobCode = searchParams.get('oobCode');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!oobCode) {
      setError("Enlace inválido o caducado. Por favor, solicita una nueva invitación.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    setLoading(true);

    try {
      // 1. Verificamos el código y obtenemos el correo del cliente
      const emailCliente = await verifyPasswordResetCode(masterAuth, oobCode);

      // 2. Guardamos la nueva contraseña en Firebase Auth
      await confirmPasswordReset(masterAuth, oobCode, password);

      // 🛠️ SOLUCIÓN: 2.5 Iniciamos sesión silenciosamente para ganar permisos en la BD
      await signInWithEmailAndPassword(masterAuth, emailCliente, password);

      // 3. ¡MAGIA! Buscamos a este cliente y lo marcamos como Activo (ahora sí tenemos permiso)
      const q = query(collection(masterDb, "clientes_config"), where("email", "==", emailCliente));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docId = querySnapshot.docs[0].id;
        await updateDoc(doc(masterDb, "clientes_config", docId), {
          estado: 'Activo'
        });
      }

      setSuccess(true);
      
      // Redirigimos al Login después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);

    } catch (err: any) {
      console.error(err);
      setError("Hubo un error al procesar tu solicitud. El enlace podría haber expirado.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
        <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' }}>
          <h2 style={{ color: '#059669', marginBottom: '10px' }}>¡Cuenta Activada! 🎉</h2>
          <p style={{ color: '#4b5563' }}>Tu contraseña se ha guardado correctamente. Tu espacio de trabajo está listo.</p>
          <p style={{ color: '#9ca3af', fontSize: '0.9rem', marginTop: '20px' }}>Redirigiendo al inicio de sesión...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f3f4f6' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px' }}>
        <h2 style={{ color: '#2563eb', textAlign: 'center', marginBottom: '10px', marginTop: 0 }}>Crear Contraseña</h2>
        <p style={{ color: '#6b7280', textAlign: 'center', marginBottom: '30px', fontSize: '0.95rem' }}>Establece una contraseña segura para acceder a tu CRM.</p>
        
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '0.9rem' }}>Nueva Contraseña</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '8px', color: '#374151', fontSize: '0.9rem' }}>Confirmar Contraseña</label>
            <input 
              type="password" 
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #d1d5db', boxSizing: 'border-box' }}
            />
          </div>

          {error && (
            <div style={{ color: '#dc2626', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '5px', marginBottom: '20px', fontSize: '0.9rem', textAlign: 'center' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !oobCode}
            style={{ width: '100%', padding: '12px', backgroundColor: loading ? '#9ca3af' : '#2563eb', color: 'white', border: 'none', borderRadius: '5px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
          >
            {loading ? 'Guardando...' : 'Activar mi cuenta'}
          </button>
        </form>
      </div>
    </div>
  );
};