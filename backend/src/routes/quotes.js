const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, quoteController.getAllQuotes);
router.post('/', authMiddleware, quoteController.createQuote);
router.get('/:id', authMiddleware, quoteController.getQuoteById);
router.put('/:id', authMiddleware, quoteController.updateQuote);
router.delete('/:id', authMiddleware, quoteController.deleteQuote);
router.patch('/:id/status', authMiddleware, quoteController.updateQuoteStatus);
router.post('/:id/send-email', authMiddleware, quoteController.sendQuoteEmail);
router.post('/from-quote', authMiddleware, quoteController.createInvoiceFromQuote);

module.exports = router; 