import React, { useState, useEffect } from 'react';
import { createQuote, updateQuote } from '../../api';
import { useLanguage } from '../../contexts/LanguageContext';

const DevisForm = ({ project, onClose, onSuccess, editQuote = null }) => {
  const { t, formatCurrency } = useLanguage();
  const [form, setForm] = useState({
    status: 'draft',
    lines: [{ description: '', quantity: 1, unitPrice: 0 }],
    notes: '',
    paymentType: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (editQuote) {
      setForm({
        status: editQuote.status,
        lines: editQuote.lines.map(line => ({
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice
        })),
        notes: editQuote.notes || '',
        paymentType: editQuote.paymentType || ''
      });
    }
  }, [editQuote]);

  const addLine = () => {
    setForm(prev => ({
      ...prev,
      lines: [...prev.lines, { description: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  const removeLine = (index) => {
    if (form.lines.length > 1) {
      setForm(prev => ({
        ...prev,
        lines: prev.lines.filter((_, i) => i !== index)
      }));
    }
  };

  const updateLine = (index, field, value) => {
    setForm(prev => ({
      ...prev,
      lines: prev.lines.map((line, i) => 
        i === index ? { ...line, [field]: value } : line
      )
    }));
  };

  const calculateTotal = () => {
    return form.lines.reduce((total, line) => {
      return total + (line.quantity * line.unitPrice);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const quoteData = {
        projectId: project.id,
        total: calculateTotal(),
        ...form
      };

      if (editQuote) {
        await updateQuote(editQuote.id, quoteData);
      } else {
        await createQuote(quoteData);
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || t('error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {editQuote ? t('edit') : t('createQuote')}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('paymentType')}</label>
              <select
                className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                value={form.paymentType}
                onChange={e => setForm(f => ({ ...f, paymentType: e.target.value }))}
              >
                <option value="">{t('selectPaymentType')}</option>
                <option value="check">{t('check')}</option>
                <option value="bank_transfer">{t('bankTransfer')}</option>
                <option value="crypto">{t('crypto')}</option>
                <option value="cash">{t('cash')}</option>
                <option value="other">{t('other')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">{t('totalAmount')}</label>
              <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                {formatCurrency(calculateTotal())}
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('lineItems')}</label>
            <div className="space-y-3">
              {form.lines.map((line, index) => (
                <div key={index} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <input
                      type="text"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('description')}
                      value={line.description}
                      onChange={e => updateLine(index, 'description', e.target.value)}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('quantity')}
                      value={line.quantity}
                      onChange={e => updateLine(index, 'quantity', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="1"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder={t('unitPrice')}
                      value={line.unitPrice}
                      onChange={e => updateLine(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>
                  <div className="col-span-1">
                    <div className="text-right font-medium text-gray-900 dark:text-white">
                      {formatCurrency(line.quantity * line.unitPrice)}
                    </div>
                  </div>
                  <div className="col-span-1">
                    {form.lines.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeLine(index)}
                        className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addLine}
                className="w-full py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {t('addLineItem')}
              </button>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{t('notes')}</label>
            <textarea
              className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              rows={3}
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              placeholder={t('additionalNotes')}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? t('loading') : (editQuote ? t('update') : t('create'))}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DevisForm; 