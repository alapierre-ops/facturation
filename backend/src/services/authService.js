const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(2),
  fullName: z.string().optional(),
  birthDate: z.string().optional().transform(val => val ? new Date(val) : null),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  maxAnnualTurnover: z.number().optional(),
  chargeRate: z.number().optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  fullName: z.string().optional(),
  birthDate: z.string().optional().transform(val => val ? new Date(val) : null),
  address: z.string().optional(),
  phoneNumber: z.string().optional(),
  maxAnnualTurnover: z.number().optional(),
  chargeRate: z.number().optional()
});

exports.register = async (req, res) => {
  try {
    const userData = registerSchema.parse(req.body);
    const existingUser = await prisma.user.findUnique({ where: { email: userData.email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name,
        fullName: userData.fullName,
        birthDate: userData.birthDate,
        address: userData.address,
        phoneNumber: userData.phoneNumber,
        maxAnnualTurnover: userData.maxAnnualTurnover,
        chargeRate: userData.chargeRate
      }
    });
    
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        birthDate: user.birthDate,
        address: user.address,
        phoneNumber: user.phoneNumber,
        maxAnnualTurnover: user.maxAnnualTurnover,
        chargeRate: user.chargeRate
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error creating user' });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'No account found' });
    }
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        fullName: user.fullName,
        birthDate: user.birthDate,
        address: user.address,
        phoneNumber: user.phoneNumber,
        maxAnnualTurnover: user.maxAnnualTurnover,
        chargeRate: user.chargeRate
      }
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error logging in' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        birthDate: true,
        address: true,
        phoneNumber: true,
        maxAnnualTurnover: true,
        chargeRate: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching profile' });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const updateData = updateProfileSchema.parse(req.body);
    
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        birthDate: true,
        address: true,
        phoneNumber: true,
        maxAnnualTurnover: true,
        chargeRate: true,
        country: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    res.json({ user });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    res.status(500).json({ error: 'Error updating profile' });
  }
}; 