import api from './index';

export const dashboardApi = {
  // Get annual activity summary
  getAnnualSummary: () => api.get('/dashboard/annual-summary'),

  // Get quarterly summary with optional quarter offset
  getQuarterlySummary: (quarterOffset = 0) => 
    api.get('/dashboard/quarterly-summary', { params: { quarter: quarterOffset } }),

  // Get monthly paid turnover with optional year
  getMonthlyTurnover: (year = null) => 
    api.get('/dashboard/monthly-turnover', { params: year ? { year } : {} }),

  // Get annual turnover evolution
  getAnnualEvolution: () => api.get('/dashboard/annual-evolution'),
};

export default dashboardApi; 