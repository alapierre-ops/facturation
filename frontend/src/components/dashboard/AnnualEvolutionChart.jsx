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
import { useTheme } from '../../contexts/ThemeContext';

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
  const { isDark } = useTheme();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                     'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
    labels: monthNames,
    datasets: data.map((yearData, index) => ({
      label: `${yearData.year} (Total: $${(yearData.annualTotal || 0).toLocaleString()})`,
      data: yearData.monthlyData?.map(item => item.turnover || 0) || Array(12).fill(0),
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
        text: 'Annual Turnover Evolution',
        color: isDark ? '#d1d5db' : '#374151'
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
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <Line data={chartData} options={options} />
    </div>
  );
};

export default AnnualEvolutionChart; 