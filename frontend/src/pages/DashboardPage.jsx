import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiDollarSign, FiTrendingUp, FiClock, FiFileText, FiTarget, FiAlertCircle } from 'react-icons/fi';
import { useLanguage } from '../contexts/LanguageContext';
import { getAnnualSummary, getQuarterlySummary, getMonthlyTurnover, getAnnualEvolution } from '../api';
import MonthlyTurnoverChart from '../components/dashboard/MonthlyTurnoverChart';
import AnnualEvolutionChart from '../components/dashboard/AnnualEvolutionChart';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const { t, formatCurrency } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [annualSummary, setAnnualSummary] = useState(null);
  const [quarterlySummary, setQuarterlySummary] = useState(null);
  const [quarterOffset, setQuarterOffset] = useState(0);
  const [monthlyTurnover, setMonthlyTurnover] = useState([]);
  const [annualEvolution, setAnnualEvolution] = useState([]);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchDashboardData();
  }, [quarterOffset, selectedYear]);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    
    try {
      const [
        annualSummaryRes,
        quarterlySummaryRes,
        monthlyTurnoverRes,
        annualEvolutionRes
      ] = await Promise.all([
        getAnnualSummary(),
        getQuarterlySummary(quarterOffset),
        getMonthlyTurnover(selectedYear),
        getAnnualEvolution()
      ]);

      setAnnualSummary(annualSummaryRes);
      setQuarterlySummary(quarterlySummaryRes);
      setMonthlyTurnover(monthlyTurnoverRes);
      setAnnualEvolution(annualEvolutionRes);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(t('error'));
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const getProgressPercentage = (current, max) => {
    if (!current || !max || max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">{t('loading')}</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('dashboard')}</h1>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Résumé annuel de l'activité */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">{t('annualActivitySummary')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FiDollarSign className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('annualTurnover')}</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
                  {annualSummary ? formatCurrency(annualSummary.annualTurnover) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FiClock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600 dark:text-yellow-400">{t('pendingPayments')}</p>
                <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-300">
                  {annualSummary ? formatCurrency(annualSummary.pendingPayments) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FiFileText className="h-8 w-8 text-orange-600 dark:text-orange-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{t('pendingQuotesAmount')}</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
                  {annualSummary ? formatCurrency(annualSummary.pendingQuotesAmount) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FiTarget className="h-8 w-8 text-green-600 dark:text-green-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('maxAnnualTurnover')}</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-300">
                  {annualSummary ? formatCurrency(annualSummary.maxAnnualTurnover) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FiTrendingUp className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600 dark:text-purple-400">{t('remainingToAchieve')}</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-300">
                  {annualSummary ? formatCurrency(annualSummary.remainingTurnover) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {annualSummary && annualSummary.maxAnnualTurnover > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>{t('progress')}: {formatCurrency(annualSummary.annualTurnover)} / {formatCurrency(annualSummary.maxAnnualTurnover)}</span>
              <span>{getProgressPercentage(annualSummary.annualTurnover, annualSummary.maxAnnualTurnover).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(annualSummary.annualTurnover, annualSummary.maxAnnualTurnover)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Résumé trimestriel */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{t('quarterlySummary')}</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuarterOffset(quarterOffset - 1)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 min-w-[200px] text-center">
              {quarterlySummary?.period?.display || t('loading')}
            </span>
            <button
              onClick={() => setQuarterOffset(quarterOffset + 1)}
              className="p-2 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-600 dark:text-green-400">{t('paidTurnover')}</p>
            <p className="text-2xl font-bold text-green-900 dark:text-green-300">
              {quarterlySummary ? formatCurrency(quarterlySummary.paidTurnover) : formatCurrency(0)}
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-600 dark:text-blue-400">{t('estimatedTurnover')}</p>
            <p className="text-2xl font-bold text-blue-900 dark:text-blue-300">
              {quarterlySummary ? formatCurrency(quarterlySummary.estimatedTurnover) : formatCurrency(0)}
            </p>
          </div>

          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FiAlertCircle className="h-6 w-6 text-red-600 dark:text-red-400 mr-2" />
              <div>
                <p className="text-sm font-medium text-red-600 dark:text-red-400">{t('chargesToPay')}</p>
                <p className="text-2xl font-bold text-red-900 dark:text-red-300">
                  {quarterlySummary ? formatCurrency(quarterlySummary.chargesToPay) : formatCurrency(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <p className="text-sm font-medium text-orange-600 dark:text-orange-400">{t('estimatedCharges')}</p>
            <p className="text-2xl font-bold text-orange-900 dark:text-orange-300">
              {quarterlySummary ? formatCurrency(quarterlySummary.estimatedCharges) : formatCurrency(0)}
            </p>
          </div>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('monthlyTurnover')}</h3>
          <MonthlyTurnoverChart data={monthlyTurnover} year={selectedYear} />
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">{t('annualEvolution')}</h3>
          <AnnualEvolutionChart data={annualEvolution} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 