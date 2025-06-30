import { useState, useEffect, useRef } from 'react';
import api from '../api';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import Modal from '../components/Modal';
import ClientForm from '../components/clients/ClientForm';
import toast from 'react-hot-toast';

const ClientsPage = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  useEffect(() => {
    fetchClients();
  }, [debouncedSearchTerm]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params = debouncedSearchTerm ? { search: debouncedSearchTerm } : {};
      const response = await api.get('/clients', { params });
      setClients(response.data);
    } catch (error) {
      setError('Failed to fetch clients');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this client?')) {
      return;
    }

    try {
      await api.delete(`/clients/${id}`);
      setClients(clients.filter(client => client.id !== id));
      toast.success('Client deleted successfully!');
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to delete client';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">Clients</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => setIsModalOpen(true)}
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Add Client
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search clients by name, email, phone, or address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 text-red-500 p-3 rounded-md text-sm">
          {error}
        </div>
      )}

      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Phone
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                Address
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {clients.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                  {debouncedSearchTerm ? 'No clients found matching your search.' : 'No clients found.'}
                </td>
              </tr>
            ) : (
              clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {client.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {client.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {client.phone}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 hidden lg:table-cell">
                    {client.address}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => {
                        setEditingClient(client);
                        setIsModalOpen(true);
                      }}
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => handleDelete(client.id)}
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingClient(null);
        }}
        title={editingClient ? 'Edit Client' : 'Add New Client'}
      >
        <ClientForm
          onSubmit={async (data) => {
            setIsSubmitting(true);
            try {
              let payload = { ...data };
              if (data.firstName && data.lastName) {
                payload.name = `${data.firstName} ${data.lastName}`;
                delete payload.firstName;
                delete payload.lastName;
              }
              if (editingClient) {
                await api.put(`/clients/${editingClient.id}`, payload);
                toast.success('Client updated successfully!');
              } else {
                await api.post('/clients', payload);
                toast.success('Client added successfully!');
              }
              setIsModalOpen(false);
              setEditingClient(null);
              fetchClients();
            } catch (err) {
              const errorMessage = err.response?.data?.error || (editingClient ? 'Failed to update client' : 'Failed to add client');
              toast.error(errorMessage);
            } finally {
              setIsSubmitting(false);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingClient(null);
          }}
          isSubmitting={isSubmitting}
          defaultValues={editingClient ? (() => {
            const nameParts = editingClient.name ? editingClient.name.split(' ') : [];
            if (nameParts.length > 1) {
              return {
                firstName: nameParts.slice(0, -1).join(' '),
                lastName: nameParts.slice(-1).join(' '),
                email: editingClient.email,
                phone: editingClient.phone,
                address: editingClient.address,
              };
            } else {
              return {
                name: editingClient.name,
                email: editingClient.email,
                phone: editingClient.phone,
                address: editingClient.address,
              };
            }
          })() : undefined}
        />
      </Modal>
    </div>
  );
};

export default ClientsPage; 