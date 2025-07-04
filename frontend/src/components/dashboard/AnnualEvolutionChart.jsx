import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const AnnualEvolutionChart = ({ data }) => {
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const chartData = {
    labels: monthNames,
    datasets: data.map((yearData, index) => ({
      label: `${yearData.year} (Total: $${yearData.annualTotal.toLocaleString()})`,
      data: yearData.monthlyData.map(item => item.turnover),
      borderColor: index === 0 ? 'rgba(59, 130, 246, 1)' : 
                  index === 1 ? 'rgba(16, 185, 129, 1)' : 'rgba(245, 158, 11, 1)',
      backgroundColor: index === 0 ? 'rgba(59, 130, 246, 0.1)' : 
                     index === 1 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
      borderWidth: 2,
      fill: false,
      tension: 0.1,
    })),
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Annual Turnover Evolution',
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return context.dataset.label.split(' (')[0] + ': $' + context.parsed.y.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AnnualEvolutionChart; 