import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';


const PieChart = ({ transactions }) => {
  const chartRef = useRef(null);

  // Função para formatar os dados das transações para o gráfico
const formatDataForChart = (transactions) => {
  const categoryTotals = {};

  // Calcula o total gasto em cada categoria
  transactions.forEach((transaction) => {
    const { category, amount } = transaction;
    const formattedAmount = parseFloat(amount.replace("R$", "").replace(",", "."));
    categoryTotals[category] = (categoryTotals[category] || 0) + formattedAmount;
  });

  // Cria os labels (rótulos) com as categorias e os dados com os totais gastos
  const labels = Object.keys(categoryTotals);
  const data = Object.values(categoryTotals);

  // Define as cores de fundo para cada fatia do gráfico
  const backgroundColor = ['green', 'blue', 'yellow'];


  return {
    labels,
    datasets: [
      {
        label: 'Transações', // Rótulo do dataset
        data, // Valores para cada categoria
        backgroundColor, // Cores de fundo para cada fatia do gráfico
      },
    ],
  };
};

  
  
  

  useEffect(() => {
    let chartInstance = null;

    if (chartRef.current) {
      // Destruir a instância do gráfico anterior, se existir
      if (chartInstance) {
        chartInstance.destroy();
      }

      // Criar um novo gráfico
      const ctx = chartRef.current.getContext('2d');
      chartInstance = new Chart(ctx, {
        type: 'doughnut', // Tipo do gráfico (doughnut para gráfico de rosquinha)
        data: formatDataForChart(transactions), // Dados formatados para o gráfico
        options: {
          responsive: true, 
          maintainAspectRatio: false,
        },
      });
      console.log(chartInstance);
    }
    

    return () => {
      // Destruir a instância do gráfico ao desmontar o componente
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [transactions]);

  return (
    <div className="mobile-container-view">
      {transactions.length > 0 ? (
      <canvas ref={chartRef}></canvas>
      ) : (
        <div className="no-transactions-message">
          Não há nada para exibir aqui :(
        </div>
      )}
    </div>
  );
};

export default PieChart;
