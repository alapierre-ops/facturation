const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, quoteController.createQuote);

module.exports = router; 