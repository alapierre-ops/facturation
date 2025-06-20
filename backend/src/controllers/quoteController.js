const quoteService = require('../services/quoteService');

exports.createQuote = async (req, res) => {
  await quoteService.createQuote(req, res);
}; 