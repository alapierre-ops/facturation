import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const ProfilePage = () => {
  const { user, getProfile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    fullName: '',
    birthDate: '',
    address: '',
    phoneNumber: '',
    maxAnnualTurnover: '',
    chargeRate: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        fullName: user.fullName || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || '',
        maxAnnualTurnover: user.maxAnnualTurnover || '',
        chargeRate: user.chargeRate || ''
      });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const profileData = {
        ...formData,
        maxAnnualTurnover: formData.maxAnnualTurnover ? parseFloat(formData.maxAnnualTurnover) : null,
        chargeRate: formData.chargeRate ? parseFloat(formData.chargeRate) : null
      };
      
      await updateProfile(profileData);
      setSuccess('Profile updated successfully !');
      setIsEditing(false);
    } catch (error) {
      setError(error.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        fullName: user.fullName || '',
        birthDate: user.birthDate ? new Date(user.birthDate).toISOString().split('T')[0] : '',
        address: user.address || '',
        phoneNumber: user.phoneNumber || '',
        maxAnnualTurnover: user.maxAnnualTurnover || '',
        chargeRate: user.chargeRate || ''
      });
    }
    setIsEditing(false);
    setError('');
    setSuccess('');
  };

  if (!user) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Edit
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 text-green-500 p-3 rounded-md text-sm mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Basic information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500 mt-1">The email cannot be modified</p>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full name *
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  disabled={!isEditing}
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    isEditing ? 'focus:outline-none focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Birth date
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  disabled={!isEditing}
                  value={formData.birthDate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    isEditing ? 'focus:outline-none focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Personal information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                  Phone number
                </label>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="tel"
                  disabled={!isEditing}
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    isEditing ? 'focus:outline-none focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <textarea
                  id="address"
                  name="address"
                  rows={3}
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    isEditing ? 'focus:outline-none focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">Professional information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="maxAnnualTurnover" className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum annual turnover (€)
                </label>
                <input
                  id="maxAnnualTurnover"
                  name="maxAnnualTurnover"
                  type="number"
                  min="0"
                  step="0.01"
                  disabled={!isEditing}
                  value={formData.maxAnnualTurnover}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    isEditing ? 'focus:outline-none focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                  }`}
                />
              </div>

              <div>
                <label htmlFor="chargeRate" className="block text-sm font-medium text-gray-700 mb-1">
                  Charge rate (%) *
                </label>
                <input
                  id="chargeRate"
                  name="chargeRate"
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  required
                  disabled={!isEditing}
                  value={formData.chargeRate}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md ${
                    isEditing ? 'focus:outline-none focus:ring-blue-500 focus:border-blue-500' : 'bg-gray-50'
                  }`}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 border-b pb-2 mb-4">System information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Country
                </label>
                <input
                  type="text"
                  value={user.country || 'FRANCE'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Creation date
                </label>
                <input
                  type="text"
                  value={user.createdAt ? new Date(user.createdAt).toLocaleDateString('fr-FR') : ''}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                />
              </div>
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4 pt-6 border-t">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePage; 