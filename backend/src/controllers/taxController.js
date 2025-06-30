const taxService = require('../services/taxService');

exports.getAvailableCountries = async (req, res) => {
  try {
    const countries = taxService.getAvailableCountries();
    res.json(countries);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching available countries' });
  }
};

exports.getTaxRates = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const taxRates = taxService.getTaxRates(countryCode);
    res.json(taxRates);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getTaxRateOptions = async (req, res) => {
  try {
    const { countryCode } = req.params;
    const options = taxService.getTaxRateOptions(countryCode);
    res.json(options);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.calculateTax = async (req, res) => {
  try {
    const { amount, countryCode, taxRate } = req.body;
    
    if (!amount || !countryCode) {
      return res.status(400).json({ error: 'Amount and countryCode are required' });
    }

    const taxAmount = taxService.calculateTax(parseFloat(amount), countryCode, taxRate);
    const total = taxService.calculateTotalWithTax(parseFloat(amount), countryCode, taxRate);
    
    res.json({
      amount: parseFloat(amount),
      taxAmount: Math.round(taxAmount * 100) / 100,
      total: Math.round(total * 100) / 100
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.calculateLineTotals = async (req, res) => {
  try {
    const { quantity, unitPrice, countryCode, taxRate } = req.body;
    
    if (!quantity || !unitPrice || !countryCode) {
      return res.status(400).json({ error: 'Quantity, unitPrice, and countryCode are required' });
    }

    const totals = taxService.calculateLineTotals(
      parseFloat(quantity), 
      parseFloat(unitPrice), 
      countryCode, 
      taxRate
    );
    
    res.json(totals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.calculateDocumentTotals = async (req, res) => {
  try {
    const { lines, countryCode, taxRate } = req.body;
    
    if (!lines || !Array.isArray(lines) || !countryCode) {
      return res.status(400).json({ error: 'Lines array and countryCode are required' });
    }

    const totals = taxService.calculateDocumentTotals(lines, countryCode, taxRate);
    
    res.json(totals);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}; 