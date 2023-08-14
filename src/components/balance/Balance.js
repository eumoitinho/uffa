import React from 'react';

export const Balance = ({ transactions }) => {
  const { income = 0, expense = 0 } = transactions.reduce(
    (acc, transaction) => {
      const amount = Number(transaction.amount.replace(/[^\d.-]/g, ''));
      if (transaction.type === 'Gasto') {
        acc.expense += amount;
      } else if (transaction.type === 'Renda') {
        acc.income += amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const balance = income - expense; // Cálculo do saldo

  const formattedBalance = balance.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  return (
    <>
      <h4 style={{ marginTop: '3px', textAlign: 'center'  }}>Seu saldo</h4>
      <h1 style={{ marginTop: '0px', fontSize: '32px', textAlign: 'center' }}>{formattedBalance}</h1>
    </>
  );
};

export default Balance;
