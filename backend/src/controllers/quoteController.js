const quoteService = require('../services/quoteService');

exports.getAllQuotes = async (req, res) => {
  await quoteService.getAllQuotes(req, res);
};

exports.createQuote = async (req, res) => {
  await quoteService.createQuote(req, res);
};

exports.getQuoteById = async (req, res) => {
  await quoteService.getQuoteById(req, res);
};

exports.updateQuote = async (req, res) => {
  await quoteService.updateQuote(req, res);
};

exports.deleteQuote = async (req, res) => {
  await quoteService.deleteQuote(req, res);
};

exports.updateQuoteStatus = async (req, res) => {
  await quoteService.updateQuoteStatus(req, res);
};

exports.sendQuoteEmail = async (req, res) => {
  await quoteService.sendQuoteEmail(req, res);
};

exports.createInvoiceFromQuote = async (req, res) => {
  await quoteService.createInvoiceFromQuote(req, res);
}; 