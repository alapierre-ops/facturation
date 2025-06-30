import api from './index';

const adminApi = {
  getAllUsers: () => api.get('/admin/users'),
  getUserById: (id) => api.get(`/admin/users/${id}`),
  createUser: (data) => api.post('/admin/users', data),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  changeUserPassword: (id, newPassword) => api.post(`/admin/users/${id}/password`, { newPassword }),
  getUserStats: (id) => api.get(`/admin/users/${id}/stats`),
};

export default adminApi; 