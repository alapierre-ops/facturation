import React, { useState, useEffect } from 'react';
import { getAllUsers, createUser, updateUser, deleteUser, changeUserPassword, getAdminStats } from '../api';
import { FiEdit2, FiTrash2, FiPlus, FiKey, FiBarChart2 } from 'react-icons/fi';
import Modal from '../components/Modal';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';

const ROLES = [
  { label: 'User', value: 'user' },
  { label: 'Admin', value: 'admin' }
];

const AdminUsersPage = () => {
  const { user } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEdit, setIsEdit] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    email: '',
    name: '',
    fullName: '',
    role: 'user',
    password: '',
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
    loadData();
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const usersRes = await getAllUsers();
      setUsers(usersRes);
    } catch (error) {
      setError(t('failedToLoadData'));
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
      role: user.role,
      maxAnnualTurnover: user.maxAnnualTurnover || '',
      chargeRate: user.chargeRate || ''
    } : {
      email: '',
      name: '',
      fullName: '',
      role: 'user',
      password: '',
      maxAnnualTurnover: '',
      chargeRate: ''
    });
  };

  const handleSave = async () => {
    try {
      if (isEdit) {
        await updateUser(editingUser.id, form);
        toast.success(t('userUpdatedSuccessfully'));
      } else {
        await createUser(form);
        toast.success(t('userCreatedSuccessfully'));
      }
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || t('errorSavingUser'));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('areYouSureDeleteUser'))) return;
    try {
      await deleteUser(id);
      toast.success(t('userDeletedSuccessfully'));
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || t('errorDeletingUser'));
    }
  };

  const handleOpenPasswordModal = (user) => {
    setPasswordUser(user);
    setNewPassword('');
    setIsPasswordModalOpen(true);
  };

  const handleChangePassword = async () => {
    if (!newPassword) {
      setError(t('passwordRequired'));
      return;
    }
    try {
      await changeUserPassword(passwordUser.id, newPassword);
      setIsPasswordModalOpen(false);
      toast.success(t('passwordChangedSuccessfully'));
      loadData();
    } catch (err) {
      setError(err.response?.data?.error || t('errorChangingPassword'));
    }
  };

  const handleOpenStatsModal = async (user) => {
    setStatsUser(user);
    setStats(null);
    setIsStatsModalOpen(true);
    try {
      const res = await getAdminStats(user.id);
      setStats(res);
    } catch (err) {
      setStats(null);
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="p-8 text-center text-red-600 dark:text-red-400 font-bold">{t('accessDenied')}</div>;
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('userManagement')}</h1>
          </div>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 p-3 rounded-md">
              {error}
            </div>
          )}
          
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('email')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('name')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('role')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('createdOn')}</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">{t('actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{u.email}</td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{u.name}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        u.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {t(u.role)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex gap-2">
                        <button 
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300" 
                          onClick={() => handleOpenModal(u)}
                          title={t('edit')}
                        >
                          <FiEdit2 />
                        </button>
                        <button 
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300" 
                          onClick={() => handleDelete(u.id)}
                          title={t('delete')}
                        >
                          <FiTrash2 />
                        </button>
                        <button 
                          className="text-yellow-600 dark:text-yellow-400 hover:text-yellow-800 dark:hover:text-yellow-300" 
                          onClick={() => handleOpenPasswordModal(u)}
                          title={t('changePassword')}
                        >
                          <FiKey />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Modal édition */}
          {isEdit && (
            <Modal isOpen={true} onClose={() => setIsEdit(false)} title={t('editUser')}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('email')}</label>
                  <input 
                    type="email" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                    value={form.email} 
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))} 
                    disabled 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('name')}</label>
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                    value={form.name} 
                    onChange={e => setForm(f => ({ ...f, name: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('role')}</label>
                  <select 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                    value={form.role} 
                    onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  >
                    {ROLES.map(r => <option key={r.value} value={r.value}>{t(r.label.toLowerCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('maxAnnualTurnover')}</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                    value={form.maxAnnualTurnover} 
                    onChange={e => setForm(f => ({ ...f, maxAnnualTurnover: e.target.value }))} 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('chargeRate')} (%)</label>
                  <input 
                    type="number" 
                    className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                    value={form.chargeRate} 
                    onChange={e => setForm(f => ({ ...f, chargeRate: e.target.value }))} 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button 
                    className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500" 
                    onClick={() => setIsEdit(false)}
                  >
                    {t('cancel')}
                  </button>
                  <button 
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" 
                    onClick={handleSave}
                  >
                    {t('saveChanges')}
                  </button>
                </div>
              </div>
            </Modal>
          )}

          {/* Modal changement de mot de passe */}
          <Modal isOpen={isPasswordModalOpen} onClose={() => setIsPasswordModalOpen(false)} title={t('changePassword')}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t('newPassword')}</label>
                <input 
                  type="password" 
                  className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                  value={newPassword} 
                  onChange={e => setNewPassword(e.target.value)} 
                />
              </div>
              <div className="flex justify-end gap-2">
                <button 
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-500" 
                  onClick={() => setIsPasswordModalOpen(false)}
                >
                  {t('cancel')}
                </button>
                <button 
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600" 
                  onClick={handleChangePassword}
                >
                  {t('change')}
                </button>
              </div>
            </div>
          </Modal>

          {/* Modal stats */}
          <Modal isOpen={isStatsModalOpen} onClose={() => setIsStatsModalOpen(false)} title={statsUser ? `${t('statsFor')} ${statsUser.email}` : t('stats')}>
            {stats ? (
              <div className="space-y-2 text-gray-900 dark:text-white">
                <div><b>{t('clients')}:</b> {stats.stats.clients}</div>
                <div><b>{t('projects')}:</b> {stats.stats.projects.total} ({t('pending')}: {stats.stats.projects.pending}, {t('finished')}: {stats.stats.projects.finished}, {t('cancelled')}: {stats.stats.projects.cancelled})</div>
                <div><b>{t('quotes')}:</b> {stats.stats.quotes}</div>
                <div><b>{t('invoices')}:</b> {stats.stats.invoices.total} ({t('draft')}: {stats.stats.invoices.draft}, {t('sent')}: {stats.stats.invoices.sent}, {t('paid')}: {stats.stats.invoices.paid})</div>
                <div><b>{t('totalInvoiceAmount')}:</b> {formatCurrency(stats.stats.invoices.totalAmount)}</div>
              </div>
            ) : <div className="text-gray-600 dark:text-gray-400">{t('loading')}</div>}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage; 