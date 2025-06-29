const invoiceService = require('../services/invoiceService');

exports.getAllInvoices = async (req, res) => {
  await invoiceService.getAllInvoices(req, res);
};

exports.getInvoiceById = async (req, res) => {
  await invoiceService.getInvoiceById(req, res);
};

exports.createInvoice = async (req, res) => {
  await invoiceService.createInvoice(req, res);
};

exports.updateInvoice = async (req, res) => {
  await invoiceService.updateInvoice(req, res);
};

exports.deleteInvoice = async (req, res) => {
  await invoiceService.deleteInvoice(req, res);
};

exports.updateInvoiceStatus = async (req, res) => {
  await invoiceService.updateInvoiceStatus(req, res);
};

exports.sendInvoiceEmail = async (req, res) => {
  await invoiceService.sendInvoiceEmail(req, res);
};

exports.createInvoiceFromQuote = async (req, res) => {
  await invoiceService.createInvoiceFromQuote(req, res);
}; 