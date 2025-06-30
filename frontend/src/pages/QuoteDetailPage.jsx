import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import toast from 'react-hot-toast';
import EmailModal from '../components/EmailModal';
import StatusModal from '../components/StatusModal';
import Modal from '../components/Modal';

const statusColors = {
  draft: 'bg-gray-100 text-gray-800',
  sent: 'bg-blue-100 text-blue-800',
  accepted: 'bg-green-100 text-green-800',
  refused: 'bg-red-100 text-red-800',
  expired: 'bg-yellow-100 text-yellow-800',
};

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'refused', label: 'Refused' },
  { value: 'expired', label: 'Expired' },
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

const QuoteDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchQuote = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/quotes/${id}`);
        setQuote(res.data);
      } catch (err) {
        setError('Failed to fetch quote details');
      } finally {
        setLoading(false);
      }
    };
    fetchQuote();
  }, [id]);

  const handleGenerateInvoice = async () => {
    setIsGeneratingInvoice(true);
    try {
      const res = await api.post('/invoices/from-quote', { quoteId: quote.id });
      toast.success('Invoice generated successfully!');
      navigate(`/invoices/${res.data.id}`);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to generate invoice';
      toast.error(errorMessage);
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  const handleSendEmail = async (recipientEmail) => {
    setIsSendingEmail(true);
    try {
      await api.post(`/quotes/${id}/send-email`, { recipientEmail });
      toast.success('Quote sent successfully!');
      setIsEmailModalOpen(false);
      
      const res = await api.get(`/quotes/${id}`);
      setQuote(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send quote';
      toast.error(errorMessage);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/quotes/${id}/status`, { status: newStatus });
      setQuote(res.data);
      toast.success('Status updated successfully!');
      setIsStatusModalOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteQuote = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/quotes/${id}`);
      toast.success('Quote deleted successfully!');
      navigate('/projects');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete quote';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const canGenerateInvoice = () => {
    if (!quote) return false;
    return quote.status === 'accepted';
  };

  const getCurrencySymbol = () => {
    if (!quote) return '€';
    
    const countryMap = {
      'USA': '$',
      'FRANCE': '€',
      'MONACO': '€'
    };
    
    return countryMap[quote.country] || '€';
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>;
  }
  if (!quote) {
    return <div className="text-gray-500">Quote not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Quote {quote.number}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[quote.status] || 'bg-gray-100 text-gray-800'}`}>
            {quote.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Send by email
          </button>
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
          >
            Change status
          </button>
          {canGenerateInvoice() && (
            <button
              onClick={handleGenerateInvoice}
              disabled={isGeneratingInvoice}
              className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isGeneratingInvoice ? 'Generating...' : 'Generate Invoice'}
            </button>
          )}
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Quote Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Quote Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Quote Number:</span>
                <div className="font-medium">{quote.number}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Date:</span>
                <div className="font-medium">{new Date(quote.date).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Status:</span>
                <div className="font-medium">{quote.status}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Country:</span>
                <div className="font-medium">{quote.country}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Tax Rate:</span>
                <div className="font-medium">{quote.taxRate}</div>
              </div>
              {quote.paymentType && (
                <div>
                  <span className="text-gray-500 text-sm">Payment Type:</span>
                  <div className="font-medium">{paymentTypeLabels[quote.paymentType] || quote.paymentType}</div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Client Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Client:</span>
                <div className="font-medium">{quote.client?.name || '-'}</div>
              </div>
              {quote.client?.email && (
                <div>
                  <span className="text-gray-500 text-sm">Email:</span>
                  <div className="font-medium">{quote.client.email}</div>
                </div>
              )}
              {quote.client?.phone && (
                <div>
                  <span className="text-gray-500 text-sm">Phone:</span>
                  <div className="font-medium">{quote.client.phone}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {quote.project && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
            <div>
              <span className="text-gray-500 text-sm">Project:</span>
              <div className="font-medium">{quote.project.name}</div>
            </div>
          </div>
        )}
        {quote.notes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Notes</h3>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700 whitespace-pre-wrap">{quote.notes}</p>
            </div>
          </div>
        )}
      </div>

      {/* Quote Lines */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Quote Items</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit Price
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subtotal
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tax Amount
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {quote.lines?.map((line, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{line.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.unitPrice.toFixed(2)} {getCurrencySymbol()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.subtotal.toFixed(2)} {getCurrencySymbol()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.taxAmount.toFixed(2)} {getCurrencySymbol()}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.total.toFixed(2)} {getCurrencySymbol()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totals */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-end">
          <div className="w-64">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="font-medium">{quote.subtotal.toFixed(2)} {getCurrencySymbol()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Tax Amount:</span>
              <span className="font-medium">{quote.taxAmount.toFixed(2)} {getCurrencySymbol()}</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span className="text-gray-600 font-semibold">Total:</span>
              <span className="font-bold text-lg">{quote.total.toFixed(2)} {getCurrencySymbol()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        title="Send the quote by email"
        recipientEmail={quote.client?.email}
        loading={isSendingEmail}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdate={handleUpdateStatus}
        title="Change the status of the quote"
        currentStatus={quote.status}
        statusOptions={statusOptions}
        loading={isUpdatingStatus}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm the deletion"
      >
        <div className="space-y-4">
          <p>Are you sure you want to delete this quote? This action is irreversible.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteQuote}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Deletion...' : 'Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default QuoteDetailPage; 