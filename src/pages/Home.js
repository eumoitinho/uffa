import React, { useEffect, useState } from 'react';
import Header from '../components/header/Header';
import { Badge, Box, Card, Modal, Text, Group } from '@mantine/core';
import TransactionForm from '../components/transactions/TransactionForm';
import { Button } from '@mantine/core';
import { getTransactions } from '../services/apiService';
import { useDispatch } from 'react-redux';
import { HideLoading, ShowLoading } from '../redux/alertsSlice';
import TransactionsTable from '../components/transactions/TransactionsTable';
import { getSavedTransactionsFromIndexedDB, removeFromIndexedDB } from '../services/indexedDbService';
import DisplayBudget from '../components/budgetdisplay/BudgetDisplay';
import { Balance } from '../components/balance/Balance';
import { useFirebaseListener } from '../services/firebaseService';
import PieChart from '../components/charts/PieChart';
import Filters from '../components/filters/Filters';
import moment from 'moment';
import { IconPlus } from '@tabler/icons-react';


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
        // Buscar transações da API PostgreSQL
        const apiData = await getTransactions(user.id);
        const formattedData = apiData.map((transaction) => ({
          id: transaction.id,
          ...transaction,
        }));

        // Buscar transações do IndexedDB
        const indexedDBData = await getSavedTransactionsFromIndexedDB();
        console.log('ONLINE-no indexedb:', indexedDBData)

        indexedDBData.forEach((indexedDBTransaction) => {
          const existingTransaction = formattedData.find(
            (transaction) => transaction.id === indexedDBTransaction.id
          );
          if (!existingTransaction) {
            removeFromIndexedDB(indexedDBTransaction.id);
          }
        })
        // Combinar transações da API e do IndexedDB
        mergedData = mergeTransactions(formattedData, indexedDBData);

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
  const mergeTransactions = (apiData, indexedDBData) => {
    const mergedData = [...apiData];

    indexedDBData.forEach((indexedDBTransaction) => {
      const existingTransactionIndex = apiData.findIndex(
        (transaction) => transaction.id === indexedDBTransaction.id
      );
      console.log(existingTransactionIndex)
      if (existingTransactionIndex === -1) {
        mergedData.push(indexedDBTransaction);
      } else {
        // Atualizar transação existente com os dados do IndexedDB
        mergedData[existingTransactionIndex] = {
          ...apiData[existingTransactionIndex],
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
    <Box style={{ backgroundColor: '#f8f9fa', minHeight: '100vh' }}>
      <Header sidebar={sidebar} setSidebar={setSidebar}/>

      <Box p="md" maw={1200} mx="auto">
        {/* Balance Card */}
        <Card mb="md" radius="lg" padding="xl" withBorder>
          <Balance transactions={filteredTransactions} />
        </Card>

        {/* Budget Display */}
        <Card mb="md" radius="lg" withBorder>
          <DisplayBudget transactions={filteredTransactions} />
        </Card>

        {/* Actions & Filters */}
        <Card mb="md" radius="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">Filtros</Text>
            {!isMobile && (
              <Button
                color="teal"
                onClick={handleAddTransaction}
                leftSection={<IconPlus size={18} />}
                radius="md"
              >
                Nova Transação
              </Button>
            )}
          </Group>
          <Filters
            filters={filters}
            setFilters={setFilters}
            getData={getData}
          />
        </Card>

        {/* Transactions */}
        <Card mb="md" radius="lg" withBorder>
          <Group justify="space-between" mb="md">
            <Text fw={600} size="lg">Transações</Text>
            <Badge color="teal" variant="light" size="lg">
              {filteredTransactions.length} {filteredTransactions.length === 1 ? 'item' : 'itens'}
            </Badge>
          </Group>
          <TransactionsTable
            transactions={filteredTransactions}
            setSelectedTransaction={setSelectedTransaction}
            setFormMode={setFormMode}
            setShowForm={setShowForm}
            getData={getData}
          />
        </Card>

        {/* Charts */}
        <Card radius="lg" withBorder>
          <Text fw={600} size="lg" mb="md">Gráficos</Text>
          <PieChart transactions={filteredTransactions} />
        </Card>
      </Box>

      <Modal
        centered
        size="lg"
        title={
          <Text fw={600}>
            {formMode === 'add' ? 'Nova Transação' : formMode === 'view' ? 'Detalhes' : 'Editar Transação'}
          </Text>
        }
        opened={showForm}
        onClose={() => setShowForm(false)}
        radius="lg"
      >
        <TransactionForm
          formMode={formMode}
          setFormMode={setFormMode}
          setShowForm={setShowForm}
          showForm={showForm}
          transactionData={selectedTransaction}
          getData={getData}
        />
      </Modal>
    </Box>
  );
}

export default Home;
