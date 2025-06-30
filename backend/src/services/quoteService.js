const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');
const taxService = require('./taxService');
const projectService = require('./projectService');

const prisma = new PrismaClient();

// Fonction pour générer le prochain numéro de devis
const generateNextQuoteNumber = async (userId) => {
  const lastQuote = await prisma.quotes.findFirst({
    where: { userId },
    orderBy: { number: 'desc' }
  });

  if (!lastQuote) {
    return 'Q-0001';
  }

  const lastNumber = parseInt(lastQuote.number.replace('Q-', ''));
  const nextNumber = lastNumber + 1;
  return `Q-${nextNumber.toString().padStart(4, '0')}`;
};

exports.createQuote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId, status, country, taxRate, lines, notes, paymentType } = req.body;

    console.log('Request body:', req.body);
    
    if (!projectId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Missing projectId or line items' });
    }

    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
      include: { client: true }
    });

    if (!project) {
      return res.status(403).json({ error: 'Project not found or not authorized' });
    }

    const documentTotals = taxService.calculateDocumentTotals(lines, country || 'FRANCE', taxRate || 'STANDARD');
    console.log('Document totals:', documentTotals);
    
    const calculatedLines = lines.map(line => {
      const lineTotals = taxService.calculateLineTotals(line.quantity, line.unitPrice, country || 'FRANCE', taxRate || 'STANDARD');
      console.log('Line totals for', line.description, ':', lineTotals);
      return {
        description: line.description,
        quantity: parseFloat(line.quantity),
        unitPrice: parseFloat(line.unitPrice),
        subtotal: lineTotals.subtotal,
        taxAmount: lineTotals.taxAmount,
        total: lineTotals.total
      };
    });

    const number = await generateNextQuoteNumber(userId);
    const quoteData = {
      number,
      status: status || 'draft',
      subtotal: documentTotals.subtotal,
      taxAmount: documentTotals.taxAmount,
      total: documentTotals.total,
      country: country || 'FRANCE',
      taxRate: taxRate || 'STANDARD',
      notes: notes || null,
      paymentType: paymentType || null,
      userId,
      clientId: project.clientId,
      projectId,
    };

    console.log('Quote data:', quoteData);
    
    const result = await prisma.$transaction(async (tx) => {
      const quote = await tx.quotes.create({
        data: quoteData,
      });
      
      const lineCreates = calculatedLines.map((line) =>
        tx.lineQuote.create({
          data: {
            ...line,
            quoteId: quote.id,
          },
        })
      );
      await Promise.all(lineCreates);
      
      return tx.quotes.findUnique({
        where: { id: quote.id },
        include: { 
          lines: true,
          client: true,
          project: true
        },
      });
    });
    
    console.log('Created quote result:', result);
    res.status(201).json(result);
  } catch (error) {
    console.error('Error creating quote:', error);
    res.status(500).json({ error: 'Error creating quote' });
  }
};

exports.getQuoteById = async (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.user.userId;

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

    res.json(quote);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error fetching quote' });
  }
};

exports.updateQuote = async (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.user.userId;
    const { status, country, taxRate, lines, notes, paymentType } = req.body;

    const existingQuote = await prisma.quotes.findFirst({
      where: {
        id: quoteId,
        userId,
      },
    });

    if (!existingQuote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    let documentTotals = null;
    let calculatedLines = null;
    
    if (lines && Array.isArray(lines)) {
      documentTotals = taxService.calculateDocumentTotals(lines, country || existingQuote.country, taxRate || existingQuote.taxRate);
      calculatedLines = lines.map(line => {
        const lineTotals = taxService.calculateLineTotals(line.quantity, line.unitPrice, country || existingQuote.country, taxRate || existingQuote.taxRate);
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
      await tx.lineQuote.deleteMany({
        where: { quoteId },
      });

      const updatedQuote = await tx.quotes.update({
        where: { id: quoteId },
        data: {
          status: status || existingQuote.status,
          country: country || existingQuote.country,
          taxRate: taxRate || existingQuote.taxRate,
          notes: notes !== undefined ? notes : existingQuote.notes,
          paymentType: paymentType !== undefined ? paymentType : existingQuote.paymentType,
          ...(documentTotals && {
            subtotal: documentTotals.subtotal,
            taxAmount: documentTotals.taxAmount,
            total: documentTotals.total,
          }),
        },
      });

      if (calculatedLines && Array.isArray(calculatedLines)) {
        const lineCreates = calculatedLines.map((line) =>
          tx.lineQuote.create({
            data: {
              ...line,
              quoteId,
            },
          })
        );
        await Promise.all(lineCreates);
      }

      return tx.quotes.findUnique({
        where: { id: quoteId },
        include: {
          lines: true,
          client: true,
          project: true,
        },
      });
    });

    // Mettre à jour le statut du projet si nécessaire
    if (result.projectId) {
      await projectService.updateProjectStatusFromQuotes(result.projectId);
    }

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error updating quote' });
  }
};

exports.deleteQuote = async (req, res) => {
  try {
    const quoteId = parseInt(req.params.id);
    const userId = req.user.userId;

    const quote = await prisma.quotes.findFirst({
      where: {
        id: quoteId,
        userId,
      },
    });

    if (!quote) {
      return res.status(404).json({ error: 'Quote not found' });
    }

    await prisma.$transaction(async (tx) => {
      await tx.lineQuote.deleteMany({
        where: { quoteId },
      });
      await tx.quotes.delete({
        where: { id: quoteId },
      });
    });

    // Mettre à jour le statut du projet si nécessaire
    if (quote.projectId) {
      await projectService.updateProjectStatusFromQuotes(quote.projectId);
    }

    res.status(204).send();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error deleting quote' });
  }
};

exports.updateQuoteStatus = async (req, res) => {
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

    // Mettre à jour le statut du projet si nécessaire
    if (updatedQuote.projectId) {
      await projectService.updateProjectStatusFromQuotes(updatedQuote.projectId);
    }

    res.json(updatedQuote);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Error updating quote status' });
  }
};

exports.sendQuoteEmail = async (req, res) => {
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

    // Mettre à jour le statut du projet si nécessaire
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