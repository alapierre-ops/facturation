// Tax rates by country (in percentage)
const TAX_RATES = {
  'USA': {
    name: 'United States',
    currency: 'USD',
    symbol: '$',
    defaultRate: 0, // Sales tax varies by state, default to 0
    rates: {
      'CA': 8.25, // California
      'NY': 8.875, // New York
      'TX': 6.25, // Texas
      'FL': 6.0, // Florida
      'IL': 6.25, // Illinois
      'PA': 6.0, // Pennsylvania
      'OH': 5.75, // Ohio
      'GA': 4.0, // Georgia
      'NC': 4.75, // North Carolina
      'MI': 6.0, // Michigan
    }
  },
  'FRANCE': {
    name: 'France',
    currency: 'EUR',
    symbol: '€',
    defaultRate: 20.0, // TVA standard
    rates: {
      'STANDARD': 20.0, // TVA standard
      'REDUCED': 10.0, // TVA réduite
      'SUPER_REDUCED': 5.5, // TVA super réduite
      'ZERO': 0.0, // TVA zéro
    }
  },
  'MONACO': {
    name: 'Monaco',
    currency: 'EUR',
    symbol: '€',
    defaultRate: 0.0, // No VAT in Monaco
    rates: {
      'STANDARD': 0.0,
    }
  }
};

const getAvailableCountries = () => {
  return Object.keys(TAX_RATES).map(countryCode => ({
    code: countryCode,
    name: TAX_RATES[countryCode].name,
    currency: TAX_RATES[countryCode].currency,
    symbol: TAX_RATES[countryCode].symbol,
    defaultRate: TAX_RATES[countryCode].defaultRate
  }));
};

const getTaxRates = (countryCode) => {
  if (!TAX_RATES[countryCode]) {
    throw new Error(`Country ${countryCode} not supported`);
  }
  return TAX_RATES[countryCode];
};

const calculateTax = (amount, countryCode, taxRateKey = null) => {
  const countryTax = getTaxRates(countryCode);
  let rate;
  
  if (taxRateKey && countryTax.rates[taxRateKey]) {
    rate = countryTax.rates[taxRateKey];
  } else {
    rate = countryTax.defaultRate;
  }
  
  return (amount * rate) / 100;
};

const calculateTotalWithTax = (amount, countryCode, taxRateKey = null) => {
  const taxAmount = calculateTax(amount, countryCode, taxRateKey);
  return amount + taxAmount;
};

const calculateLineTotals = (quantity, unitPrice, countryCode, taxRateKey = null) => {
  const subtotal = quantity * unitPrice;
  const taxAmount = calculateTax(subtotal, countryCode, taxRateKey);
  const total = subtotal + taxAmount;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

const calculateDocumentTotals = (lines, countryCode, taxRateKey = null) => {
  let subtotal = 0;
  let totalTax = 0;
  
  lines.forEach(line => {
    const lineTotals = calculateLineTotals(line.quantity, line.unitPrice, countryCode, taxRateKey);
    subtotal += lineTotals.subtotal;
    totalTax += lineTotals.taxAmount;
  });
  
  const total = subtotal + totalTax;
  
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(totalTax * 100) / 100,
    total: Math.round(total * 100) / 100
  };
};

const formatCurrency = (amount, countryCode) => {
  const countryTax = getTaxRates(countryCode);
  return `${countryTax.symbol}${amount.toFixed(2)}`;
};

const getTaxRateOptions = (countryCode) => {
  const countryTax = getTaxRates(countryCode);
  const options = [];
  
  Object.entries(countryTax.rates).forEach(([key, rate]) => {
    let label = key;
    
    if (countryCode === 'USA') {
      label = `${key} (${rate}%)`;
    } else if (countryCode === 'FRANCE') {
      switch (key) {
        case 'STANDARD':
          label = 'TVA Standard (20%)';
          break;
        case 'REDUCED':
          label = 'TVA Réduite (10%)';
          break;
        case 'SUPER_REDUCED':
          label = 'TVA Super Réduite (5.5%)';
          break;
        case 'ZERO':
          label = 'TVA Zéro (0%)';
          break;
      }
    } else if (countryCode === 'MONACO') {
      label = 'Pas de TVA (0%)';
    }
    
    options.push({
      value: key,
      label: label,
      rate: rate
    });
  });
  
  return options;
};

module.exports = {
  getAvailableCountries,
  getTaxRates,
  calculateTax,
  calculateTotalWithTax,
  calculateLineTotals,
  calculateDocumentTotals,
  formatCurrency,
  getTaxRateOptions,
  TAX_RATES
}; 