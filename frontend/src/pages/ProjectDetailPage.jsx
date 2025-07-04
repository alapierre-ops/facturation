import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProjectById, deleteProject } from '../api';
import DevisForm from '../components/projects/DevisForm';
import { useLanguage } from '../contexts/LanguageContext';

const ProjectDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useEffect(() => {
    loadProject();
  }, [id]);

  const loadProject = async () => {
    try {
      const response = await getProjectById(id);
      setProject(response);
    } catch (err) {
      setError(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('areYouSure'))) {
      try {
        await deleteProject(id);
        navigate('/projects');
      } catch (err) {
        setError(t('error'));
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'quote_sent': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'quote_accepted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getPaymentTypeLabel = (type) => {
    switch (type) {
      case 'check': return t('check');
      case 'bank_transfer': return t('bankTransfer');
      case 'crypto': return t('crypto');
      case 'cash': return t('cash');
      case 'other': return t('other');
      default: return t('notSpecified');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('noDataFound')}</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{project.name}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('createdOn')} {new Date(project.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/projects')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('back')}
              </button>
              <button
                onClick={() => setShowQuoteForm(true)}
                className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
              >
                {t('createQuote')}
              </button>
              {project.status === 'pending' && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white rounded-md hover:bg-red-700 dark:hover:bg-red-600"
                >
                  {t('delete')}
                </button>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {t(project.status)}
            </span>
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('clientInformation')}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('name')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{project.client?.name}</div>
                </div>
                {project.client?.email && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('email')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{project.client.email}</div>
                  </div>
                )}
                {project.client?.phone && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('phone')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{project.client.phone}</div>
                  </div>
                )}
                {project.client?.address && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('address')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{project.client.address}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('projectInformation')}</h3>
              <div className="space-y-2">
                {project.startDate && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('startDate')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{new Date(project.startDate).toLocaleDateString('en-US')}</div>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('endDate')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{new Date(project.endDate).toLocaleDateString('en-US')}</div>
                  </div>
                )}
                {project.description && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('description')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{project.description}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quotes Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('quotes')}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{project.quotes?.length || 0} {t('quotes')}</span>
            </div>
            {project.quotes && project.quotes.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('number')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('date')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('amount')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('paymentType')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {project.quotes?.sort((a, b) => a.number.localeCompare(b.number)).map((quote) => (
                      <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/quotes/${quote.id}`)}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {quote.number}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(quote.date).toLocaleDateString('en-US')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(quote.status)}`}>
                            {t(quote.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(quote.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getPaymentTypeLabel(quote.paymentType)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{t('noQuotesYet')}</p>
              </div>
            )}
          </div>

          {/* Invoices Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('invoices')}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">{project.invoices?.length || 0} {t('invoices')}</span>
            </div>
            {project.invoices && project.invoices.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('number')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('date')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('dueDate')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('status')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('amount')}
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        {t('paymentType')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {project.invoices?.sort((a, b) => a.number.localeCompare(b.number)).map((invoice) => (
                      <tr key={invoice.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer" onClick={() => navigate(`/invoices/${invoice.id}`)}>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-blue-600 dark:text-blue-400 font-medium">
                          {invoice.number}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(invoice.date).toLocaleDateString('en-US')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {new Date(invoice.dueDate).toLocaleDateString('en-US')}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {t(invoice.status)}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {formatCurrency(invoice.amount)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {getPaymentTypeLabel(invoice.paymentType)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>{t('noInvoicesYet')}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quote Form Modal */}
      {showQuoteForm && (
        <DevisForm
          project={project}
          onClose={() => setShowQuoteForm(false)}
          onSuccess={() => {
            setShowQuoteForm(false);
            loadProject();
          }}
        />
      )}
    </div>
  );
};

export default ProjectDetailPage; 