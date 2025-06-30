const adminService = require('../services/adminService');

class AdminController {
  async getAllUsers(req, res) {
    try {
      if (!(await adminService.isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const users = await adminService.getAllUsers();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getUserById(req, res) {
    try {
      if (!(await adminService.isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const user = await adminService.getUserById(Number(req.params.id));
      res.json(user);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createUser(req, res) {
    try {
      if (!(await adminService.isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const user = await adminService.createUser(req.body);
      res.status(201).json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      if (!(await adminService.isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const user = await adminService.updateUser(Number(req.params.id), req.body);
      res.json(user);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteUser(req, res) {
    try {
      if (!(await adminService.isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const result = await adminService.deleteUser(Number(req.params.id));
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async changeUserPassword(req, res) {
    try {
      if (!(await adminService.isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const { newPassword } = req.body;
      const result = await adminService.changeUserPassword(Number(req.params.id), newPassword);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getUserStats(req, res) {
    try {
      if (!(await adminService.isAdmin(req.user.id))) {
        return res.status(403).json({ error: 'Access denied' });
      }
      const stats = await adminService.getUserStats(Number(req.params.id));
      res.json(stats);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new AdminController(); 