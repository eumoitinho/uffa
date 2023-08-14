import React from 'react';
import './ComplexListItem.css';

const ComplexListItem = ({ name, amount, date, category, icon, type }) => {
  const transactionTypeClass = type === 'Gasto' ? 'gasto' : type === 'Renda' ? 'renda' : '';

  return (
    <div className="complex-swipeable-list__item">
      <div className="complex-swipeable-list__item-label">
        <span className="complex-swipeable-list__item-icon">{icon}</span>
        <span className="complex-swipeable-list__item-name">
          {name}
        </span>
      </div>
      {amount && (
        <div className={`complex-swipeable-list__item-amount ${transactionTypeClass}`}>
          {type === 'Gasto' ? '- ' : '+ '}R$ {amount}
        </div>
      )}
      {category && (
        <div className="complex-swipeable-list__item-category">
          {category}
        </div>
      )}
      {date && (
        <div className="complex-swipeable-list__item-date custom-date">
          {date}
        </div>
      )}
    </div>
  );
};

export default ComplexListItem;
