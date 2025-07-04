import api from './axiosConfig.js';

export const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/admin/users/${id}`);
  return response.data;
};

export const createUser = async (data) => {
  const response = await api.post('/admin/users', data);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/admin/users/${id}`);
  return response.data;
};

export const changeUserPassword = async (id, newPassword) => {
  const response = await api.post(`/admin/users/${id}/password`, { newPassword });
  return response.data;
};

export const getAdminStats = async (id) => {
  const response = await api.get(`/admin/users/${id}/stats`);
  return response.data;
}; 