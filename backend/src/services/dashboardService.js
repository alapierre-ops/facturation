const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class DashboardService {
  async getAnnualActivitySummary(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    // Get user profile for max annual turnover
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { maxAnnualTurnover: true }
    });

    const maxAnnualTurnover = user?.maxAnnualTurnover || 0;

    // Get all invoices for the year
    const invoices = await prisma.invoice.findMany({
      where: {
        project: {
          userId: userId
        },
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      include: {
        project: true
      }
    });

    // Calculate totals
    const annualTurnover = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);

    const pendingPayments = invoices
      .filter(invoice => invoice.status === 'sent' || invoice.status === 'pending')
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);

    const unsentInvoices = invoices
      .filter(invoice => invoice.status === 'draft')
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);

    const remainingTurnover = Math.max(0, maxAnnualTurnover - annualTurnover);

    return {
      annualTurnover: parseFloat(annualTurnover.toFixed(2)),
      pendingPayments: parseFloat(pendingPayments.toFixed(2)),
      unsentInvoices: parseFloat(unsentInvoices.toFixed(2)),
      maxAnnualTurnover: parseFloat(maxAnnualTurnover.toFixed(2)),
      remainingTurnover: parseFloat(remainingTurnover.toFixed(2))
    };
  }

  async getQuarterlySummary(userId, quarterOffset = 0) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3);
    
    const targetQuarter = currentQuarter + quarterOffset;
    const targetYear = currentYear + Math.floor(targetQuarter / 4);
    const quarterInYear = targetQuarter % 4;
    
    const startOfQuarter = new Date(targetYear, quarterInYear * 3, 1);
    const endOfQuarter = new Date(targetYear, (quarterInYear + 1) * 3, 0, 23, 59, 59);

    // Get all invoices for the quarter
    const invoices = await prisma.invoice.findMany({
      where: {
        project: {
          userId: userId
        },
        createdAt: {
          gte: startOfQuarter,
          lte: endOfQuarter
        }
      },
      include: {
        project: true
      }
    });

    // Get all quotes for the quarter
    const quotes = await prisma.quote.findMany({
      where: {
        project: {
          userId: userId
        },
        createdAt: {
          gte: startOfQuarter,
          lte: endOfQuarter
        }
      },
      include: {
        project: true
      }
    });

    // Calculate paid turnover
    const paidTurnover = invoices
      .filter(invoice => invoice.status === 'paid')
      .reduce((sum, invoice) => sum + parseFloat(invoice.total), 0);

    // Calculate estimated turnover from quotes
    const estimatedTurnover = quotes
      .filter(quote => quote.status === 'accepted')
      .reduce((sum, quote) => sum + parseFloat(quote.total), 0);

    // Calculate charges to be paid (expenses)
    const chargesToBePaid = 0; // This would need to be implemented based on your expense tracking

    // Calculate estimated charges
    const estimatedCharges = 0; // This would need to be implemented based on your expense tracking

    const quarterNames = ['Q1', 'Q2', 'Q3', 'Q4'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                       'July', 'August', 'September', 'October', 'November', 'December'];

    return {
      period: {
        start: startOfQuarter.toISOString().split('T')[0],
        end: endOfQuarter.toISOString().split('T')[0],
        display: `${quarterNames[quarterInYear]} ${targetYear} (${monthNames[startOfQuarter.getMonth()]} ${startOfQuarter.getDate()} - ${monthNames[endOfQuarter.getMonth()]} ${endOfQuarter.getDate()}, ${targetYear})`
      },
      paidTurnover: parseFloat(paidTurnover.toFixed(2)),
      estimatedTurnover: parseFloat(estimatedTurnover.toFixed(2)),
      chargesToBePaid: parseFloat(chargesToBePaid.toFixed(2)),
      estimatedCharges: parseFloat(estimatedCharges.toFixed(2))
    };
  }

  async getMonthlyPaidTurnover(userId, year = null) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const targetYear = year || new Date().getFullYear();
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);

    const invoices = await prisma.invoice.findMany({
      where: {
        project: {
          userId: userId
        },
        status: 'paid',
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const monthlyData = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      monthName: new Date(targetYear, i, 1).toLocaleString('en-US', { month: 'short' }),
      turnover: 0
    }));

    invoices.forEach(invoice => {
      const month = new Date(invoice.createdAt).getMonth();
      monthlyData[month].turnover += parseFloat(invoice.total);
    });

    return monthlyData.map(data => ({
      ...data,
      turnover: parseFloat(data.turnover.toFixed(2))
    }));
  }

  async getAnnualTurnoverEvolution(userId) {
    if (!userId) {
      throw new Error('User ID is required');
    }

    const currentYear = new Date().getFullYear();
    const years = [];
    
    // Get data for current year and previous 2 years
    for (let i = 2; i >= 0; i--) {
      const year = currentYear - i;
      const monthlyData = await this.getMonthlyPaidTurnover(userId, year);
      const annualTotal = monthlyData.reduce((sum, month) => sum + month.turnover, 0);
      
      years.push({
        year,
        annualTotal: parseFloat(annualTotal.toFixed(2)),
        monthlyData
      });
    }

    return years;
  }
}

module.exports = new DashboardService(); 