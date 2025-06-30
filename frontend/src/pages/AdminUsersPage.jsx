import { useEffect, useState } from 'react';
import adminApi from '../api/adminApi';
import toast from 'react-hot-toast';
import { FiEdit2, FiTrash2, FiPlus, FiKey, FiBarChart2 } from 'react-icons/fi';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';

const ROLES = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
];

const AdminUsersPage = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    fullName: '',
    role: 'user',
    password: '',
    country: 'FRANCE',
    maxAnnualTurnover: '',
    chargeRate: ''
  });
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [passwordUser, setPasswordUser] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [statsUser, setStatsUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!user || user.role !== 'admin') return;
    fetchUsers();
  }, [user]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await adminApi.getAllUsers();
      setUsers(res.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    setIsEdit(!!user);
    setEditingUser(user);
    setForm(user ? {
      email: user.email,
      name: user.name,
      fullName: user.fullName || '',
      role: user.role,
      country: user.country || 'FRANCE',
      maxAnnualTurnover: user.maxAnnualTurnover || '',
      chargeRate: user.chargeRate || ''
    } : {
      email: '',
      name: '',
      fullName: '',
      role: 'user',
      password: '',
      country: 'FRANCE',
      maxAnnualTurnover: '',
      chargeRate: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await adminApi.updateUser(editingUser.id, form);
        toast.success('User updated');
      } else {
        await adminApi.createUser(form);
        toast.success('User created');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error saving user');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await adminApi.deleteUser(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error deleting user');
    }
  };

  const handleOpenPasswordModal = (user) => {
    setPasswordUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async () => {
    try {
      await adminApi.changeUserPassword(passwordUser.id, newPassword);
      toast.success('Password changed');
      setIsPasswordModalOpen(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Error changing password');
    }
  };

  const handleOpenStatsModal = async (user) => {
    setStatsUser(user);
    setStats(null);
    setIsStatsModalOpen(true);
    try {
      const res = await adminApi.getUserStats(user.id);
      setStats(res.data);
    } catch (err) {
      setStats(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 font-bold">Access denied (admin only)</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <button
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          onClick={() => handleOpenModal()}
        >
          <FiPlus className="w-5 h-5 mr-2" /> Add User
        </button>
      </div>
      {error && <div className="bg-red-50 text-red-500 p-3 rounded-md">{error}</div>}
      <div className="bg-white shadow rounded-lg overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Role</th>
              <th className="px-4 py-2">Country</th>
              <th className="px-4 py-2">Created</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-b">
                <td className="px-4 py-2">{u.email}</td>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2 capitalize">{u.role}</td>
                <td className="px-4 py-2">{u.country}</td>
                <td className="px-4 py-2">{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button className="text-blue-600" onClick={() => handleOpenModal(u)}><FiEdit2 /></button>
                  <button className="text-red-600" onClick={() => handleDelete(u.id)}><FiTrash2 /></button>
                  <button className="text-yellow-600" onClick={() => handleOpenPasswordModal(u)}><FiKey /></button>
                  <button className="text-green-600" onClick={() => handleOpenStatsModal(u)}><FiBarChart2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal création/édition */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={isEdit ? 'Edit User' : 'Add User'}>
        <div className="space-y-4">
          <input type="email" className="w-full border rounded px-3 py-2" placeholder="Email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} disabled={isEdit} />
          <input type="text" className="w-full border rounded px-3 py-2" placeholder="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          <input type="text" className="w-full border rounded px-3 py-2" placeholder="Full Name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
          <select className="w-full border rounded px-3 py-2" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
          <input type="text" className="w-full border rounded px-3 py-2" placeholder="Country" value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} />
          <input type="number" className="w-full border rounded px-3 py-2" placeholder="Max Annual Turnover" value={form.maxAnnualTurnover} onChange={e => setForm(f => ({ ...f, maxAnnualTurnover: e.target.value }))} />
          <input type="number" className="w-full border rounded px-3 py-2" placeholder="Charge Rate (%)" value={form.chargeRate} onChange={e => setForm(f => ({ ...f, chargeRate: e.target.value }))} />
          {!isEdit && (
            <input type="password" className="w-full border rounded px-3 py-2" placeholder="Password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
          )}
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleSave}>{isEdit ? 'Save' : 'Create'}</button>
          </div>
        </div>
      </Modal>

      {/* Modal changement de mot de passe */}
      <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title="Change Password">
        <div className="space-y-4">
          <input type="password" className="w-full border rounded px-3 py-2" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
          <div className="flex justify-end gap-2">
            <button className="px-4 py-2 bg-gray-200 rounded" onClick={() => setIsPasswordModalOpen(false)}>Cancel</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded" onClick={handleChangePassword}>Change</button>
          </div>
        </div>
      </Modal>

      {/* Modal stats */}
      <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title={statsUser ? `Stats for ${statsUser.email}` : 'Stats'}>
        {stats ? (
          <div className="space-y-2">
            <div><b>Clients:</b> {stats.stats.clients}</div>
            <div><b>Projects:</b> {stats.stats.projects.total} (Pending: {stats.stats.projects.pending}, Finished: {stats.stats.projects.finished}, Cancelled: {stats.stats.projects.cancelled})</div>
            <div><b>Quotes:</b> {stats.stats.quotes}</div>
            <div><b>Invoices:</b> {stats.stats.invoices.total} (Draft: {stats.stats.invoices.draft}, Sent: {stats.stats.invoices.sent}, Paid: {stats.stats.invoices.paid})</div>
            <div><b>Total Invoice Amount:</b> {stats.stats.invoices.totalAmount.toLocaleString(undefined, { style: 'currency', currency: 'USD' })}</div>
          </div>
        ) : <div>Loading...</div>}
      </Modal>
    </div>
  );
};

export default AdminUsersPage; 