import { useState, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiDollarSign, FiTrendingUp, FiClock, FiFileText, FiTarget } from 'react-icons/fi';
import dashboardApi from '../api/dashboardApi';
import MonthlyTurnoverChart from '../components/dashboard/MonthlyTurnoverChart';
import AnnualEvolutionChart from '../components/dashboard/AnnualEvolutionChart';
import toast from 'react-hot-toast';

const DashboardPage = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Annual Activity Summary
  const [annualSummary, setAnnualSummary] = useState(null);
  
  // Quarterly Summary
  const [quarterlySummary, setQuarterlySummary] = useState(null);
  const [quarterOffset, setQuarterOffset] = useState(0);
  
  // Charts
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
        dashboardApi.getAnnualSummary(),
        dashboardApi.getQuarterlySummary(quarterOffset),
        dashboardApi.getMonthlyTurnover(selectedYear),
        dashboardApi.getAnnualEvolution()
      ]);

      setAnnualSummary(annualSummaryRes.data);
      setQuarterlySummary(quarterlySummaryRes.data);
      setMonthlyTurnover(monthlyTurnoverRes.data);
      setAnnualEvolution(annualEvolutionRes.data);
    } catch (err) {
      setError('Failed to fetch dashboard data');
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getProgressPercentage = (current, max) => {
    if (max === 0) return 0;
    return Math.min((current / max) * 100, 100);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error}
        </div>
      )}

      {/* Annual Activity Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Annual Activity Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FiDollarSign className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Annual Turnover</p>
                <p className="text-2xl font-bold text-blue-900">
                  {annualSummary ? formatCurrency(annualSummary.annualTurnover) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FiClock className="h-8 w-8 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Pending Payments</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {annualSummary ? formatCurrency(annualSummary.pendingPayments) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FiFileText className="h-8 w-8 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Unsent Invoices</p>
                <p className="text-2xl font-bold text-gray-900">
                  {annualSummary ? formatCurrency(annualSummary.unsentInvoices) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FiTarget className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Max Annual Turnover</p>
                <p className="text-2xl font-bold text-green-900">
                  {annualSummary ? formatCurrency(annualSummary.maxAnnualTurnover) : '$0.00'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="flex items-center">
              <FiTrendingUp className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Remaining to Achieve</p>
                <p className="text-2xl font-bold text-purple-900">
                  {annualSummary ? formatCurrency(annualSummary.remainingTurnover) : '$0.00'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        {annualSummary && annualSummary.maxAnnualTurnover > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Progress: {formatCurrency(annualSummary.annualTurnover)} / {formatCurrency(annualSummary.maxAnnualTurnover)}</span>
              <span>{getProgressPercentage(annualSummary.annualTurnover, annualSummary.maxAnnualTurnover).toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${getProgressPercentage(annualSummary.annualTurnover, annualSummary.maxAnnualTurnover)}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Quarterly Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Quarterly Summary</h2>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setQuarterOffset(quarterOffset - 1)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm font-medium text-gray-700 min-w-[200px] text-center">
              {quarterlySummary?.period?.display || 'Loading...'}
            </span>
            <button
              onClick={() => setQuarterOffset(quarterOffset + 1)}
              className="p-2 text-gray-400 hover:text-gray-600"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-green-600">Paid Turnover</p>
            <p className="text-2xl font-bold text-green-900">
              {quarterlySummary ? formatCurrency(quarterlySummary.paidTurnover) : '$0.00'}
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-blue-600">Estimated Turnover</p>
            <p className="text-2xl font-bold text-blue-900">
              {quarterlySummary ? formatCurrency(quarterlySummary.estimatedTurnover) : '$0.00'}
            </p>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-red-600">Charges to be Paid</p>
            <p className="text-2xl font-bold text-red-900">
              {quarterlySummary ? formatCurrency(quarterlySummary.chargesToBePaid) : '$0.00'}
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-orange-600">Estimated Charges</p>
            <p className="text-2xl font-bold text-orange-900">
              {quarterlySummary ? formatCurrency(quarterlySummary.estimatedCharges) : '$0.00'}
            </p>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Turnover Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Paid Turnover</h3>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <MonthlyTurnoverChart data={monthlyTurnover} year={selectedYear} />
        </div>

        {/* Annual Evolution Chart */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Annual Turnover Evolution</h3>
          <AnnualEvolutionChart data={annualEvolution} />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 