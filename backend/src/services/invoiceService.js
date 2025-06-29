const { PrismaClient } = require('@prisma/client');
const emailService = require('./emailService');

const prisma = new PrismaClient();

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
    const { clientId, projectId, status, totalHT, totalTTC, dueDate, lines } = req.body;

    if (!clientId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Missing clientId or line items' });
    }

    const number = 'F-' + Date.now();
    const invoiceData = {
      number,
      status: status || 'draft',
      totalHT,
      totalTTC,
      dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      userId,
      clientId,
      projectId,
    };

    const result = await prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.create({
        data: invoiceData,
      });
      const lineCreates = lines.map((line) =>
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
    const { status, totalHT, totalTTC, dueDate, lines } = req.body;

    // Vérifier que la facture existe et appartient à l'utilisateur
    const existingInvoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!existingInvoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Mettre à jour la facture et ses lignes
    const result = await prisma.$transaction(async (tx) => {
      // Supprimer les anciennes lignes
      await tx.lineInvoice.deleteMany({
        where: { invoiceId },
      });

      // Mettre à jour la facture
      const updatedInvoice = await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          status: status || existingInvoice.status,
          totalHT: totalHT || existingInvoice.totalHT,
          totalTTC: totalTTC || existingInvoice.totalTTC,
          dueDate: dueDate || existingInvoice.dueDate,
        },
      });

      // Créer les nouvelles lignes
      if (lines && Array.isArray(lines)) {
        const lineCreates = lines.map((line) =>
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

    // Vérifier que la facture existe et appartient à l'utilisateur
    const invoice = await prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
    });

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    // Supprimer la facture et ses lignes
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

    // Envoyer l'email
    const emailResult = await emailService.sendInvoiceEmail(invoice, invoice.client, recipientEmail);

    // Mettre à jour le statut de la facture à "sent" si ce n'est pas déjà le cas
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

    // Fetch the quote with all its details
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

    // Check if quote status is 'accepted'
    if (quote.status !== 'accepted') {
      return res.status(400).json({ error: 'Quote must be accepted to generate invoice' });
    }

    // Check if quote was sent less than 30 days ago
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    if (quote.date < thirtyDaysAgo) {
      return res.status(400).json({ error: 'Quote is too old to generate invoice (more than 30 days)' });
    }

    // Generate invoice number
    const invoiceNumber = 'F-' + Date.now();
    
    // Set due date to 30 days from now
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30);

    const result = await prisma.$transaction(async (tx) => {
      // Create the invoice
      const invoice = await tx.invoice.create({
        data: {
          number: invoiceNumber,
          date: new Date(),
          dueDate: dueDate,
          status: 'draft',
          totalHT: quote.totalHT,
          totalTTC: quote.totalTTC,
          userId: quote.userId,
          clientId: quote.clientId,
          projectId: quote.projectId,
          quoteId: quote.id,
        },
      });

      // Create invoice lines from quote lines
      const lineCreates = quote.lines.map((line) =>
        tx.lineInvoice.create({
          data: {
            description: line.description,
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            totalHT: line.totalHT,
            totalTTC: line.totalTTC,
            invoiceId: invoice.id,
          },
        })
      );
      
      await Promise.all(lineCreates);

      // Return the created invoice with its lines
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