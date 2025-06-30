const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function promoteToAdmin(email) {
  try {
    const user = await prisma.user.update({
      where: { email },
      data: { role: 'admin' }
    });
    
    console.log(`✅ User ${user.email} promoted to admin successfully!`);
    console.log(`User ID: ${user.id}`);
    console.log(`Role: ${user.role}`);
  } catch (error) {
    console.error('❌ Error promoting user to admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

// Get email from command line argument
const email = process.argv[2];

if (!email) {
  console.error('❌ Please provide an email address');
  console.log('Usage: node promote-admin.js <email>');
  process.exit(1);
}

promoteToAdmin(email); 