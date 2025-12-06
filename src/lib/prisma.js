import { PrismaClient } from '@prisma/client';

let cachedPrisma = null;

export function getPrismaClient() {
  if (cachedPrisma) return cachedPrisma;
  if (!process.env.DATABASE_URL) return null;
  cachedPrisma = new PrismaClient();
  return cachedPrisma;
}
