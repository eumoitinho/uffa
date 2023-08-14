import React from 'react';
import './BudgetDisplayStyles.css';

export const DisplayBudget = ({ transactions }) => {
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
    console.log(income, expense);
  const currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const formattedIncome = currencyFormatter.format(income);
  const formattedExpense = currencyFormatter.format(expense);

  return (
    <div className="displaybudget-container">
      <div>
        <h4>Rendas</h4>
        <p className="money income">{formattedIncome}</p>
      </div>
      <div>
        <h4>Gastos</h4>
        <p className="money expense">{formattedExpense}</p>
      </div>
    </div>
  );
};

export default DisplayBudget;
