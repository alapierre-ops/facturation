const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

exports.createQuote = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { projectId, status, totalHT, totalTTC, lines } = req.body;
    if (!projectId || !Array.isArray(lines) || lines.length === 0) {
      return res.status(400).json({ error: 'Missing projectId or line items' });
    }
    const project = await prisma.project.findFirst({
      where: { id: projectId, userId },
    });
    if (!project) {
      return res.status(403).json({ error: 'Project not found or not authorized' });
    }
    const number = 'Q-' + Date.now();
    const quoteData = {
      number,
      status: status || 'draft',
      totalHT,
      totalTTC,
      userId,
      clientId: project.clientId,
      projectId,
    };
    const result = await prisma.$transaction(async (tx) => {
      const quote = await tx.quotes.create({
        data: quoteData,
      });
      const lineCreates = lines.map((line) =>
        tx.ligneQuotes.create({
          data: {
            ...line,
            quoteId: quote.id,
          },
        })
      );
      await Promise.all(lineCreates);
      return tx.quotes.findUnique({
        where: { id: quote.id },
        include: { lignes: true },
      });
    });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error creating quote' });
  }
}; 