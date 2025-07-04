import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../contexts/ThemeContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const MonthlyTurnoverChart = ({ data, year }) => {
  const { isDark } = useTheme();
  
  // Vérifier que data est un tableau valide
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="text-center text-gray-500 dark:text-gray-400">
          Aucune donnée disponible
        </div>
      </div>
    );
  }

  const chartData = {
    labels: data.map(item => item.monthName),
    datasets: [
      {
        label: `Paid Turnover ${year}`,
        data: data.map(item => item.turnover || 0),
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          },
          color: isDark ? '#d1d5db' : '#374151'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      },
      x: {
        ticks: {
          color: isDark ? '#d1d5db' : '#374151'
        },
        grid: {
          color: isDark ? '#374151' : '#e5e7eb'
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: isDark ? '#d1d5db' : '#374151'
        }
      },
      title: {
        display: true,
        text: `Monthly Paid Turnover - ${year}`,
        color: isDark ? '#d1d5db' : '#374151'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return 'Turnover: $' + context.parsed.y.toLocaleString();
          }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default MonthlyTurnoverChart; 