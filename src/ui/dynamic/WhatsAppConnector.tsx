// src/ui/dynamic/WhatsAppConnector.tsx
import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { masterDb } from '../../infrastructure/database/firebaseManager';
import { useTenant } from '../../core/tenants/TenantContext';
import { QRCodeSVG } from 'qrcode.react';

export const WhatsAppConnector = () => {
  const { tenant } = useTenant();
  const [connectionData, setConnectionData] = useState<{ status: string; qr_code: string | null; } | null>(null);

  useEffect(() => {
    if (!tenant) return;
    
    // Escuchamos el documento maestro del cliente en tiempo real
    const docRef = doc(masterDb, 'clientes_config', tenant.id);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setConnectionData({
          status: data.whatsapp_connection?.status || 'Desconectado',
          qr_code: data.whatsapp_connection?.qr_code || null,
        });
      }
    });

    return () => unsubscribe();
  }, [tenant]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 20px' }}>
      <div style={{ background: 'white', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', textAlign: 'center', maxWidth: '500px', width: '100%' }}>
        <h2 style={{ color: '#1f2937', marginTop: 0 }}>📱 Conexión WhatsApp API</h2>
        <p style={{ color: '#6b7280', marginBottom: '30px', fontSize: '0.9rem' }}>Vincula tu número para activar el Asistente Virtual IA.</p>
        
        {connectionData?.status === 'Conectado' ? (
          <div style={{ padding: '20px', backgroundColor: '#d1fae5', borderRadius: '8px', border: '1px solid #10b981' }}>
            <h3 style={{ color: '#065f46', margin: '0 0 10px 0' }}>✅ Sistema Operativo</h3>
            <p style={{ color: '#047857', margin: 0, fontSize: '0.9rem' }}>Tu bot de WhatsApp está escuchando y respondiendo a tus clientes en tiempo real.</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'inline-block', padding: '15px', background: '#f3f4f6', borderRadius: '12px', marginBottom: '20px' }}>
              {connectionData?.qr_code ? (
                <QRCodeSVG value={connectionData.qr_code} size={220} />
              ) : (
                <div style={{ height: '220px', width: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                  <p>Esperando señal del servidor...</p>
                </div>
              )}
            </div>
            <p style={{ color: '#ef4444', fontWeight: 'bold', margin: 0 }}>Estado: {connectionData?.status || 'Esperando QR...'}</p>
            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '10px' }}>Abre WhatsApp en tu celular, ve a Dispositivos Vinculados y escanea este código.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default WhatsAppConnector;