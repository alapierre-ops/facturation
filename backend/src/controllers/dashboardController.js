const dashboardService = require('../services/dashboardService');

class DashboardController {
  async getAnnualActivitySummary(req, res) {
    try {
      const userId = req.user.id;
      const summary = await dashboardService.getAnnualActivitySummary(userId);
      res.json(summary);
    } catch (error) {
      console.error('Error getting annual activity summary:', error);
      res.status(500).json({ error: 'Failed to get annual activity summary' });
    }
  }

  async getQuarterlySummary(req, res) {
    try {
      const userId = req.user.id;
      const quarterOffset = parseInt(req.query.quarter) || 0;
      const summary = await dashboardService.getQuarterlySummary(userId, quarterOffset);
      res.json(summary);
    } catch (error) {
      console.error('Error getting quarterly summary:', error);
      res.status(500).json({ error: 'Failed to get quarterly summary' });
    }
  }

  async getMonthlyPaidTurnover(req, res) {
    try {
      const userId = req.user.id;
      const year = req.query.year ? parseInt(req.query.year) : null;
      const data = await dashboardService.getMonthlyPaidTurnover(userId, year);
      res.json(data);
    } catch (error) {
      console.error('Error getting monthly paid turnover:', error);
      res.status(500).json({ error: 'Failed to get monthly paid turnover' });
    }
  }

  async getAnnualTurnoverEvolution(req, res) {
    try {
      const userId = req.user.id;
      const data = await dashboardService.getAnnualTurnoverEvolution(userId);
      res.json(data);
    } catch (error) {
      console.error('Error getting annual turnover evolution:', error);
      res.status(500).json({ error: 'Failed to get annual turnover evolution' });
    }
  }
}

module.exports = new DashboardController(); 