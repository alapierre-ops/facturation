const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const authMiddleware = require('../../middleware/auth');

const prisma = new PrismaClient();

// Validation schema
const clientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional()
});

// Get all clients for the logged-in user
router.get('/', authMiddleware, async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      where: { userId: req.user.userId }
    });
    res.json(clients);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching clients' });
  }
});

// Get a single client
router.get('/:id', authMiddleware, async (req, res) => {
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
});

// Create a new client
router.post('/', authMiddleware, async (req, res) => {
  try {
    const clientData = clientSchema.parse(req.body);
    
    const client = await prisma.client.create({
      data: {
        ...clientData,
        userId: req.user.userId
      }
    });

    res.status(201).json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error creating client' });
  }
});

// Update a client
router.put('/:id', authMiddleware, async (req, res) => {
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
});

// Delete a client
router.delete('/:id', authMiddleware, async (req, res) => {
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

    await prisma.client.delete({
      where: { id: parseInt(req.params.id) }
    });

    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting client' });
  }
});

module.exports = router; 