import api from './index';

export const getAvailableCountries = () => {
  return api.get('/taxes/countries');
};

export const getTaxRates = (countryCode) => {
  return api.get(`/taxes/rates/${countryCode}`);
};

export const getTaxRateOptions = (countryCode) => {
  return api.get(`/taxes/options/${countryCode}`);
};

export const calculateTax = (amount, countryCode, taxRate) => {
  return api.post('/taxes/calculate', { amount, countryCode, taxRate });
};

export const calculateLineTotals = (quantity, unitPrice, countryCode, taxRate) => {
  return api.post('/taxes/calculate-line', { quantity, unitPrice, countryCode, taxRate });
};

export const calculateDocumentTotals = (lines, countryCode, taxRate) => {
  return api.post('/taxes/calculate-document', { lines, countryCode, taxRate });
}; 