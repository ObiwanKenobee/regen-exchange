import * as Prisma from "@prisma/client";

let prisma: Prisma.PrismaClient | null = null;

try {
  if (process.env.DATABASE_URL) {
    prisma = new Prisma.PrismaClient({
      log: ['error', 'warn'],
    });
  }
} catch (error) {
  console.warn('Prisma client initialization failed:', error);
  prisma = null;
}

export { prisma };
export default prisma;
