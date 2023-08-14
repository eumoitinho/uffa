
import { generateTransactionId } from "./IdGenerator";
import {checkTransactionExistsInFirebase } from "./firebaseService"
export const openIndexedDB = () => {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open('Uffa_DB_Local', 1);

    request.onerror = () => {
      reject('Erro ao abrir o banco de dados IndexedDB');
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore('transactions', { keyPath: 'id' });
    };
  });
};
export const getSavedTransactionsFromIndexedDB = async () => {
  try {
    const db = await openIndexedDB();
    const transactionStore = db.transaction('transactions', 'readonly').objectStore('transactions');
    const indexedDBTransaction = [];

    return new Promise((resolve, reject) => {
      const cursorRequest = transactionStore.openCursor();
      cursorRequest.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          const transactionData = {
            id: cursor.value.id,
            ...cursor.value
          };
          indexedDBTransaction.push(transactionData);
          cursor.continue();
        } else {
          resolve(indexedDBTransaction);
        }
      };

      cursorRequest.onerror = (event) => {
        console.log('Erro ao obter transações do IndexedDB:', event.target.error);
        reject([]);
      };

      db.close();
    });
  } catch (error) {
    console.log('Erro ao buscar transações do IndexedDB:', error);
    return [];
  }
};


export const removeFromIndexedDB = async (transaction) => {
  try {
    const db = await openIndexedDB();
    const transactionStore = db.transaction('transactions', 'readwrite').objectStore('transactions');

    const deleteRequest = transactionStore.delete(transaction);
    deleteRequest.onsuccess = () => {
      console.log('Transação removida do IndexedDB');
    };
    deleteRequest.onerror = (event) => {
      console.log('Erro ao remover a transação do IndexedDB:', event.target.error);
    };

    db.close();
  } catch (error) {
    console.log('Erro ao remover a transação do IndexedDB:', error);
  }
};

export const storeTransactionLocally = async (transaction) => {
  const transactionExists = await checkTransactionExistsInFirebase(transaction.id);

  if (!transactionExists) {
    const db = await openIndexedDB();
    const transactionStore = db.transaction('transactions', 'readwrite').objectStore('transactions');

    // Certifique-se de que a transação tenha um ID definido antes de adicioná-la ao IndexedDB
    if (!transaction.id) {
      transaction.id = generateTransactionId(); // Gere um ID para a transação
    }

    await transactionStore.add(transaction);

    db.close();
  }
};
export const checkTransactionExistsInIndexedDB = async (transactionId) => {
  const db = await openIndexedDB();
  const transactionStore = db.transaction('transactions', 'readonly').objectStore('transactions');
  const request = transactionStore.get(transactionId);

  return new Promise((resolve, reject) => {
    request.onsuccess = (event) => {
      const transaction = event.target.result;
      resolve(!!transaction); // Retorna true se a transação existe ou false caso contrário
    };

    request.onerror = () => {
      reject(new Error('Erro ao verificar a existência da transação no IndexedDB.'));
    };
  });
};








export const storeTransactionFromFirebaseLocally = async (transaction) => {
  const transactionExists = await checkTransactionExistsInFirebase(transaction.id);

  if (!transactionExists) {
    const db = await openIndexedDB();
    const transactionStore = db.transaction('transactions', 'readwrite').objectStore('transactions');

    // Certifique-se de que a transação tenha um ID definido antes de adicioná-la ao IndexedDB
    if (!transaction.id) {
      transaction.id = generateTransactionId(); // Gere um ID para a transação
    }

    await transactionStore.add(transaction);

    db.close();
  }
};
export const editTransactionLocally = async (transaction) => {
  try {
    const db = await openIndexedDB();
    const transactionStore = db.transaction('transactions', 'readwrite').objectStore('transactions');

    const updateRequest = transactionStore.put(transaction);
        updateRequest.onsuccess = () => {
          console.log('Documento atualizado com sucesso no IndexedDB');
        };
      updateRequest.onerror = (event) => {
      console.log('Erro ao atualizar a transação no IndexedDB:', event.target.error);
    };

    db.close();
  } catch (error) {
    console.log('Erro ao atualizar a transação no IndexedDB:', error);
  }
};

export const markTransactionAsSynced = async (transaction) => {
  try {
    const db = await openIndexedDB();
    const transactionStore = db
      .transaction('transactions', 'readwrite')
      .objectStore('transactions');

    const getRequest = transactionStore.get(transaction.id);
    getRequest.onsuccess = (event) => {
      const storedTransaction = event.target.result;
      if (storedTransaction && !storedTransaction.synced) {
        storedTransaction.synced = true;
        const putRequest = transactionStore.put(storedTransaction);
        putRequest.onsuccess = () => {
          console.log('Transação marcada como sincronizada no IndexedDB');
        };
        putRequest.onerror = (event) => {
          console.log(
            'Erro ao marcar a transação como sincronizada no IndexedDB:',
            event.target.error
          );
        };
      }
    };
    getRequest.onerror = (event) => {
      console.log(
        'Erro ao obter a transação do IndexedDB:',
        event.target.error
      );
    };

    await new Promise((resolve) => {
      db.oncomplete = () => {
        resolve();
      };
    });

    db.close();
  } catch (error) {
    console.log('Erro ao marcar a transação como sincronizada:', error);
  }
};

export const markDeletedTransactionToSync = async (userId, transaction) => {
  try {
    const db = await openIndexedDB();
    const transactionStore = db.transaction('transactions', 'readwrite').objectStore('transactions');

    const getRequest = transactionStore.get(transaction.id);

    await new Promise((resolve, reject) => {
      getRequest.onsuccess = (event) => {
        const deletedStoredTransaction = event.target.result;
        if (deletedStoredTransaction && !deletedStoredTransaction.deleteSynced) {
          deletedStoredTransaction.deleteSynced = false;
          const putDeleteRequest = transactionStore.put(deletedStoredTransaction);
          putDeleteRequest.onsuccess = () => {
            console.log('Transação deletada marcada como não sincronizada no IndexedDB');
            resolve(); // Resolver a Promessa após a conclusão da operação
          };
          putDeleteRequest.onerror = (event) => {
            console.log(
              'Erro ao marcar a transação como não sincronizada no IndexedDB:',
              event.target.error
            );
            reject(); // Rejeitar a Promessa em caso de erro
          };
        } else {
          resolve(); // Resolver a Promessa caso a transação não precise ser atualizada
        }
      };

      getRequest.onerror = (event) => {
        console.log(
          'Erro ao obter a transação do IndexedDB:',
          event.target.error
        );
        reject(); // Rejeitar a Promessa em caso de erro
      };
    });

    db.close();
  } catch (error) {
    console.log('Erro ao marcar a transação como não sincronizada:', error);
  }
};




