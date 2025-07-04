const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const auth = require('../middleware/auth');

router.use(auth);
router.get('/annual-summary', dashboardController.getAnnualActivitySummary);
router.get('/quarterly-summary', dashboardController.getQuarterlySummary);
router.get('/monthly-turnover', dashboardController.getMonthlyPaidTurnover);
router.get('/annual-evolution', dashboardController.getAnnualTurnoverEvolution);

module.exports = router; 