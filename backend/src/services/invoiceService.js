const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
const taxService = require('./taxService');

const prisma = new PrismaClient();

// Fonction pour générer le prochain numéro de facture
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
    const invoices = await prisma.invoice.findMany({
      where: { userId },
      include: {
        client: { select: { name: true } },
        project: { select: { name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(invoices);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoices' });
  }
};

exports.getInvoiceById = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;

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

    res.json(invoice);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching invoice' });
  }
};

exports.createInvoice = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { clientId, projectId, status, country, taxRate, dueDate, lines, notes, paymentType } = req.body;

    if (!clientId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Missing clientId or line items' });
    }

    const documentTotals = taxService.calculateDocumentTotals(lines, country || 'FRANCE', taxRate || 'STANDARD');
    
    const calculatedLines = lines.map(line => {
      const lineTotals = taxService.calculateLineTotals(line.quantity, line.unitPrice, country || 'FRANCE', taxRate || 'STANDARD');
      return {
        description: line.description,
        quantity: parseFloat(line.quantity),
        unitPrice: parseFloat(line.unitPrice),
        subtotal: lineTotals.subtotal,
        taxAmount: lineTotals.taxAmount,
        total: lineTotals.total
      };
    });

    const number = await generateNextInvoiceNumber(userId);
    const invoiceData = {
      number,
      status: status || 'draft',
      subtotal: documentTotals.subtotal,
      taxAmount: documentTotals.taxAmount,
      total: documentTotals.total,
      country: country || 'FRANCE',
      taxRate: taxRate || 'STANDARD',
      notes: notes || null,
      paymentType: paymentType || null,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      userId,
      clientId,
      projectId,
    };

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: invoiceData,
      });
      const lineCreates = calculatedLines.map((line) =>
        tx.lineInvoice.create({
          data: {
            ...line,
            invoiceId: invoice.id,
          },
        })
      );
      await Promise.all(lineCreates);
      return tx.invoice.findUnique({
        where: { id: invoice.id },
        include: { lines: true },
      });
    });

    res.status(201).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error creating invoice' });
  }
};

exports.updateInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { status, country, taxRate, dueDate, lines, notes, paymentType } = req.body;

    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Empêcher la modification des factures payées
    if (existingInvoice.status === 'paid') {
      return res.status(400).json({ error: 'Cannot modify a paid invoice' });
    }

    let documentTotals = null;
    let calculatedLines = null;
    
    if (lines && Array.isArray(lines)) {
      documentTotals = taxService.calculateDocumentTotals(lines, country || existingInvoice.country, taxRate || existingInvoice.taxRate);
      calculatedLines = lines.map(line => {
        const lineTotals = taxService.calculateLineTotals(line.quantity, line.unitPrice, country || existingInvoice.country, taxRate || existingInvoice.taxRate);
        return {
          description: line.description,
          quantity: parseFloat(line.quantity),
          unitPrice: parseFloat(line.unitPrice),
          subtotal: lineTotals.subtotal,
          taxAmount: lineTotals.taxAmount,
          total: lineTotals.total
        };
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      await tx.lineInvoice.deleteMany({
        where: { invoiceId },
      });

      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: status || existingInvoice.status,
          country: country || existingInvoice.country,
          taxRate: taxRate || existingInvoice.taxRate,
          dueDate: dueDate || existingInvoice.dueDate,
          notes: notes !== undefined ? notes : existingInvoice.notes,
          paymentType: paymentType !== undefined ? paymentType : existingInvoice.paymentType,
          ...(documentTotals && {
            subtotal: documentTotals.subtotal,
            taxAmount: documentTotals.taxAmount,
            total: documentTotals.total,
          }),
        },
      });

      if (calculatedLines && Array.isArray(calculatedLines)) {
        const lineCreates = calculatedLines.map((line) =>
          tx.lineInvoice.create({
            data: {
              ...line,
              invoiceId,
            },
          })
        );
        await Promise.all(lineCreates);
      }

      return tx.invoice.findUnique({
        where: { id: invoiceId },
        include: {
          lines: true,
          client: true,
          project: true,
          quotes: true,
        },
      });
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error updating invoice' });
  }
};

exports.deleteInvoice = async (req, res) => {
  try {
    const invoiceId = parseInt(req.params.id);
    const userId = req.user.userId;

    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Empêcher la suppression des factures payées
    if (invoice.status === 'paid') {
      return res.status(400).json({ error: 'Cannot delete a paid invoice' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.lineInvoice.deleteMany({
        where: { invoiceId },
      });
      await tx.invoice.delete({
        where: { id: invoiceId },
      });
    });

    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error deleting invoice' });
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
  
    const invoiceNumber = await generateNextInvoiceNumber(userId);
    
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          date: new Date(),
          dueDate: dueDate,
          status: 'draft',
          subtotal: quote.subtotal,
          taxAmount: quote.taxAmount,
          total: quote.total,
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
            subtotal: line.subtotal,
            taxAmount: line.taxAmount,
            total: line.total,
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
}; 