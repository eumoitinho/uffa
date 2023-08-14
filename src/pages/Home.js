import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header';
import { Badge, Box, Card, Modal } from '@mantine/core';
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
import moment from 'moment';


function Home() {
  const [filters, setFilters] = useState({
    type: "",
    frequency: "30",
    fromDate: "",
    toDate: "",
  })
  const user = JSON.parse(localStorage.getItem('user'));
  const dispatch = useDispatch();
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState('add');
  const [selectedTransaction, setSelectedTransaction] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [sidebar, setSidebar] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);


  const getData = async () => {
    try {
      dispatch(ShowLoading());
      let mergedData = [];
      console.log(mergedData)

      if (navigator.onLine) {
        // Buscar transações do Firebase Firestore
        const firestoreQuery = query(collection(fireDb, `users/${user.id}/transactions`), orderBy('date', 'desc'));
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
      let filteredData = mergedData;

      if (filters.type !== "") {
        filteredData = filteredData.filter((transaction) => transaction.type === filters.type);
      }
      if (filters.frequency !== "custom-range") {
        let filterDate;
        if (filters.frequency === "7") {
          filterDate = moment().subtract(7, "days").format("YYYY-MM-DD");
        } else if (filters.frequency === "30") {
          filterDate = moment().subtract(30, "days").format("YYYY-MM-DD");
        } else if (filters.frequency === "365") {
          filterDate = moment().subtract(365, "days").format("YYYY-MM-DD");
        }
        if (filterDate) {
          filteredData = filteredData.filter((transaction) => transaction.date >= filterDate); 
        }
      } else {
        const fromDate = moment(filters.dateRange[0]).format("YYYY-MM-DD");
        const toDate = moment(filters.dateRange[1]).format("YYYY-MM-DD");
        filteredData = filteredData.filter(
          (transaction) =>
            moment(transaction.date).isBetween(moment(fromDate), moment(toDate), null, "[]")
        );
      }
     
      const sortedData = filteredData.sort((a, b) => new Date(b.date) - new Date(a.date));
      console.log('Dados finais:', sortedData)

      setFilteredTransactions(sortedData);
      dispatch(HideLoading());
      // Ordenar transações por data, descendentemente
    } catch (error) {
      console.log(error);
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
        transactions={filteredTransactions}
        />
        <DisplayBudget
        transactions={filteredTransactions}
        />
        <div>
            <Filters
            filters={filters}
            setFilters={setFilters}
            getData={getData}
            />
          </div>
          <Badge
          color="gray"
          variant="light"
          radius="xl"
          style={{ fontSize: 17, padding: '5px 5px', marginLeft: 2, marginTop: 16}}
        >
          Transações
          </Badge>
        <TransactionsTable
          transactions={filteredTransactions}
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
      <Badge
          color="gray"
          variant="light"
          radius="xl"
          style={{ fontSize: 17, padding: '5px 5px', marginLeft: 2, marginTop: 0, marginBottom: 16}}
        >
          Gráficos
          </Badge>
      <PieChart transactions={filteredTransactions} />
      </Card>
    </Box>
  );
}

export default Home;
