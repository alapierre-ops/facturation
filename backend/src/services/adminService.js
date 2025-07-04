const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const { z } = require('zod');

class AdminService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  async isAdmin(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    });
    return user?.role === 'admin';
  }

  async getAllUsers() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        role: true,
        maxAnnualTurnover: true,
        chargeRate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clients: true,
            projects: true,
            quotes: true,
            invoices: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users;
  }

  async getUserById(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        birthDate: true,
        address: true,
        phoneNumber: true,
        role: true,
        maxAnnualTurnover: true,
        chargeRate: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            clients: true,
            projects: true,
            quotes: true,
            invoices: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  }

  async createUser(userData) {
    const createUserSchema = z.object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(2),
      fullName: z.string().optional(),
      birthDate: z.string().optional().transform(val => val ? new Date(val) : null),
      address: z.string().optional(),
      phoneNumber: z.string().optional(),
      maxAnnualTurnover: z.number().optional(),
      chargeRate: z.number().optional(),
      role: z.enum(['user', 'admin']).default('user')
    });

    const validatedData = createUserSchema.parse(userData);

    const existingUser = await this.prisma.user.findUnique({
      where: { email: validatedData.email }
    });

    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...validatedData,
        password: hashedPassword
      },
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        role: true,
        maxAnnualTurnover: true,
        chargeRate: true,
        createdAt: true
      }
    });

    return user;
  }

  async updateUser(userId, updateData) {
    const updateUserSchema = z.object({
      name: z.string().min(2).optional(),
      fullName: z.string().optional(),
      birthDate: z.string().optional().transform(val => val ? new Date(val) : null),
      address: z.string().optional(),
      phoneNumber: z.string().optional(),
      maxAnnualTurnover: z.number().optional(),
      chargeRate: z.number().optional(),
      role: z.enum(['user', 'admin']).optional(),
    });

    const validatedData = updateUserSchema.parse(updateData);

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: validatedData,
      select: {
        id: true,
        email: true,
        name: true,
        fullName: true,
        role: true,
        maxAnnualTurnover: true,
        chargeRate: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return user;
  }

  async deleteUser(userId) {
    const userData = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            clients: true,
            projects: true,
            quotes: true,
            invoices: true
          }
        }
      }
    });

    if (!userData) {
      throw new Error('User not found');
    }

    const totalData = userData._count.clients + userData._count.projects + 
                     userData._count.quotes + userData._count.invoices;

    if (totalData > 0) {
      throw new Error(`Cannot delete user with existing data (${totalData} items)`);
    }

    await this.prisma.user.delete({
      where: { id: userId }
    });

    return { message: 'User deleted successfully' };
  }

  async changeUserPassword(userId, newPassword) {
    if (!newPassword || newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword }
    });

    return { message: 'Password changed successfully' };
  }

  async getUserStats(userId) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        _count: {
          select: {
            clients: true,
            projects: true,
            quotes: true,
            invoices: true
          }
        },
        projects: {
          select: {
            status: true
          }
        },
        invoices: {
          select: {
            status: true,
            total: true
          }
        }
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    const projectStats = {
      total: user._count.projects,
      pending: user.projects.filter(p => p.status === 'pending').length,
      finished: user.projects.filter(p => p.status === 'finished').length,
      cancelled: user.projects.filter(p => p.status === 'cancelled').length
    };

    const invoiceStats = {
      total: user._count.invoices,
      draft: user.invoices.filter(i => i.status === 'draft').length,
      sent: user.invoices.filter(i => i.status === 'sent').length,
      paid: user.invoices.filter(i => i.status === 'paid').length,
      totalAmount: user.invoices.reduce((sum, i) => sum + parseFloat(i.total), 0)
    };

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: user.createdAt
      },
      stats: {
        clients: user._count.clients,
        projects: projectStats,
        quotes: user._count.quotes,
        invoices: invoiceStats
      }
    };
  }
}

module.exports = new AdminService(); 