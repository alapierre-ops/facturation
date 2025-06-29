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
  paid: 'bg-green-100 text-green-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-yellow-100 text-yellow-800',
};

const statusOptions = [
  { value: 'draft', label: 'Brouillon' },
  { value: 'sent', label: 'Envoyée' },
  { value: 'paid', label: 'Payée' },
  { value: 'overdue', label: 'En retard' },
  { value: 'cancelled', label: 'Annulée' },
];

const InvoiceDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/invoices/${id}`);
        setInvoice(res.data);
      } catch (err) {
        setError('Failed to fetch invoice details');
      } finally {
        setLoading(false);
      }
    };
    fetchInvoice();
  }, [id]);

  const handleSendEmail = async (recipientEmail) => {
    setIsSendingEmail(true);
    try {
      await api.post(`/invoices/${id}/send-email`, { recipientEmail });
      toast.success('Invoice sent successfully!');
      setIsEmailModalOpen(false);
      
      // Rafraîchir les données de la facture
      const res = await api.get(`/invoices/${id}`);
      setInvoice(res.data);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to send invoice';
      toast.error(errorMessage);
    } finally {
      setIsSendingEmail(false);
    }
  };

  const handleUpdateStatus = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const res = await api.patch(`/invoices/${id}/status`, { status: newStatus });
      setInvoice(res.data);
      toast.success('Status updated successfully!');
      setIsStatusModalOpen(false);
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to update status';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteInvoice = async () => {
    setIsDeleting(true);
    try {
      await api.delete(`/invoices/${id}`);
      toast.success('Invoice deleted successfully!');
      navigate('/projects');
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Failed to delete invoice';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>;
  }
  if (!invoice) {
    return <div className="text-gray-500">Invoice not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.number}</h1>
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[invoice.status] || 'bg-gray-100 text-gray-800'}`}>
            {invoice.status}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEmailModalOpen(true)}
            className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
          >
            Envoyer par email
          </button>
          <button
            onClick={() => setIsStatusModalOpen(true)}
            className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700 text-sm"
          >
            Changer statut
          </button>
          <button
            onClick={() => setIsDeleteModalOpen(true)}
            className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Supprimer
          </button>
        </div>
      </div>

      {/* Invoice Info */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold mb-4">Invoice Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Invoice Number:</span>
                <div className="font-medium">{invoice.number}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Date:</span>
                <div className="font-medium">{new Date(invoice.date).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Due Date:</span>
                <div className="font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <span className="text-gray-500 text-sm">Status:</span>
                <div className="font-medium">{invoice.status}</div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Client Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-gray-500 text-sm">Client:</span>
                <div className="font-medium">{invoice.client?.name || '-'}</div>
              </div>
              {invoice.client?.email && (
                <div>
                  <span className="text-gray-500 text-sm">Email:</span>
                  <div className="font-medium">{invoice.client.email}</div>
                </div>
              )}
              {invoice.client?.phone && (
                <div>
                  <span className="text-gray-500 text-sm">Phone:</span>
                  <div className="font-medium">{invoice.client.phone}</div>
                </div>
              )}
            </div>
          </div>
        </div>
        {invoice.project && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Project Information</h3>
            <div>
              <span className="text-gray-500 text-sm">Project:</span>
              <div className="font-medium">{invoice.project.name}</div>
            </div>
          </div>
        )}
        {invoice.quotes && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-lg font-semibold mb-4">Related Quote</h3>
            <div>
              <span className="text-gray-500 text-sm">Quote Number:</span>
              <div className="font-medium">{invoice.quotes.number}</div>
            </div>
          </div>
        )}
      </div>

      {/* Invoice Lines */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">Invoice Items</h3>
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
                  Total HT
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total TTC
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoice.lines?.map((line, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 text-sm text-gray-900">{line.description}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.unitPrice.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.totalHT.toFixed(2)} €</td>
                  <td className="px-4 py-3 text-sm text-gray-900 text-right">{line.totalTTC.toFixed(2)} €</td>
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
              <span className="text-gray-600">Total HT:</span>
              <span className="font-medium">{invoice.totalHT.toFixed(2)} €</span>
            </div>
            <div className="flex justify-between py-2 border-t">
              <span className="text-gray-600 font-semibold">Total TTC:</span>
              <span className="font-bold text-lg">{invoice.totalTTC.toFixed(2)} €</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <EmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        onSend={handleSendEmail}
        title="Envoyer la facture par email"
        recipientEmail={invoice.client?.email}
        loading={isSendingEmail}
      />

      <StatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        onUpdate={handleUpdateStatus}
        title="Changer le statut de la facture"
        currentStatus={invoice.status}
        statusOptions={statusOptions}
        loading={isUpdatingStatus}
      />

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmer la suppression"
      >
        <div className="space-y-4">
          <p>Êtes-vous sûr de vouloir supprimer cette facture ? Cette action est irréversible.</p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDeleteInvoice}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? 'Suppression...' : 'Supprimer'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default InvoiceDetailPage; 