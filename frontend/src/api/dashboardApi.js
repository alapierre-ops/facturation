import api from './axiosConfig.js';

export const getAnnualSummary = async () => {
  const response = await api.get('/dashboard/annual-summary');
  return response.data;
};

export const getQuarterlySummary = async (quarterOffset = 0) => {
  const response = await api.get('/dashboard/quarterly-summary', { 
    params: { quarter: quarterOffset } 
  });
  return response.data;
};

export const getMonthlyTurnover = async (year = null) => {
  const response = await api.get('/dashboard/monthly-turnover', { 
    params: year ? { year } : {} 
  });
  return response.data;
};

export const getAnnualEvolution = async () => {
  const response = await api.get('/dashboard/annual-evolution');
  return response.data;
};

export default {
  getAnnualSummary,

  getQuarterlySummary,

  getMonthlyTurnover,

  getAnnualEvolution,
}; 