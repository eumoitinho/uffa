import React from 'react';
import { Table, Group} from '@mantine/core';
import moment from 'moment';

export const AnyDeviceItens = ({
  transactions,
  setSelectedTransaction,
  setFormMode,
  setShowForm,
  deleteTransaction,
}) => {
  const getRows = transactions.map((transaction) => (
    <tr key={transaction.id}>
      <td>{transaction.name}</td>
      <td>{transaction.type}</td>
      <td>{"R$ " + transaction.amount}</td>
      <td>{moment(transaction.date).format('DD/MM/YYYY')}</td>
      <td>{transaction.category}</td>
      <td>{transaction.reference ? (
        transaction.reference
      ) : (
        <span className="no-description">Sem descrição :(</span>
      )}</td>
      <td>
        <Group>
          <i
            className="ri-pencil-line"
            onClick={() => {
              setSelectedTransaction(transaction);
              setFormMode('edit');
              setShowForm(true);
            }}
          ></i>
          <i
            className="ri-delete-bin-line"
            onClick={() => {
              deleteTransaction(transaction.id);
            }}
          ></i>
        </Group>
      </td>
    </tr>
  ));

  return (
    <>
      <Table verticalSpacing="xs" horizontalSpacing="xs">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Valor</th>
            <th>Data</th>
            <th>Categoria</th>
            <th>Descrição</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>{getRows}</tbody>
      </Table>
    </>
  );
};

export default AnyDeviceItens;
