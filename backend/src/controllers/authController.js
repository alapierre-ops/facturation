const authService = require('../services/authService');

exports.register = async (req, res) => {
  await authService.register(req, res);
};

exports.login = async (req, res) => {
  await authService.login(req, res);
}; 