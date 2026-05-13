type PrismaClient = import("@prisma/client").PrismaClient;

let prisma: PrismaClient | null = null;
let initPrismaPromise: Promise<void> | null = null;

async function initPrisma(): Promise<void> {
  if (initPrismaPromise) {
    return initPrismaPromise;
  }

  initPrismaPromise = (async () => {
    if (!process.env.DATABASE_URL) {
      return;
    }

    try {
      const Prisma = await import("@prisma/client");
      prisma = new Prisma.PrismaClient({
        log: ['error', 'warn'],
      });
    } catch (error) {
      console.warn('Prisma client initialization failed:', error);
      prisma = null;
    }
  })();

  return initPrismaPromise;
}

void initPrisma();

export async function getPrisma(): Promise<PrismaClient | null> {
  await initPrisma();
  return prisma;
}

export { prisma };
export default prisma;
