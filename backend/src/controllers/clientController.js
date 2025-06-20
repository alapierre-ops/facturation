const clientService = require('../services/clientService');

exports.getAllClients = async (req, res) => {
  await clientService.getAllClients(req, res);
};

exports.getClientById = async (req, res) => {
  await clientService.getClientById(req, res);
};

exports.createClient = async (req, res) => {
  await clientService.createClient(req, res);
};

exports.updateClient = async (req, res) => {
  await clientService.updateClient(req, res);
};

exports.deleteClient = async (req, res) => {
  await clientService.deleteClient(req, res);
}; 