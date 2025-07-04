const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');

const prisma = new PrismaClient();

const generateNextInvoiceNumber = async (userId) => {
  const lastInvoice = await prisma.invoice.findFirst({
    where: { userId },
    orderBy: { number: 'desc' }
  });

  if (!lastInvoice) {
    return 'F-0001';
  }

  const lastNumber = parseInt(lastInvoice.number.replace('F-', ''));
  const nextNumber = lastNumber + 1;
  return `F-${nextNumber.toString().padStart(4, '0')}`;
};

exports.getAllInvoices = async (req, res) => {
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

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        client: true,
        project: true,
        quotes: true,
        lines: true
      },
      orderBy: { number: 'asc' }
    });

    res.json(invoices);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId: userId,
      },
      include: {
        lines: true,
        client: true,
        project: true,
        quotes: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    res.json(invoice);
  } catch (error) {
    console.error('Error fetching invoice:', error);
    res.status(500).json({ error: 'Failed to fetch invoice' });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const { projectId, quoteId, dueDate, status, lines, notes, paymentType } = req.body;
    const userId = req.user.id;

    if (projectId) {
      const project = await prisma.project.findFirst({
        where: { id: projectId, userId }
      });
      if (!project) {
        return res.status(404).json({ error: 'Project not found' });
      }
    }

    if (quoteId) {
      const quote = await prisma.quotes.findFirst({
        where: { id: quoteId, userId }
      });
      if (!quote) {
        return res.status(404).json({ error: 'Quote not found' });
      }
    }

    const invoiceNumber = await generateNextInvoiceNumber(userId);

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

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        dueDate: new Date(dueDate),
        status: status || 'draft',
        amount: totalAmount,
        notes,
        paymentType,
        userId,
        projectId: projectId || (quoteId ? (await prisma.quotes.findUnique({ where: { id: quoteId } })).projectId : null),
        quoteId: quoteId || null,
        clientId: projectId ? (await prisma.project.findUnique({ where: { id: projectId } })).clientId : 
                 quoteId ? (await prisma.quotes.findUnique({ where: { id: quoteId } })).clientId : null,
        lines: {
          create: processedLines
        }
      },
      include: {
        lines: true,
        project: true,
        client: true,
        quotes: true
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice:', error);
    res.status(500).json({ error: 'Failed to create invoice' });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { status, dueDate, lines, notes, paymentType } = req.body;

    const existingInvoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId },
      include: { lines: true }
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (existingInvoice.status === 'paid') {
      return res.status(400).json({ error: 'Cannot update paid invoice' });
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
    } else {
      for (const line of existingInvoice.lines) {
        totalAmount += line.amount;
      }
    }

    const updateData = {
      status,
      dueDate: dueDate ? new Date(dueDate) : existingInvoice.dueDate,
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

    const invoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: updateData,
      include: {
        lines: true,
        project: true,
        client: true,
        quotes: true
      }
    });

    res.json(invoice);
  } catch (error) {
    console.error('Error updating invoice:', error);
    res.status(500).json({ error: 'Failed to update invoice' });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;

    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId, userId }
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Cannot delete paid invoice' });
    }

    await prisma.lineInvoice.deleteMany({
      where: { invoiceId: invoiceId }
    });

    await prisma.invoice.delete({
      where: { id: invoiceId }
    });

    res.json({ message: 'Invoice deleted successfully' });
  } catch (error) {
    console.error('Error deleting invoice:', error);
    res.status(500).json({ error: 'Failed to delete invoice' });
  }
};

exports.updateInvoiceStatus = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }

    const validStatuses = ['draft', 'sent', 'paid', 'overdue', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const updatedInvoice = await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status },
      include: {
        lines: true,
        client: true,
        project: true,
        quotes: true,
      },
    });

    res.json(updatedInvoice);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error updating invoice status' });
  }
};

exports.sendInvoiceEmail = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { recipientEmail } = req.body;

    if (!recipientEmail) {
      return res.status(400).json({ error: 'Recipient email is required' });
    }

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        lines: true,
        client: true,
        project: true,
        quotes: true,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const emailResult = await emailService.sendInvoiceEmail(invoice, invoice.client, recipientEmail);

    if (invoice.status !== 'sent') {
      await prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'sent' },
      });
    }

    res.json({ 
      success: true, 
      message: 'Invoice sent successfully',
      emailResult 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error sending invoice email' });
  }
};

exports.createInvoiceFromQuote = async (req, res) => {
  try {
    const userId = req.user.id;
    const { quoteId, dueDate } = req.body;

    const quote = await prisma.quotes.findFirst({
      where: { id: quoteId, userId },
      include: {
        lines: true,
        client: true,
        project: true
      }
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    const invoiceNumber = await generateNextInvoiceNumber(userId);

    const invoice = await prisma.invoice.create({
      data: {
        number: invoiceNumber,
        dueDate: dueDate ? new Date(dueDate) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: 'draft',
        amount: quote.amount,
        notes: quote.notes,
        paymentType: quote.paymentType,
        userId,
        clientId: quote.clientId,
        projectId: quote.projectId,
        quoteId: quote.id,
        lines: {
          create: quote.lines.map(line => ({
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            amount: line.amount
          }))
        }
      },
      include: {
        lines: true,
        project: true,
        client: true,
        quotes: true
      }
    });

    res.status(201).json(invoice);
  } catch (error) {
    console.error('Error creating invoice from quote:', error);
    res.status(500).json({ error: 'Failed to create invoice from quote' });
  }
}; 