import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInvoiceById, updateInvoice, deleteInvoice, sendInvoiceEmail } from '../api';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import EmailModal from '../components/EmailModal';
import StatusModal from '../components/StatusModal';
import Modal from '../components/Modal';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-yellow-100 text-yellow-800',
};

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];

const paymentTypeLabels = {
  check: 'Check',
  bank_transfer: 'Bank Transfer',
  crypto: 'Cryptocurrency',
  credit_card: 'Credit Card',
  paypal: 'PayPal',
  cash: 'Cash',
  other: 'Other'
};

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, formatCurrency } = useLanguage();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [showEmailModal, setShowEmailModal] = useState(false);

  useEffect(() => {
    loadInvoice();
  }, [id]);

  const loadInvoice = async () => {
    try {
      const response = await getInvoiceById(id);
      setInvoice(response);
      setForm({
        status: response.status,
        dueDate: response.dueDate ? new Date(response.dueDate).toISOString().split('T')[0] : '',
        notes: response.notes || '',
        paymentType: response.paymentType || ''
      });
    } catch (err) {
      setError('Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateInvoice(id, form);
      await loadInvoice();
      setEditing(false);
    } catch (err) {
      setError('Failed to update invoice');
    }
  };

  const handleDelete = async () => {
    if (window.confirm(t('areYouSure'))) {
      try {
        await deleteInvoice(id);
        navigate('/invoices');
      } catch (err) {
        setError('Failed to delete invoice');
      }
    }
  };

  const handleSendEmail = async (recipientEmail) => {
    try {
      await sendInvoiceEmail(id, { recipientEmail });
      setShowEmailModal(false);
      await loadInvoice();
      toast.success('Invoice sent successfully!');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send invoice';
      toast.error(errorMessage);
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
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'cancelled': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
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

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date() && invoice.status !== 'paid';
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
            onClick={() => navigate('/invoices')}
            className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('noDataFound')}</p>
          <button
            onClick={() => navigate('/invoices')}
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t('invoices')} {invoice.number}</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {t('createdOn')} {formatDate(invoice.date)}
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => navigate('/invoices')}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                {t('back')}
              </button>
              {invoice.status !== 'paid' && (
                <button
                  onClick={() => setEditing(!editing)}
                  className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                >
                  {editing ? t('cancel') : t('edit')}
                </button>
              )}
              {invoice.status !== 'sent' && invoice.status !== 'paid' && (
                <button
                  onClick={() => setShowEmailModal(true)}
                  className="px-4 py-2 bg-green-600 dark:bg-green-500 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-600"
                >
                  {t('sendEmail')}
                </button>
              )}
              {invoice.status === 'draft' && (
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
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
              {t(invoice.status)}
            </span>
            {isOverdue(invoice.dueDate) && (
              <span className="ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300">
                {t('overdue')}
              </span>
            )}
          </div>

          {/* Invoice Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('clientInformation')}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('name')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{invoice.client?.name}</div>
                </div>
                {invoice.client?.email && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('email')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{invoice.client.email}</div>
                  </div>
                )}
                {invoice.client?.phone && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('phone')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{invoice.client.phone}</div>
                  </div>
                )}
                {invoice.client?.address && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">{t('address')}:</span>
                    <div className="font-medium text-gray-900 dark:text-white">{invoice.client.address}</div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('projectInformation')}</h3>
              <div className="space-y-2">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('project')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{invoice.project?.name || t('noProject')}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('dueDate')}:</span>
                  <div className={`font-medium ${isOverdue(invoice.dueDate) ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                    {formatDate(invoice.dueDate)}
                  </div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('paymentType')}:</span>
                  <div className="font-medium text-gray-900 dark:text-white">{getPaymentTypeLabel(invoice.paymentType)}</div>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">{t('totalAmount')}:</span>
                  <div className="font-medium text-xl text-gray-900 dark:text-white">{formatCurrency(invoice.amount)}</div>
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
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('description')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('quantity')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('unitPrice')}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      {t('amount')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {invoice.lines?.map((line, index) => (
                    <tr key={index}>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {line.description}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {line.quantity}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(line.unitPrice)}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {formatCurrency(line.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          {invoice.notes && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('notes')}</h3>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{invoice.notes}</p>
              </div>
            </div>
          )}

          {/* Edit Form */}
          {editing && (
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('editInvoice')}</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('status')}
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="draft">{t('draft')}</option>
                    <option value="sent">{t('sent')}</option>
                    <option value="paid">{t('paid')}</option>
                    <option value="overdue">{t('overdue')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('dueDate')}
                  </label>
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('paymentType')}
                  </label>
                  <select
                    value={form.paymentType}
                    onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('notes')}
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    rows="3"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleUpdate}
                    className="px-4 py-2 bg-blue-600 dark:bg-blue-500 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-600"
                  >
                    {t('updateInvoice')}
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {t('cancel')}
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
          defaultEmail={invoice.client?.email}
          title={t('sendInvoiceEmail')}
        />
      )}
    </div>
  );
};

export default InvoiceDetailPage; 