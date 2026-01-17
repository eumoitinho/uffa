import { useEffect, useState } from 'react';
import {
  getTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  checkTransactionExists,
  getUserById,
  getUserProfilePhoto as apiGetUserProfilePhoto,
} from './apiService';
import { checkTransactionExistsInIndexedDB, removeFromIndexedDB, storeTransactionFromFirebaseLocally } from './indexedDbService';

export const getTransactionsFromFirebase = async (userId) => {
  const transactions = await getTransactions(userId);
  return transactions;
};

export const getDataUserFromFirebase = async (userId) => {
  const user = await getUserById(userId);
  return [user]; // Retorna como array para manter compatibilidade
};

export const addTransactionToFirebase = async (userId, transaction) => {
  await addTransaction(userId, transaction);
};

export const updateTransactionInFirebase = async (userId, transaction) => {
  await updateTransaction(userId, transaction);
};

export const deleteTransactionFromFirebase = async (userId, transactionId) => {
  await deleteTransaction(userId, transactionId);
};

export const checkTransactionExistsInFirebase = async (userId, transactionId) => {
  if (!transactionId) {
    return false;
  }
  return await checkTransactionExists(userId, transactionId);
};

export const useFirebaseListener = (userId, setTransactions) => {
  const [dataChanged, setDataChanged] = useState(false);

  useEffect(() => {
    // Polling para simular real-time (já que PostgreSQL não tem listeners nativos)
    // Você pode substituir por WebSockets no backend para real-time
    const fetchTransactions = async () => {
      try {
        const transactions = await getTransactions(userId);
        setTransactions(transactions);

        // Sincronizar com IndexedDB
        transactions.forEach(async (transaction) => {
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
      } catch (error) {
        console.error('Erro ao buscar transações:', error);
      }
    };

    fetchTransactions();

    // Polling a cada 30 segundos
    const interval = setInterval(fetchTransactions, 30000);

    return () => clearInterval(interval);
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
    const photoUrl = await apiGetUserProfilePhoto(userId);
    return photoUrl || null;
  } catch (error) {
    console.error('Erro ao buscar a foto do perfil do usuário:', error);
    return null;
  }
};

export const getUserNameFromFirebase = async (userId) => {
  try {
    const user = await getUserById(userId);
    return user?.name || null;
  } catch (error) {
    console.error('Erro ao buscar o nome do usuário:', error);
    return null;
  }
};
