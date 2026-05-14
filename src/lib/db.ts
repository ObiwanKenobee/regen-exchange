type PrismaClient = import("@prisma/client").PrismaClient;

import { getOptionalEnv, isTlsDatabaseUrl } from "./security/env";

let prisma: PrismaClient | null = null;
let initPrismaPromise: Promise<void> | null = null;

async function initPrisma(): Promise<void> {
  if (initPrismaPromise) {
    return initPrismaPromise;
  }

  initPrismaPromise = (async () => {
    const databaseUrl = getOptionalEnv("DATABASE_URL");

    if (!databaseUrl) {
      console.warn("DATABASE_URL is not configured. Prisma client will remain disabled.");
      prisma = null;
      return;
    }

    if (process.env.NODE_ENV === "production" && !isTlsDatabaseUrl(databaseUrl)) {
      console.warn(
        "Production DATABASE_URL should enforce TLS (sslmode=require or ssl=true)."
      );
    }

    try {
      const Prisma = await import("@prisma/client");
      prisma = new Prisma.PrismaClient({
        log: ["error", "warn"],
        datasources: {
          db: {
            url: databaseUrl,
          },
        },
      });
    } catch (error) {
      console.warn("Prisma client initialization failed:", error);
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
