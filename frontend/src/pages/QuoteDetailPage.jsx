import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getQuoteById, updateQuote, deleteQuote, sendQuoteEmail } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import EmailModal from '../components/EmailModal';
import toast from 'react-hot-toast';

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    loadQuote();
  }, [id]);

  const loadQuote = async () => {
    try {
      const response = await getQuoteById(id);
      setQuote(response);
      setForm({
        status: response.status,
        notes: response.notes || '',
        paymentType: response.paymentType || '',
        lines: response.lines || []
      });
    } catch (err) {
      console.error('Error loading quote:', err);
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      const totalAmount = form.lines?.reduce((sum, line) => sum + (line.amount || 0), 0) || 0;
      
      const updateData = {
        ...form,
        amount: totalAmount
      };
      
      await updateQuote(id, updateData);
      await loadQuote();
      setEditing(false);
    } catch (err) {
      setError('Failed to update quote');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('areYouSure'))) {
      try {
        await deleteQuote(id);
        navigate('/quotes');
      } catch (err) {
        setError('Failed to delete quote');
      }
    }
  };

  const handleSendEmail = async (recipientEmail) => {
    try {
      await sendQuoteEmail(id, { recipientEmail });
      setShowEmailModal(false);
      await loadQuote();
      toast.success(t('emailSentSuccessfully'));
    } catch (err) {
      setError('Failed to send quote email');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
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
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">Quote not found</p>
          <button
            onClick={() => navigate('/projects')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Quote {quote.number}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('createdOn')} {formatDate(quote.date)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/quotes')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('back')}
              </button>
              {quote.status !== 'accepted' && quote.status !== 'sent' && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                >
                  {editing ? t('cancel') : t('edit')}
                </button>
              )}
              {quote.status !== 'sent' && quote.status !== 'accepted' && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600"
                >
                  {t('sendEmail')}
                </button>
              )}
              {quote.status === 'draft' && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
                >
                  {t('delete')}
                </button>
              )}
              {quote.status === 'accepted' && (
                <button
                  onClick={() => navigate(`/invoices/create?quoteId=${quote.id}`)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  {t('createInvoice')}
                </button>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(quote.status)}`}>
              {t(quote.status)}
            </span>
          </div>

          {/* Quote Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('clientInformation')}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('name')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{quote.client?.name}</div>
                </div>
                {quote.client?.email && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('email')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{quote.client.email}</div>
                  </div>
                )}
                {quote.client?.phone && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('phone')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{quote.client.phone}</div>
                  </div>
                )}
                {quote.client?.address && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('address')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{quote.client.address}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('projectInformation')}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('project')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{quote.project?.name || t('noProject')}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('paymentType')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{getPaymentTypeLabel(quote.paymentType)}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('totalAmount')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(quote.amount)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('lineItems')}</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('description')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('quantity')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('unitPrice')}</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('amount')}</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {quote.lines?.map((line, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{line.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{line.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(line.unitPrice)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(line.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('notes')}</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                <p className="text-gray-900 dark:text-white">{quote.notes}</p>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editing && (
            <div className="mt-8 p-6 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('editQuote')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('status')}</label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    {quote.status === 'draft' && <option value="draft">{t('draft')}</option>}
                    <option value="sent">{t('sent')}</option>
                    <option value="accepted">{t('accepted')}</option>
                    <option value="rejected">{t('rejected')}</option>
                  </select>
                </div>

                {/* Line Items Editor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t('lineItems')}</label>
                  <div className="space-y-3">
                    {form.lines?.map((line, index) => (
                      <div key={index} className="grid grid-cols-4 gap-3 p-3 bg-white dark:bg-gray-600 rounded border">
                        <input
                          type="text"
                          placeholder={t('description')}
                          className="border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          value={line.description}
                          onChange={e => {
                            const newLines = [...form.lines];
                            newLines[index] = { ...line, description: e.target.value };
                            setForm(f => ({ ...f, lines: newLines }));
                          }}
                        />
                        <input
                          type="number"
                          placeholder={t('quantity')}
                          min="1"
                          step="1"
                          className="border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          value={line.quantity}
                          onChange={e => {
                            const newLines = [...form.lines];
                            const quantity = parseFloat(e.target.value) || 1;
                            const amount = quantity * line.unitPrice;
                            newLines[index] = { ...line, quantity, amount };
                            setForm(f => ({ ...f, lines: newLines }));
                          }}
                        />
                        <input
                          type="number"
                          placeholder={t('unitPrice')}
                          min="0"
                          step="0.01"
                          className="border border-gray-300 dark:border-gray-500 rounded px-2 py-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                          value={line.unitPrice}
                          onChange={e => {
                            const newLines = [...form.lines];
                            const unitPrice = parseFloat(e.target.value) || 0;
                            const amount = line.quantity * unitPrice;
                            newLines[index] = { ...line, unitPrice, amount };
                            setForm(f => ({ ...f, lines: newLines }));
                          }}
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {formatCurrency(line.amount)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newLines = form.lines.filter((_, i) => i !== index);
                              setForm(f => ({ ...f, lines: newLines }));
                            }}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 text-sm"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const newLines = [...(form.lines || []), { description: '', quantity: 1, unitPrice: 0, amount: 0 }];
                        setForm(f => ({ ...f, lines: newLines }));
                      }}
                      className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-500 rounded text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                      + {t('addLineItem')}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('notes')}</label>
                  <textarea
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    rows={3}
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {t('saveChanges')}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <EmailModal
          onClose={() => setShowEmailModal(false)}
          onSend={handleSendEmail}
          defaultEmail={quote.client?.email}
          title={t('sendQuoteEmail')}
        />
      )}
    </div>
  );
};

export default QuoteDetailPage; 