const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

// All routes require authentication
router.use(auth);

// Get annual activity summary
router.get('/annual-summary', dashboardController.getAnnualActivitySummary);

// Get quarterly summary (with optional quarter offset)
router.get('/quarterly-summary', dashboardController.getQuarterlySummary);

// Get monthly paid turnover (with optional year)
router.get('/monthly-turnover', dashboardController.getMonthlyPaidTurnover);

// Get annual turnover evolution
router.get('/annual-evolution', dashboardController.getAnnualTurnoverEvolution);

module.exports = router; 