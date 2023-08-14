import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header';
import { Box, Card, Modal } from '@mantine/core';
import TransactionForm from '../components/transactions/TransactionForm';
import { Button } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import { fireDb } from '../firebaseConfig';
import TransactionsTable from '../components/transactions/TransactionsTable';
import { getSavedTransactionsFromIndexedDB, removeFromIndexedDB } from '../services/indexedDbService';
import DisplayBudget from '../components/budgetdisplay/BudgetDisplay';
import { Balance } from '../components/balance/Balance';
import { useFirebaseListener } from '../services/firebaseService';
import PieChart from '../components/charts/PieChart';
import Filters from '../components/filters/Filters';


function Home() {
  const [filters, setFilters] = useState({
    type: "",
    frequency: "",
  })
  const user = JSON.parse(localStorage.getItem('user'));
  const dispatch = useDispatch();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebar, setSidebar] = useState(false);



const getWhereConditions = () => {
  const tempConditions = [];
  if(filters.type !== ""){
    tempConditions.push(where('type', '==', filters.type));
  }
  return tempConditions;
};

  const getData = async () => {
    try {
      const whereConditions = getWhereConditions();
      dispatch(ShowLoading());
      let mergedData = [];
      console.log(mergedData)

      if (navigator.onLine) {
        // Buscar transações do Firebase Firestore
        const firestoreQuery = query(collection(fireDb, `users/${user.id}/transactions`), orderBy('date', 'desc'),
        ...whereConditions);
        const firestoreResponse = await getDocs(firestoreQuery);
        const firestoreData = firestoreResponse.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

         

        // Buscar transações do IndexedDB
        const indexedDBData = await getSavedTransactionsFromIndexedDB();
        console.log('ONLINE-no indexedb:', indexedDBData)

        indexedDBData.forEach((indexedDBTransaction) => {
          const existingTransaction = firestoreData.find(
            (transaction) => transaction.id === indexedDBTransaction.id
          );
          if (!existingTransaction) {
            removeFromIndexedDB(indexedDBTransaction.id);
          }
        })
        // Combinar transações do Firestore e do IndexedDB
        mergedData = mergeTransactions(firestoreData, indexedDBData);

      } else {
        const indexedDBData = await getSavedTransactionsFromIndexedDB();
        const filteredTransactionsFromIndexedDBData = indexedDBData.filter(transaction => transaction.deleteSynced === undefined || transaction.deleteSynced);
        console.log(filteredTransactionsFromIndexedDBData);
        mergedData = filteredTransactionsFromIndexedDBData;
        console.log('Dados finais OFFLINE:', mergedData)
      }
      const sortedData = mergedData.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log('Dados finais:', sortedData)

      setTransactions(sortedData);
      dispatch(HideLoading());
      // Ordenar transações por data, descendentemente
    } catch (error) {
      console.log(error);
      notifications.show({
        id: 'Erro ao buscar transação',
        message: 'Erro ao buscar transação!',
        color: 'red',
        loading: true,
      });
      dispatch(HideLoading());
    }
  };
  const mergeTransactions = (firestoreData, indexedDBData) => {
    const mergedData = [...firestoreData];

    indexedDBData.forEach((indexedDBTransaction) => {
      const existingTransactionIndex = firestoreData.findIndex(
        (transaction) => transaction.id === indexedDBTransaction.id
      );
      console.log(existingTransactionIndex)
      if (existingTransactionIndex === -1) {
        mergedData.push(indexedDBTransaction);
      } else {
        // Atualizar transação existente com os dados do IndexedDB
        mergedData[existingTransactionIndex] = {
          ...firestoreData[existingTransactionIndex],
          ...indexedDBTransaction,

        };
        console.log(mergedData)
      }
    });

    return mergedData;
  };
  useFirebaseListener(user.id, setTransactions);
  useEffect(() => {
    getData();
  }, [filters]);

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

  const handleAddTransaction = () => {
    setShowForm(true);
    setFormMode('add');
  };
  
  return (
    <Box>
          <Header sidebar={sidebar} setSidebar={setSidebar}/>
      <Card>
          {!isMobile && (
            <div className='flex justify-end'>
              <Button color="teal" onClick={handleAddTransaction}>
                Adicione Transação
              </Button>
            </div>
          )}
        <Balance
        transactions={transactions}
        />
        <DisplayBudget
        transactions={transactions}
        />
        <div>
            <Filters
            filters={filters}
            setFilters={setFilters}
            getData={getData}
            />
          </div>
        <TransactionsTable
          transactions={transactions}
          setSelectedTransaction={setSelectedTransaction}
          setFormMode={setFormMode}
          setShowForm={setShowForm}
          getData={getData}
        />
        
      </Card>
      <Modal centered size="lg" title={formMode === 'add' ? 'Adicione uma transação' : formMode === 'view' ? 'Detalhes' : 'Edite uma transação'} opened={showForm} onClose={() => setShowForm(false)}>
        <TransactionForm
          formMode={formMode}
          setFormMode={setFormMode}
          setShowForm={setShowForm}
          showForm={showForm}
          transactionData={selectedTransaction}
          getData={getData}
        />
      </Modal>
      <Card>
      <PieChart transactions={transactions} />
      </Card>
    </Box>
  );
}

export default Home;
