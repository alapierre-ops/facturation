const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
const projectService = require('./projectService');

const prisma = new PrismaClient();

class QuoteService {
  async createQuote(req, res) {
    try {
      const { projectId, status, lines, notes, paymentType, total } = req.body;
      const userId = req.user.userId;

      if (projectId) {
        const project = await prisma.project.findFirst({
          where: { id: projectId, userId }
        });
        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }
      }

      const lastQuote = await prisma.quotes.findFirst({
        where: { userId },
        orderBy: { number: 'desc' }
      });

      let nextNumber = 1;
      if (lastQuote) {
        const lastNumber = parseInt(lastQuote.number.replace('Q', ''));
        nextNumber = lastNumber + 1;
      }

      const quoteNumber = `Q${nextNumber.toString().padStart(4, '0')}`;

      let totalAmount = 0;
      const processedLines = [];

      for (const line of lines) {
        const { description, quantity, unitPrice } = line;
        const amount = quantity * unitPrice;
        totalAmount += amount;

        processedLines.push({
          description,
          quantity,
          unitPrice,
          amount
        });
      }

      const quote = await prisma.quotes.create({
        data: {
          number: quoteNumber,
          status: status || 'draft',
          amount: totalAmount,
          notes,
          paymentType,
          userId,
          projectId: projectId || null,
          clientId: projectId ? (await prisma.project.findUnique({ where: { id: projectId } })).clientId : null,
          lines: {
            create: processedLines
          }
        },
        include: {
          lines: true,
          project: true,
          client: true
        }
      });

      if (projectId && status === 'sent') {
        await prisma.project.update({
          where: { id: projectId },
          data: { status: 'quote_sent' }
        });
      }

      res.status(201).json(quote);
    } catch (error) {
      console.error('Error creating quote:', error);
      res.status(500).json({ error: 'Failed to create quote' });
    }
  }

  async getAllQuotes(req, res) {
    try {
      const userId = req.user.userId;
      const { search, status } = req.query;

      const where = { userId };

      if (status && status !== 'all') {
        where.status = status;
      }

      if (search) {
        where.OR = [
          { number: { contains: search, mode: 'insensitive' } },
          { notes: { contains: search, mode: 'insensitive' } },
          { client: { name: { contains: search, mode: 'insensitive' } } },
          { project: { name: { contains: search, mode: 'insensitive' } } }
        ];
      }

      const quotes = await prisma.quotes.findMany({
        where,
        include: {
          client: true,
          project: true,
          lines: true
        },
        orderBy: { number: 'asc' }
      });

      res.json(quotes);
    } catch (error) {
      console.error('Error fetching quotes:', error);
      res.status(500).json({ error: 'Failed to fetch quotes' });
    }
  }

  async getQuoteById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const quote = await prisma.quotes.findFirst({
        where: { id: parseInt(id), userId },
        include: {
          lines: true,
          client: true,
          project: true
        }
      });

      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      res.json(quote);
    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  }

  async updateQuote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;
      const { status, lines, notes, paymentType, total } = req.body;

      const existingQuote = await prisma.quotes.findFirst({
        where: { id: parseInt(id), userId },
        include: { project: true }
      });

      if (!existingQuote) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      if (existingQuote.status === 'accepted') {
        const invoiceCount = await prisma.invoice.count({
          where: { quoteId: parseInt(id) }
        });
        if (invoiceCount > 0) {
          return res.status(400).json({ error: 'Cannot update accepted quote with existing invoices' });
        }
      }

      let totalAmount = 0;
      const processedLines = [];

      if (lines && Array.isArray(lines)) {
        for (const line of lines) {
          const { description, quantity, unitPrice } = line;
          const amount = quantity * unitPrice;
          totalAmount += amount;

          processedLines.push({
            description,
            quantity,
            unitPrice,
            amount
          });
        }
      }

      const updateData = {
        status,
        amount: totalAmount,
        notes,
        paymentType
      };

      if (lines && Array.isArray(lines)) {
        updateData.lines = {
          deleteMany: {},
          create: processedLines
        };
      }

      const quote = await prisma.quotes.update({
        where: { id: parseInt(id) },
        data: updateData,
        include: {
          lines: true,
          client: true,
          project: true
        }
      });

      if (existingQuote.projectId && status === 'sent') {
        await prisma.project.update({
          where: { id: existingQuote.projectId },
          data: { status: 'quote_sent' }
        });
      }

      res.json(quote);
    } catch (error) {
      console.error('Error updating quote:', error);
      res.status(500).json({ error: 'Failed to update quote' });
    }
  }

  async deleteQuote(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const quote = await prisma.quotes.findFirst({
        where: { id: parseInt(id), userId },
        include: { project: true }
      });

      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
    
      if (quote.status === 'accepted') {
        const invoiceCount = await prisma.invoice.count({
          where: { quoteId: parseInt(id) }
        });
        if (invoiceCount > 0) {
          return res.status(400).json({ error: 'Cannot delete accepted quote with existing invoices' });
        }
      }

      await prisma.lineQuote.deleteMany({
        where: { quoteId: parseInt(id) }
      });

      await prisma.quotes.delete({
        where: { id: parseInt(id) }
      });

      if (quote.project && quote.status === 'sent') {
        await prisma.project.update({
          where: { id: quote.project.id },
          data: { status: 'pending' }
        });
      }

      res.json({ message: 'Quote deleted successfully' });
    } catch (error) {
      console.error('Error deleting quote:', error);
      res.status(500).json({ error: 'Failed to delete quote' });
    }
  }

  async updateQuoteStatus(req, res) {
    try {
      const quoteId = parseInt(req.params.id);
      const userId = req.user.userId;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const validStatuses = ['draft', 'sent', 'accepted', 'refused', 'expired'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }

      const quote = await prisma.quotes.findFirst({
        where: {
          id: quoteId,
          userId,
        },
      });

      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      const updatedQuote = await prisma.quotes.update({
        where: { id: quoteId },
        data: { status },
        include: {
          lines: true,
          client: true,
          project: true,
        },
      });

      if (updatedQuote.projectId) {
        await projectService.updateProjectStatusFromQuotes(updatedQuote.projectId);
      }

      res.json(updatedQuote);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error updating quote status' });
    }
  }

  async sendQuoteEmail(req, res) {
    try {
      const quoteId = parseInt(req.params.id);
      const userId = req.user.userId;
      const { recipientEmail } = req.body;

      if (!recipientEmail) {
        return res.status(400).json({ error: 'Recipient email is required' });
      }

      const quote = await prisma.quotes.findFirst({
        where: {
          id: quoteId,
          userId,
        },
        include: {
          lines: true,
          client: true,
          project: true,
        },
      });

      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      const emailResult = await emailService.sendQuoteEmail(quote, quote.client, recipientEmail);

      if (quote.status !== 'sent') {
        await prisma.quotes.update({
          where: { id: quoteId },
          data: { status: 'sent' },
        });
      }

      if (quote.projectId) {
        await projectService.updateProjectStatusFromQuotes(quote.projectId);
      }

      res.json({ 
        success: true, 
        message: 'Quote sent successfully',
        emailResult 
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error sending quote email' });
    }
  }

  async createInvoiceFromQuote(req, res) {
    try {
      const userId = req.user.userId;
      const { quoteId } = req.body;

      if (!quoteId) {
        return res.status(400).json({ error: 'Quote ID is required' });
      }

      const quote = await prisma.quotes.findFirst({
        where: {
          id: parseInt(quoteId),
          userId,
        },
        include: {
          lines: true,
          client: true,
          project: true,
        },
      });

      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }

      if (quote.status !== 'accepted') {
        return res.status(400).json({ error: 'Quote must be accepted to generate invoice' });
      }

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      if (quote.date < thirtyDaysAgo) {
        return res.status(400).json({ error: 'Quote is too old to generate invoice (more than 30 days)' });
      }

      const invoiceNumber = 'F-' + Date.now();
      
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 30);

      const result = await prisma.$transaction(async (tx) => {
        const invoice = await tx.invoice.create({
          data: {
            number: invoiceNumber,
            date: new Date(),
            dueDate: dueDate,
            status: 'draft',
            total: quote.amount,
            country: quote.country,
            taxRate: quote.taxRate,
            notes: quote.notes,
            paymentType: quote.paymentType,
            userId: quote.userId,
            clientId: quote.clientId,
            projectId: quote.projectId,
            quoteId: quote.id,
          },
        });

        const lineCreates = quote.lines.map((line) =>
          tx.lineInvoice.create({
            data: {
              description: line.description,
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              total: line.amount,
              invoiceId: invoice.id,
            },
          })
        );
        
        await Promise.all(lineCreates);

        return tx.invoice.findUnique({
          where: { id: invoice.id },
          include: {
            lines: true,
            client: true,
            project: true,
            quotes: true,
          },
        });
      });

      res.status(201).json(result);
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: 'Error creating invoice from quote' });
    }
  }
}

module.exports = new QuoteService(); 