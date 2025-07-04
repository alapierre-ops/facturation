import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getQuoteById, createInvoice } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const InvoiceCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, formatCurrency } = useLanguage();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    dueDate: '',
    status: 'draft',
    notes: '',
    paymentType: 'bank_transfer'
  });

  const quoteId = searchParams.get('quoteId');

  useEffect(() => {
    if (quoteId) {
      loadQuote();
    } else {
      setError('Quote ID is required');
      setLoading(false);
    }
  }, [quoteId]);

  const loadQuote = async () => {
    try {
      const response = await getQuoteById(quoteId);
      setQuote(response);
      setForm({
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'draft',
        notes: response.notes || '',
        paymentType: response.paymentType || 'bank_transfer'
      });
    } catch (err) {
      setError('Failed to load quote');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const invoiceData = {
        quoteId: parseInt(quoteId),
        dueDate: form.dueDate,
        status: form.status,
        notes: form.notes,
        paymentType: form.paymentType,
        lines: quote.lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice
        }))
      };

      await createInvoice(invoiceData);
      toast.success(t('invoiceCreatedSuccessfully'));
      navigate('/invoices');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create invoice');
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
            onClick={() => navigate('/quotes')}
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
            onClick={() => navigate('/quotes')}
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
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('createInvoice')}</h1>
            <button
              onClick={() => navigate('/quotes')}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('back')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Informations du devis */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('quoteInformation')}</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('number')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{quote.number}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('client')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{quote.client?.name}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('totalAmount')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{formatCurrency(quote.amount)}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('paymentType')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{getPaymentTypeLabel(quote.paymentType)}</div>
                </div>
              </div>

              {/* Lignes du devis */}
              <div className="mt-6">
                <h4 className="text-md font-semibold mb-3 text-gray-900 dark:text-white">{t('lineItems')}</h4>
                <div className="space-y-2">
                  {quote.lines?.map((line, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded">
                      <div className="font-medium text-gray-900 dark:text-white">{line.description}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {line.quantity} x {formatCurrency(line.unitPrice)} = {formatCurrency(line.amount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Formulaire de création de facture */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('invoiceDetails')}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('dueDate')}
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={form.dueDate}
                    onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={form.status}
                    onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                  >
                    <option value="draft">{t('draft')}</option>
                    <option value="sent">{t('sent')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('paymentType')}
                  </label>
                  <select
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={form.paymentType}
                    onChange={e => setForm(f => ({ ...f, paymentType: e.target.value }))}
                  >
                    <option value="check">{t('check')}</option>
                    <option value="bank_transfer">{t('bankTransfer')}</option>
                    <option value="crypto">{t('crypto')}</option>
                    <option value="cash">{t('cash')}</option>
                    <option value="other">{t('other')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('notes')}
                  </label>
                  <textarea
                    rows={3}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    value={form.notes}
                    onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => navigate('/quotes')}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
                  >
                    {t('createInvoice')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCreatePage;
