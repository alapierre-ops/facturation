import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { updateAuthProfile } from '../api';

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { t, formatCurrency } = useLanguage();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    name: '',
    fullName: '',
    birthDate: '',
    address: '',
    phoneNumber: '',
    maxAnnualTurnover: '',
    chargeRate: ''
  });

  useEffect(() => {
    if (user) {
      setForm({
        name: user.fullName || user.name || '',
        fullName: user.fullName || user.name || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || '',
        maxAnnualTurnover: user.maxAnnualTurnover ? user.maxAnnualTurnover.toString() : '',
        chargeRate: user.chargeRate ? user.chargeRate.toString() : ''
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors = [];

    if (form.birthDate) {
      const birthDate = new Date(form.birthDate);
      const today = new Date();
      if (birthDate > today) {
        errors.push(t('birthDateCannotBeInFuture'));
      }
      if (birthDate.getFullYear() < 1900) {
        errors.push(t('birthDateTooOld'));
      }
    }

    if (form.maxAnnualTurnover && parseFloat(form.maxAnnualTurnover) < 0) {
      errors.push(t('maxAnnualTurnoverCannotBeNegative'));
    }

    if (form.chargeRate) {
      const rate = parseFloat(form.chargeRate);
      if (rate < 0 || rate > 100) {
        errors.push(t('chargeRateMustBeBetween0And100'));
      }
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const formData = {
        ...form,
        maxAnnualTurnover: form.maxAnnualTurnover && form.maxAnnualTurnover.trim() !== '' ? parseFloat(form.maxAnnualTurnover) : null,
        chargeRate: form.chargeRate && form.chargeRate.trim() !== '' ? parseFloat(form.chargeRate) : null
      };
      
      const response = await updateAuthProfile(formData);
      updateProfile(response);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-400">{t('loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('profile')}</h1>
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              {editing ? t('cancel') : t('editProfile')}
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('basicInformation')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('email')}
                    </label>
                    <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
                      {user.email}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('fullName')}
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.fullName}
                        onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
                        required
                      />
                    ) : (
                      <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                        {user.fullName || user.name || t('notSpecified')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('birthDate')}
                    </label>
                    {editing ? (
                      <input
                        type="date"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.birthDate}
                        onChange={e => setForm(f => ({ ...f, birthDate: e.target.value }))}
                        max={new Date().toISOString().split('T')[0]}
                      />
                    ) : (
                      <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                        {user.birthDate ? new Date(user.birthDate).toLocaleDateString() : t('notSpecified')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('contactInformation')}</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('address')}
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.address}
                        onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                      />
                    ) : (
                      <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                        {user.address || t('notSpecified')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('phoneNumber')}
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        value={form.phoneNumber}
                        onChange={e => setForm(f => ({ ...f, phoneNumber: e.target.value }))}
                      />
                    ) : (
                      <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                        {user.phoneNumber || t('notSpecified')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('businessInformation')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('maxAnnualTurnover')}
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={form.maxAnnualTurnover}
                      onChange={e => setForm(f => ({ ...f, maxAnnualTurnover: e.target.value }))}
                    />
                  ) : (
                    <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      {user.maxAnnualTurnover ? formatCurrency(user.maxAnnualTurnover) : t('notSpecified')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('chargeRate')} (%)
                  </label>
                  {editing ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      value={form.chargeRate}
                      onChange={e => setForm(f => ({ ...f, chargeRate: e.target.value }))}
                    />
                  ) : (
                    <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                      {user.chargeRate ? `${user.chargeRate}%` : t('notSpecified')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">{t('accountInformation')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {user.role === 'admin' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('role')}
                    </label>
                    <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin' ? 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300' : 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300'
                      }`}>
                        {t(user.role)}
                      </span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('memberSince')}
                  </label>
                  <div className="w-full border border-gray-300 dark:border-gray-600 rounded px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {editing && (
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? t('loading') : t('saveChanges')}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 