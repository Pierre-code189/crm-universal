// src/infrastructure/repositories/coreRepository.ts
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Firestore, query, where, limit } from 'firebase/firestore';
import { db as defaultDb } from '../database/firebaseManager'; 

export const createRepository = (dbInstance: Firestore) => ({
  getAll: async (collectionName: string, verEliminados: boolean = false, limitCount: number = 10) => {
    try {
      const colRef = collection(dbInstance, collectionName);
      
      // 🛡️ Filtramos en el servidor y añadimos el límite de paginación
      // (Retiramos el orderBy temporalmente para evitar el error de Índices Compuestos de Firebase)
      const q = query(
        colRef, 
        where("isDeleted", "==", verEliminados),
        limit(limitCount)
      );
      
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error(`[Repository Error] Falló getAll en ${collectionName}:`, error);
      throw error;
    }
  },
  
  create: async (collectionName: string, data: any) => {
    try {
      const colRef = collection(dbInstance, collectionName);
      return await addDoc(colRef, { ...data, isDeleted: false, createdAt: new Date().toISOString() });
    } catch (error) {
      console.error(`[Repository Error] Falló create en ${collectionName}:`, error);
      throw error;
    }
  },

  update: async (collectionName: string, id: string, data: any) => {
    try {
      const docRef = doc(dbInstance, collectionName, id);
      await updateDoc(docRef, data);
    } catch (error) {
      console.error(`[Repository Error] Falló update en ${collectionName}:`, error);
      throw error;
    }
  },

  delete: async (collectionName: string, id: string) => {
    try {
      const docRef = doc(dbInstance, collectionName, id);
      await updateDoc(docRef, { isDeleted: true }); 
    } catch (error) {
      console.error(`[Repository Error] Falló delete en ${collectionName}:`, error);
      throw error;
    }
  },

  restore: async (collectionName: string, id: string) => {
    try {
      const docRef = doc(dbInstance, collectionName, id);
      await updateDoc(docRef, { isDeleted: false }); 
    } catch (error) {
      console.error(`[Repository Error] Falló restore en ${collectionName}:`, error);
      throw error;
    }
  },

  hardDelete: async (collectionName: string, id: string) => {
    try {
      const docRef = doc(dbInstance, collectionName, id);
      await deleteDoc(docRef);
    } catch (error) {
      console.error(`[Repository Error] Falló hardDelete en ${collectionName}:`, error);
      throw error;
    }
  }
});

export const coreRepository = createRepository(defaultDb);