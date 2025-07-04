const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAnnualActivitySummary = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31, 23, 59, 59);

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { maxAnnualTurnover: true }
    });

    const maxAnnualTurnover = user?.maxAnnualTurnover || 0;

    const paidInvoices = await prisma.invoice.findMany({
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

    const annualTurnover = paidInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);

    const pendingInvoices = await prisma.invoice.findMany({
      where: {
        project: {
          userId: userId
        },
        status: {
          in: ['sent', 'pending']
        },
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const pendingPayments = pendingInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);

    const pendingQuotes = await prisma.quotes.findMany({
      where: {
        project: {
          userId: userId
        },
        status: 'sent',
        createdAt: {
          gte: startOfYear,
          lte: endOfYear
        }
      }
    });

    const pendingQuotesAmount = pendingQuotes.reduce((sum, quote) => sum + parseFloat(quote.amount || 0), 0);

    const remainingTurnover = Math.max(0, maxAnnualTurnover - annualTurnover);

    return {
      annualTurnover: parseFloat(annualTurnover.toFixed(2)),
      pendingPayments: parseFloat(pendingPayments.toFixed(2)),
      pendingQuotesAmount: parseFloat(pendingQuotesAmount.toFixed(2)),
      maxAnnualTurnover: parseFloat(maxAnnualTurnover.toFixed(2)),
      remainingTurnover: parseFloat(remainingTurnover.toFixed(2))
    };
  } catch (error) {
    console.error('Error in getAnnualActivitySummary:', error);
    throw error;
  }
};

exports.getQuarterlySummary = async (userId, quarterOffset = 0) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.floor(currentDate.getMonth() / 3);
    
    const targetQuarter = currentQuarter + quarterOffset;
    const targetYear = currentYear + Math.floor(targetQuarter / 4);
    const quarterInYear = targetQuarter % 4;
    
    const startOfQuarter = new Date(targetYear, quarterInYear * 3, 1);
    const endOfQuarter = new Date(targetYear, (quarterInYear + 1) * 3, 0, 23, 59, 59);

    const paidInvoices = await prisma.invoice.findMany({
      where: {
        project: {
          userId: userId
        },
        status: 'paid',
        createdAt: {
          gte: startOfQuarter,
          lte: endOfQuarter
        }
      }
    });

    const paidTurnover = paidInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);

    const estimatedInvoices = await prisma.invoice.findMany({
      where: {
        project: {
          userId: userId
        },
        status: {
          in: ['sent', 'pending']
        },
        createdAt: {
          gte: startOfQuarter,
          lte: endOfQuarter
        }
      }
    });

    const estimatedTurnover = estimatedInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);

    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        project: {
          userId: userId
        },
        status: 'overdue',
        createdAt: {
          gte: startOfQuarter,
          lte: endOfQuarter
        }
      }
    });

    const chargesToPay = overdueInvoices.reduce((sum, invoice) => sum + parseFloat(invoice.amount || 0), 0);

    const estimatedQuotes = await prisma.quotes.findMany({
      where: {
        project: {
          userId: userId
        },
        status: 'sent',
        createdAt: {
          gte: startOfQuarter,
          lte: endOfQuarter
        }
      }
    });

    const estimatedCharges = estimatedQuotes.reduce((sum, quote) => sum + parseFloat(quote.amount || 0), 0);

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
      chargesToPay: parseFloat(chargesToPay.toFixed(2)),
      estimatedCharges: parseFloat(estimatedCharges.toFixed(2))
    };
  } catch (error) {
    console.error('Error in getQuarterlySummary:', error);
    throw error;
  }
};

exports.getMonthlyPaidTurnover = async (userId, year = null) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
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
      monthlyData[month].turnover += parseFloat(invoice.amount || 0);
    });

    return monthlyData.map(data => ({
      ...data,
      turnover: parseFloat(data.turnover.toFixed(2))
    }));
  } catch (error) {
    console.error('Error in getMonthlyPaidTurnover:', error);
    throw error;
  }
};

exports.getAnnualTurnoverEvolution = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    const currentYear = new Date().getFullYear();
    const years = [];
    
    for (let i = 2; i >= 0; i--) {
      const year = currentYear - i;
      const monthlyData = await exports.getMonthlyPaidTurnover(userId, year);
      const annualTotal = monthlyData.reduce((sum, month) => sum + month.turnover, 0);
      
      years.push({
        year,
        annualTotal: parseFloat(annualTotal.toFixed(2)),
        monthlyData
      });
    }

    return years;
  } catch (error) {
    console.error('Error in getAnnualTurnoverEvolution:', error);
    throw error;
  }
}; 