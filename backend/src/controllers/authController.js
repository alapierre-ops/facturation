const authService = require('../services/authService');

exports.register = async (req, res) => {
  await authService.register(req, res);
};

exports.login = async (req, res) => {
  await authService.login(req, res);
};

exports.getProfile = async (req, res) => {
  await authService.getProfile(req, res);
};

exports.updateProfile = async (req, res) => {
  await authService.updateProfile(req, res);
}; 