const projectService = require('../services/projectService');

exports.getAllProjects = async (req, res) => {
  await projectService.getAllProjects(req, res);
};

exports.createProject = async (req, res) => {
  await projectService.createProject(req, res);
};

exports.updateProject = async (req, res) => {
  await projectService.updateProject(req, res);
};

exports.deleteProject = async (req, res) => {
  await projectService.deleteProject(req, res);
};

exports.getProjectById = async (req, res) => {
  await projectService.getProjectById(req, res);
}; 