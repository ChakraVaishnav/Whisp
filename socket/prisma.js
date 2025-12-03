// Prisma client configuration for socket server
// Uses the Prisma Client from the parent directory
const { PrismaClient } = require('../node_modules/@prisma/client');

const prisma = new PrismaClient({
  log: ['error', 'warn'],
});

module.exports = prisma;
