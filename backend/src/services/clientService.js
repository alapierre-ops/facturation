const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const clientSchema = z.object({
  name: z.string().min(2).optional(),
  firstName: z.string().min(2).optional(),
  lastName: z.string().min(2).optional(),
  email: z.string().email(),
  phone: z.string(),
  address: z.string(),
}).refine((data) => {
  if (data.name) return true;
  if (data.firstName && data.lastName) return true;
  return false;
}, {
  message: 'Provide either company name or both first and last name',
  path: ['name'],
});

exports.getAllClients = async (req, res) => {
  try {
    const { search } = req.query;
    let whereClause = { userId: req.user.userId };
    
    if (search) {
      whereClause = {
        userId: req.user.userId,
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } }
        ]
      };
    }
    
    const clients = await prisma.client.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clients' });
  }
};

exports.getClientById = async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.userId
      }
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching client' });
  }
};

exports.createClient = async (req, res) => {
  try {
    const clientData = clientSchema.parse(req.body);
    let name = clientData.name;
    if (!name && clientData.firstName && clientData.lastName) {
      name = `${clientData.firstName} ${clientData.lastName}`;
    }
    const client = await prisma.client.create({
      data: {
        name,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        userId: req.user.userId
      }
    });
    res.status(201).json(client);
  } catch (error) {
    console.log(error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error creating client' });
  }
};

exports.updateClient = async (req, res) => {
  try {
    const clientData = clientSchema.parse(req.body);
    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.userId
      }
    });
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    const updatedClient = await prisma.client.update({
      where: { id: parseInt(req.params.id) },
      data: clientData
    });
    res.json(updatedClient);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error updating client' });
  }
};

exports.deleteClient = async (req, res) => {
  try {
    const client = await prisma.client.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.userId
      },
      include: {
        projects: true
      }
    });
    
    if (!client) {
      return res.status(404).json({ error: 'Client not found' });
    }
    
    if (client.projects.length > 0) {
      return res.status(400).json({ 
        error: 'Cannot delete client with associated projects. Please delete the projects first.' 
      });
    }
    
    await prisma.client.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting client' });
  }
}; 