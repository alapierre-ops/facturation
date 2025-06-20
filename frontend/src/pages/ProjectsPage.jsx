import { useState, useEffect } from 'react';
import api from '../api';
import { FiPlus } from 'react-icons/fi';
import Modal from '../components/Modal';
import ProjectForm from '../components/projects/ProjectForm';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = [
  { label: 'All', value: 'all' },
  { label: 'Prospect', value: 'prospect' },
  { label: 'In Progress', value: 'in progress' },
  { label: 'Finished', value: 'finished' },
  { label: 'Cancelled', value: 'cancelled' },
];

const statusColors = {
  prospect: 'bg-yellow-100 text-yellow-800',
  'in progress': 'bg-blue-100 text-blue-800',
  finished: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const ProjectsPage = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clients, setClients] = useState([]);

  useEffect(() => {
    fetchProjects();
    fetchClients();
  }, [status]);

  const fetchProjects = async () => {
    setLoading(true);
    setError('');
    try {
      const params = status && status !== 'all' ? { status } : {};
      const response = await api.get('/projects', { params });
      setProjects(response.data);
    } catch (err) {
      setError('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await api.get('/clients');
      setClients(response.data);
    } catch (err) {
      setClients([]);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">My Projects</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          onClick={() => {
            setIsModalOpen(true);
            setIsEdit(false);
            setEditingProject(null);
          }}
        >
          <FiPlus className="w-5 h-5 mr-2" />
          Add New Project
        </button>
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
              status === opt.value
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50'
            }`}
            onClick={() => setStatus(opt.value)}
          >
            {opt.label}
          </button>
        ))}
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">Loading...</td>
              </tr>
            ) : projects.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-500">No projects found.</td>
              </tr>
            ) : (
              projects.map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{project.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.client?.name || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${statusColors[project.status] || 'bg-gray-100 text-gray-800'}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      className="text-blue-600 hover:text-blue-900 mr-4"
                      onClick={() => {
                        setEditingProject(project);
                        setIsEdit(true);
                        setIsModalOpen(true);
                      }}
                    >
                      Edit
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
          setEditingProject(null);
          setIsEdit(false);
        }}
        title={isEdit ? 'Edit Project' : 'Add New Project'}
      >
        <ProjectForm
          onSubmit={async (data) => {
            setIsSubmitting(true);
            try {
              if (isEdit && editingProject) {
                await api.put(`/projects/${editingProject.id}`, {
                  ...data,
                  clientId: Number(data.clientId),
                });
                toast.success('Project updated successfully!');
              } else {
                await api.post('/projects', {
                  ...data,
                  clientId: Number(data.clientId),
                });
                toast.success('Project created successfully!');
              }
              setIsModalOpen(false);
              setEditingProject(null);
              setIsEdit(false);
              fetchProjects();
            } catch (err) {
              toast.error(isEdit ? 'Failed to update project' : 'Failed to create project');
            } finally {
              setIsSubmitting(false);
            }
          }}
          onCancel={() => {
            setIsModalOpen(false);
            setEditingProject(null);
            setIsEdit(false);
          }}
          isSubmitting={isSubmitting}
          defaultValues={editingProject ? {
            name: editingProject.name,
            clientId: editingProject.clientId,
            description: editingProject.description || '',
            status: editingProject.status,
            startDate: editingProject.startDate ? editingProject.startDate.slice(0, 10) : '',
            endDate: editingProject.endDate ? editingProject.endDate.slice(0, 10) : '',
          } : undefined}
          clients={clients}
          isEdit={isEdit}
        />
      </Modal>
    </div>
  );
};

export default ProjectsPage; 