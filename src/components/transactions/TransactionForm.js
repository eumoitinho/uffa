import React, { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { Select, Stack, TextInput, Button, Group } from "@mantine/core";
import { useDispatch } from "react-redux";
import { notifications } from "@mantine/notifications";
import { HideLoading, ShowLoading } from "../../redux/alertsSlice";
import { editTransactionLocally, markTransactionAsSynced, openIndexedDB, storeTransactionLocally } from '../../services/indexedDbService';
import { addTransactionToFirebase, updateTransactionInFirebase } from "../../services/firebaseService";

function TransactionForm({
  formMode,
  setFormMode,
  setShowForm,
  transactionData,
  getData,
}) {
  const transactionForm = useForm({
    initialValues: {
      name: "",
      type: "",
      amount: "",
      date: "",
      category: "",
      reference: "",
    },
    validate: {
      // Suas validações existentes
      // ...
      type: (value) => (!value ? "Selecione um tipo de transação" : null),
      date: (value) => (!value ? "Selecione uma data" : null),
      name: (value) => (!value ? "Digite o nome da transação" : null),
      amount: (value) => (!value ? "Digite um valor" : null),
      category: (value) => (!value ? "Selecione uma categoria" : null),
    },
  });

  const [formattedAmount, setFormattedAmount] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const dispatch = useDispatch();
  const user = JSON.parse(localStorage.getItem("user"));

  const onSubmit = async (event) => {
    event.preventDefault();
    transactionForm.validate();
    if (transactionForm.isValid()) {
      try {
        dispatch(ShowLoading());
        const transaction = {
          ...transactionForm.values,
          amount: parseCurrencyValue(transactionForm.values.amount),
        };
        if (navigator.onLine) {
          if (formMode === "add") {
            await storeTransactionLocally(transaction); // salva no indexedDb (offline)
            await addTransactionToFirebase(user.id, transaction); // salva no firebase (online)
          } else {
            await updateTransactionInFirebase(user.id, transaction); // edita no firebase (online)
            await editTransactionLocally(transaction); // edita no indexedDb (offline)
          }
          markTransactionAsSynced(transaction); // marca a transação no indexedDb como sync quando adicionada Online para evitar duplicatas
          notifications.show({
            title:
              formMode === "add"
                ? "Transação adicionada com sucesso"
                : "Transação atualizada com sucesso",
            color: "teal",
          });
        } else {
          if (formMode === "add") {
            await storeTransactionLocally(transaction); // salva no indexedDb (offline) quando não há conexão  
          } else {
            await editTransactionLocally(transaction); // edita no indexedDb (offline) quando não há conexão 
          }notifications.show({
            title:
              formMode === "add"
                ? "Transação adicionada offline com sucesso"
                : "Transação atualizada offline com sucesso",
            color: "teal",
          });
        }
        getData();
        setShowForm(false);
        dispatch(HideLoading());
      } catch (error) {
        console.log(error);
        notifications.show({
          title:
            formMode === "add"
              ? "Falha ao adicionar transação"
              : "Falha ao atualizar transação",
          color: "red",
          loading: true,
        });
      } finally {
        dispatch(HideLoading());
      }
    }
  };
  


  const formatCurrencyValue = (value) => {
    const formattedValue = value.replace(/\D/g, "");
    const numberValue = parseFloat(formattedValue) / 100;
    return numberValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const parseCurrencyValue = (value) => {
    const numericValue = parseFloat(value.replace(/[R$,.]/g, "")) / 100;
    return numericValue.toFixed(2);
  };

  const handleAmountChange = (event) => {
    const inputValue = event.target.value;
    setFormattedAmount(formatCurrencyValue(inputValue));
    transactionForm.setFieldValue("amount", inputValue);
  };

  useEffect(() => {
    const handleOnlineEvent = () => {
      // Verificar a conexão e sincronizar as transações offline
      syncOfflineTransactions();
    };

    window.addEventListener('online', () => {
      if (navigator.onLine) {
        handleOnlineEvent();
      }
    });
  },);

  const syncOfflineTransactions = async () => {
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
      const transactionsToSend = [];

      cursorRequest.onsuccess = async (event) => {
        const cursor = event.target.result;

        if (cursor) {
          const transaction = cursor.value;

          if (!transaction.synced) {
            transactionsToSend.push(transaction);
          }

          cursor.continue();
        } else {
          for (const offlineTransaction of transactionsToSend) {
            await addTransactionToFirebase(user.id, offlineTransaction);
            markTransactionAsSynced(offlineTransaction);
          }
        }
      };

      db.close();
    } catch (error) {
      console.log('Erro ao sincronizar as transações offline:', error);
    } finally {
      setIsSyncing(false);
    }
  };


  useEffect(() => {
    if (formMode === "edit") {
      transactionForm.setValues(transactionData);
      const formattedAmount = formatCurrencyValue(transactionData.amount);
      setFormattedAmount(formattedAmount);
    }
  }, [transactionData]);
  
  useEffect(() => {
    if (formMode === "view") {
      transactionForm.setValues(transactionData);
      const formattedAmount = formatCurrencyValue(transactionData.amount);
      setFormattedAmount(formattedAmount);
    }
  }, [transactionData]);

 

  return (
    <div>
      <form action="" onSubmit={onSubmit}>
        <Stack gap="md">
          <TextInput
            name="name"
            label="Nome"
            placeholder="Digite o nome da transação"
            withAsterisk
            {...transactionForm.getInputProps("name")}
            disabled={formMode === "view"}
          />
          <Group grow>
            <Select
              name="type"
              label="Tipo"
              placeholder="Selecione o tipo de transação"
              withAsterisk
              data={[
                { value: "Renda", label: "Renda" },
                { value: "Gasto", label: "Gasto" },
              ]}
              disabled={formMode === "view"}
              {...transactionForm.getInputProps("type")}
            />
            <Select
              name="category"
              label="Categoria"
              withAsterisk
              placeholder="Selecione a categoria"
              data={[
                { value: "Alimentação", label: "Alimentação" },
                { value: "Transporte", label: "Transporte" },
                { value: "Compras", label: "Compras" },
                { value: "Entretenimento", label: "Entretenimento" },
                { value: "Saúde", label: "Saúde" },
                { value: "Educação", label: "Educação" },
                { value: "Salario", label: "Salário" },
                { value: "Freelance", label: "Freelance" },
                { value: "Vendas", label: "Vendas" },
              ]}
              {...transactionForm.getInputProps("category")}
              disabled={formMode === "view"}
            />
          </Group>
          <Group grow>
            <TextInput
              label="Valor"
              placeholder="R$ 100,00"
              name="amount"
              inputMode="numeric"
              type="text"
              withAsterisk
              value={formattedAmount}
              onChange={handleAmountChange}
              disabled={formMode === "view"}
            />
            <TextInput
              name="date"
              label="Data"
              type="date"
              withAsterisk
              placeholder="Digite a data da transação"
              {...transactionForm.getInputProps("date")}
              disabled={formMode === "view"}
            />
          </Group>

          <TextInput
            name="reference"
            label="Descrição"
            placeholder="Digite a descrição da transação"
            {...transactionForm.getInputProps("reference")}
            disabled={formMode === "view"}
          />
          {formMode !== "view" && (
            <Button color="teal" type="submit">
              Salvar
            </Button>
          )}
          {formMode !== "view" && (
            <Button
              color="gray"
              variant="outline"
              onClick={() => {
                setShowForm(false);
                setFormMode("");
              }}
            >
              Cancelar
            </Button>
          )}
        </Stack>
      </form>
    </div>
  );
}

export default TransactionForm;
