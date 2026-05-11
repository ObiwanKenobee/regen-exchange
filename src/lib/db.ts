import { PrismaClient } from "@prisma/client";

let prisma: PrismaClient | null = null;

if (process.env.DATABASE_URL) {
  prisma = new PrismaClient();
}

export { prisma };
export default prisma;
