import { collection, doc, getDocs, setDoc, deleteDoc, query, where, onSnapshot, orderBy, getDoc } from 'firebase/firestore';

import { fireDb } from '../firebaseConfig';
import { useEffect, useState } from 'react';
import { checkTransactionExistsInIndexedDB, removeFromIndexedDB, storeTransactionFromFirebaseLocally } from './indexedDbService';


export const getTransactionsFromFirebase = async (userId) => {
  const querySnapshot = await getDocs(collection(fireDb, `users/${userId}/transactions`));
  return querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getDataUserFromFirebase = async (userId) => {
  const querySnapshot = await getDocs(collection(fireDb, 'users')); // Correção aqui
  return querySnapshot.docs
    .filter((doc) => doc.id === userId)
    .map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
};


export const addTransactionToFirebase = async (userId, transaction) => {
  await setDoc(doc(fireDb, `users/${userId}/transactions`, transaction.id), transaction);
};

export const updateTransactionInFirebase = async (userId, transaction) => {
  await setDoc(doc(fireDb, `users/${userId}/transactions`, transaction.id), transaction);
};

export const deleteTransactionFromFirebase = async (userId, transactionId) => {
  await deleteDoc(doc(fireDb, `users/${userId}/transactions`, transactionId));
};

export const checkTransactionExistsInFirebase = async (userId, transactionId) => {
  if (!transactionId) {
    return false; // A transação não possui um ID definido
  }

  const querySnapshot = await getDocs(
    query(collection(fireDb, `users/${userId}/transactions`), where('id', '==', transactionId))
  );

  return !querySnapshot.empty;
};

export const useFirebaseListener = (userId, setTransactions) => {
  const [dataChanged, setDataChanged] = useState(false);
  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(fireDb, `users/${userId}/transactions`), orderBy("date", "desc")),
      (snapshot) => {
        const updatedTransactions = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTransactions(updatedTransactions);
        updatedTransactions.forEach(async (transaction) => {
          const transactionExists = await checkTransactionExistsInIndexedDB(transaction.id);
          if (transaction.deleteSynced === false) {
            if (transactionExists) {
              removeFromIndexedDB(transaction.id);
            }
          } else {
            if (!transactionExists) {
              storeTransactionFromFirebaseLocally(transaction);
            }
          }
        });
      }
    );

    return () => unsubscribe();
  }, [userId, setTransactions]);
  useEffect(() => {
    if (dataChanged) {
      setDataChanged(false);
    }
  }, [dataChanged]);
};

// Função para buscar a foto do perfil do usuário
export const getUserProfilePhoto = async (userId) => {
  try {
    // Obtém o documento do usuário no Firestore
    const userDocRef = doc(fireDb, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Se o usuário existir, verifique se ele possui um URL de foto de perfil
      const userData = userDocSnap.data();
      if (userData && userData.photo) {
        return userData.photo;
      } else {
        // Caso não tenha uma foto de perfil definida, retorne null
        return null;
      }
    } else {
      // Se o documento do usuário não existir, retorne null
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar a foto do perfil do usuário:', error);
    return null;
  }
};

export const getUserNameFromFirebase = async (userId) => {
  try {
    // Obtém o documento do usuário no Firestore
    const userDocRef = doc(fireDb, 'users', userId);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      // Se o usuário existir, verifique se ele possui um nome
      const userData = userDocSnap.data();
      if (userData && userData.name) {
        return userData.name;
      } else {
        // Caso não tenha um nome definido, retorne null
        return null;
      }
    } else {
      // Se o documento do usuário não existir, retorne null
      return null;
    }
  } catch (error) {
    console.error('Erro ao buscar o nome do usuário:', error);
    return null;
  }
};