import api from './axiosConfig.js';

export const createQuote = async (quoteData) => {
  const response = await api.post('/quotes', quoteData);
  return response.data;
};

export const getQuotes = async () => {
  const response = await api.get('/quotes');
  return response.data;
};

export const getQuoteById = async (id) => {
  const response = await api.get(`/quotes/${id}`);
  return response.data;
};

export const updateQuote = async (id, quoteData) => {
  const response = await api.put(`/quotes/${id}`, quoteData);
  return response.data;
};

export const deleteQuote = async (id) => {
  const response = await api.delete(`/quotes/${id}`);
  return response.data;
};

export const sendQuoteEmail = async (id, emailData) => {
  const response = await api.post(`/quotes/${id}/send-email`, emailData);
  return response.data;
}; 