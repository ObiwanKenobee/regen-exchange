import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    prisma = new PrismaClient({
      log: ['error', 'warn'],
    });
  }
} catch (error) {
  console.warn('Prisma client initialization failed:', error);
  prisma = null;
}

export { prisma };
export default prisma;
