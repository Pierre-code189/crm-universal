// src/infrastructure/repositories/coreRepository.ts
// IMPORTANTE: Añadimos 'deleteDoc' a la lista de importaciones
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc, Firestore } from 'firebase/firestore';
import { db as defaultDb } from '../database/firebaseManager'; 

export const createRepository = (dbInstance: Firestore) => ({
  getAll: async (collectionName: string, verEliminados: boolean = false) => {
    const colRef = collection(dbInstance, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter((item: any) => {
        if (verEliminados) return item.isDeleted === true;
        return item.isDeleted !== true; 
      });
  },
  
  create: async (collectionName: string, data: any) => {
    const colRef = collection(dbInstance, collectionName);
    return await addDoc(colRef, { ...data, isDeleted: false, createdAt: new Date().toISOString() });
  },

  update: async (collectionName: string, id: string, data: any) => {
    const docRef = doc(dbInstance, collectionName, id);
    await updateDoc(docRef, data);
  },

  // BORRADO LÓGICO (Mover a la papelera)
  delete: async (collectionName: string, id: string) => {
    const docRef = doc(dbInstance, collectionName, id);
    await updateDoc(docRef, { isDeleted: true }); 
  },

  // RESTAURAR (Sacar de la papelera)
  restore: async (collectionName: string, id: string) => {
    const docRef = doc(dbInstance, collectionName, id);
    await updateDoc(docRef, { isDeleted: false }); 
  },

  // BORRADO DEFINITIVO (Destruir desde la papelera)
  hardDelete: async (collectionName: string, id: string) => {
    const docRef = doc(dbInstance, collectionName, id);
    await deleteDoc(docRef);
  }
});

export const coreRepository = createRepository(defaultDb);