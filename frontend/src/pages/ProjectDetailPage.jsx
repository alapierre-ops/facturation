import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';
import DevisForm from '../components/projects/DevisForm';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const statusColors = {
  prospect: 'bg-yellow-100 text-yellow-800',
  'pending': 'bg-blue-100 text-blue-800',
  finished: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const ProjectDetailPage = () => {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDevisModalOpen, setIsDevisModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await api.get(`/projects/${id}`);
        setProject(res.data);
      } catch (err) {
        setError('Failed to fetch project details');
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [id]);

  const handleAddDevis = async (data) => {
    setIsSubmitting(true);
    try {
      await api.post('/quotes', data);
      setIsDevisModalOpen(false);
      toast.success('Quote created successfully!');
      
      const res = await api.get(`/projects/${id}`);
      setProject(res.data);
    } catch (err) {
      toast.error('Failed to create quote');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>;
  }
  if (!project) {
    return <div className="text-gray-500">Project not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>{project.status}</span>
      </div>
      {/* Info Card */}
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="text-gray-500 text-sm">Client</div>
            <div className="font-medium text-lg">{project.client?.name || '-'}</div>
          </div>
          <div>
            <div className="text-gray-500 text-sm">Created At</div>
            <div className="font-medium">{new Date(project.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
        {project.description && (
          <div className="mt-4 text-gray-700">
            <span className="font-semibold">Description: </span>{project.description}
          </div>
        )}
      </div>
      {/* Quotes Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold">Quotes</h2>
          <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm" onClick={() => setIsDevisModalOpen(true)}>Add New Quote</button>
        </div>
        {project.quotes?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 text-sm bg-white shadow rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Number</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Total (TTC)</th>
              </tr>
            </thead>
            <tbody>
              {project.quotes.map((quote) => (
                <tr key={quote.id} className="border-t">
                  <td className="px-4 py-2">{quote.number}</td>
                  <td className="px-4 py-2">{new Date(quote.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{quote.status}</td>
                  <td className="px-4 py-2">{quote.totalTTC.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">No quotes found for this project.</div>
        )}
        <Modal
          isOpen={isDevisModalOpen}
          onClose={() => setIsDevisModalOpen(false)}
          title="Add New Quote"
        >
          <DevisForm
            projectId={project.id}
            onSubmit={handleAddDevis}
            onCancel={() => setIsDevisModalOpen(false)}
            loading={isSubmitting}
          />
        </Modal>
      </div>
      {/* Invoices Section */}
      <div>
        <h2 className="text-xl font-semibold mb-2">Invoices</h2>
        {project.invoices?.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-200 text-sm bg-white shadow rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left">Number</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Due Date</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-left">Total (TTC)</th>
              </tr>
            </thead>
            <tbody>
              {project.invoices.map((invoice) => (
                <tr key={invoice.id} className="border-t">
                  <td className="px-4 py-2">{invoice.number}</td>
                  <td className="px-4 py-2">{new Date(invoice.date).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2">{invoice.status}</td>
                  <td className="px-4 py-2">{invoice.totalTTC.toFixed(2)} €</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-gray-500">No invoices found for this project.</div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetailPage; 