const express = require('express');
const router = express.Router();
const taxController = require('../controllers/taxController');
const auth = require('../middleware/auth');

// Get available countries
router.get('/countries', auth, taxController.getAvailableCountries);

// Get tax rates for a specific country
router.get('/rates/:countryCode', auth, taxController.getTaxRates);

// Get tax rate options for a specific country
router.get('/options/:countryCode', auth, taxController.getTaxRateOptions);

// Calculate tax for an amount
router.post('/calculate', auth, taxController.calculateTax);

// Calculate line totals
router.post('/calculate-line', auth, taxController.calculateLineTotals);

// Calculate document totals
router.post('/calculate-document', auth, taxController.calculateDocumentTotals);

module.exports = router; 