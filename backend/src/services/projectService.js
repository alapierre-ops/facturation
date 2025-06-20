const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

exports.getAllProjects = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { status } = req.query;
    let where = {
      client: { userId },
    };
    if (status && status !== 'all') {
      where.status = status;
    } else {
      where.status = { notIn: ['archived', 'cancelled'] };
    }
    const projects = await prisma.project.findMany({
      where,
      include: { client: { select: { name: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching projects' });
  }
};

exports.createProject = async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      clientId: z.number().int(),
      description: z.string().optional(),
      status: z.string().optional(),
      startDate: z.coerce.date().optional(),
      endDate:   z.coerce.date().optional(),
    });
    const { name, clientId, description, status, startDate, endDate } = schema.parse(req.body);
    const project = await prisma.project.create({
      data: {
        name,
        description,
        status,
        startDate,
        endDate,
        clientId,
        userId: req.user.userId,
      },
      include: { client: { select: { name: true } } },
    });
    res.status(201).json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error creating project' });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      clientId: z.number().int().optional(),
      description: z.string().optional(),
      status: z.string().optional(),
      startDate: z.coerce.date().optional().nullable(),
      endDate:   z.coerce.date().optional().nullable(),
    });
    const payload = schema.parse(req.body);
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(req.params.id, 10),
        userId: req.user.userId,
      },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    const data = Object.fromEntries(
      Object.entries(payload).filter(([, v]) => v !== undefined)
    );
    const updated = await prisma.project.update({
      where: { id: project.id },
      data,
    });
    res.json(updated);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error updating project' });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(req.params.id),
        userId: req.user.userId
      }
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    await prisma.project.delete({
      where: { id: parseInt(req.params.id) }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project' });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const projectId = parseInt(req.params.id);
    const userId = req.user.userId;
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId,
      },
      include: {
        client: { select: { name: true } },
        quotes: true,
        invoices: true,
      },
    });
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching project detail' });
  }
}; 