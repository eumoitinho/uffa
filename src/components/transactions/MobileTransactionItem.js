import React, { useState } from 'react';
import { SwipeableList, SwipeableListItem } from '@sandstreamdev/react-swipeable-list';
import '@sandstreamdev/react-swipeable-list/dist/styles.css';
import ComplexSwipeContent from '../complexlist/ComplexSwipeContent';
import ComplexListItem from '../complexlist/ComplexListItem';
import {DeleteIcon, AlimentacaoIcon, TransporteIcon, ComprasIcon, EntretenimentoIcon, SaudeIcon, EducacaoIcon, SalarioIcon, FreelanceIcon, VendasIcon, DetalhesIcon } from "../images/icons";
import moment from 'moment';

export const MobileTransactionItem = ({
  transactions,
  onDeleteTransaction,
  onSelectTransaction,
  setFormMode,
  setShowForm,
}) => {

  const [triggeredItemAction, triggerItemAction] = useState("None");
  const [swipeProgress, handleSwipeProgress] = useState();
  const [swipeAction, handleSwipeAction] = useState("None");
 

  const categoryIcons = {
    Alimentação: <AlimentacaoIcon />,
    Transporte: <TransporteIcon />,
    Compras: <ComprasIcon />,
    Entretenimento: <EntretenimentoIcon />,
    Saúde: <SaudeIcon />,
    Educação: <EducacaoIcon />,
    Salario: <SalarioIcon />,
    Freelance: <FreelanceIcon />,
    Vendas: <VendasIcon />,
  };
  const swipeLeftOptions = (transaction) => ({
    content: (
      <ComplexSwipeContent
        icon={<DeleteIcon />}
        label="Delete"
        position="right"
      />
    ),
    action: () => onDeleteTransaction(transaction.id),
  });

  const swipeRightOptions = (transaction) => ({
    content: (
      <ComplexSwipeContent
        icon={<DetalhesIcon />}
        label="Details"
        position="left"
      />
    ),
    action: () => {
      onSelectTransaction(transaction);
      setFormMode('edit');
      setShowForm(true);
    },
  });
  console.log(transactions);
  const maxVisibleTransactions = 4; // Número máximo de transações a serem exibidas
  const transactionHeight = 120; // Altura estimada de cada transação em pixels
  const transactionSpacing = 0; // Espaçamento vertical entre transações em pixels

  const containerHeight = Math.min(
    transactions.length * (transactionHeight + transactionSpacing),
    
    maxVisibleTransactions * (transactionHeight + transactionSpacing)
  );
  console.log(transactions.length);
  const containerStyle = {
    height: `${containerHeight}px`,
  };


  const handleSwipeStart = () => {
    handleSwipeAction("Swipe started");
  };

  const handleSwipeEnd = () => {
    handleSwipeAction("Swipe ended");
    handleSwipeProgress();
  };

  const handleAddTransaction = () => {
    setShowForm(true);
    setFormMode('add');
  };

  const threshold = 0.25;
  return (
    <div className="complex-swipeable-list__container" style={containerStyle}>
      {transactions.length > 0 ? (
        <SwipeableList threshold={threshold}>
          {transactions.map((transaction) => {
            const icon = categoryIcons[transaction.category] || null;
            return (
              <SwipeableListItem
                key={transaction.id}
                swipeLeft={swipeLeftOptions(transaction)}
                swipeRight={swipeRightOptions(transaction)}
                onSwipeEnd={handleSwipeEnd}
                onSwipeProgress={handleSwipeProgress}
                onSwipeStart={handleSwipeStart}
              >
                <ComplexListItem
                  icon={icon}
                  name={transaction.name}
                  category={transaction.category}
                  type={transaction.type}
                  amount={transaction.amount}
                  date={moment(transaction.date).format("DD/MM/YYYY")}
                />
              </SwipeableListItem>
            );
          })}
        </SwipeableList>
      ) : (
        <div className="no-transactions-message">
          Não há transações disponíveis.
        </div>
      )}
      {transactions.length >= 0 && (
        <button className="floating-button" onClick={handleAddTransaction}>
          +
        </button>
      )}
    </div>
  );
}
