const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/auth');

router.get('/', authMiddleware, invoiceController.getAllInvoices);
router.get('/:id', authMiddleware, invoiceController.getInvoiceById);
router.post('/', authMiddleware, invoiceController.createInvoice);
router.put('/:id', authMiddleware, invoiceController.updateInvoice);
router.delete('/:id', authMiddleware, invoiceController.deleteInvoice);
router.patch('/:id/status', authMiddleware, invoiceController.updateInvoiceStatus);
router.post('/:id/send-email', authMiddleware, invoiceController.sendInvoiceEmail);
router.post('/from-quote', authMiddleware, invoiceController.createInvoiceFromQuote);

module.exports = router; 