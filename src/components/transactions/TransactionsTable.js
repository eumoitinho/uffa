import React, { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../../redux/alertsSlice';
import { notifications } from '@mantine/notifications';
import { deleteTransactionFromFirebase } from '../../services/firebaseService';
import { markDeletedTransactionToSync, openIndexedDB, removeFromIndexedDB } from '../../services/indexedDbService';
import { MobileTransactionItem } from './MobileTransactionItem';
import { AnyDeviceItens } from './AnyDeviceItens';

function TransactionsTable({ transactions, setSelectedTransaction, setFormMode, setShowForm, getData }) {
  const [isMobile, setIsMobile] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem('user'));

  const deleteTransaction = async (id) => {
    try {
      dispatch(ShowLoading());
      if (navigator.onLine) {
        await deleteTransactionFromFirebase(user.id, id);
        await removeFromIndexedDB(id);
        notifications.show({
        id: 'Transação excluída com sucesso!',
        message: 'Transação excluída com sucesso!',
        color: 'teal',
      });
      getData();
    }else{
      const transaction = { id };
      await markDeletedTransactionToSync(user.id, transaction);
      notifications.show({
        id: 'Transação excluída offline com sucesso!',
        message: 'Transação excluída offline com sucesso!',
        color: 'teal',
      });
      getData();
    }
    dispatch(HideLoading());
    } catch (error) {
      console.log(error);
      notifications.show({
        id: 'Falha ao excluir transação!',
        message: 'Falha ao excluir transação!',
        color: 'red',
        loading: true,
      });
      dispatch(HideLoading());
    }
  };

  
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [transactions]);

  
  const syncOfflineDeletedTransactions = async () => {
    if (isSyncing) {
      return;
    }
    try {
      setIsSyncing(true);
      if (!navigator.onLine) {
        return;
      }
  
      const db = await openIndexedDB();
      const transactionStore = db.transaction('transactions', 'readwrite').objectStore('transactions');
  
      const cursorRequest = transactionStore.openCursor();
      const deleteTransactionsInFirebase = [];
  
      cursorRequest.onsuccess = async (event) => {
        const cursor = event.target.result;
  
        if (cursor) {
          const transaction = cursor.value;
  
          if (transaction.deleteSynced === false) {
            deleteTransactionsInFirebase.push(transaction);
          }
          cursor.continue();
        } else {
          for (const offlineTransaction of deleteTransactionsInFirebase) {
            await deleteTransactionFromFirebase(user.id, offlineTransaction.id); // Corrigido para passar apenas o ID da transação
            await removeFromIndexedDB(offlineTransaction.id); // Adicionado para remover a transação do IndexedDB após exclusão no Firebase
          }
        }
      };
  
      db.close();
    } catch (error) {
      console.log('Erro ao sincronizar as transações deletadas offline:', error);
    } finally {
      setIsSyncing(false);
    }
  };
  useEffect(() => {
    const handleOnlineEvent = () => {
      // Verificar a conexão e sincronizar as transações offline
      syncOfflineDeletedTransactions(syncOfflineDeletedTransactions);
    };

    window.addEventListener('online', handleOnlineEvent);

    return () => {
      window.removeEventListener('online', handleOnlineEvent);
    };
  },);

  if (isMobile) {
    return (
      <MobileTransactionItem
        transactions={transactions}
        onDeleteTransaction={deleteTransaction}
        onSelectTransaction={(transaction) => {
          setSelectedTransaction(transaction);
          setFormMode('edit');
          setShowForm(true);
        }}
        setFormMode={setFormMode}
        setShowForm={setShowForm}
        getData={getData}
      />
    );
  }

  return (
    <AnyDeviceItens
      transactions={transactions}
      setSelectedTransaction={setSelectedTransaction}
      setFormMode={setFormMode}
      setShowForm={setShowForm}
      deleteTransaction={deleteTransaction}
      getData={getData}
    />
  );
}

export default TransactionsTable;
