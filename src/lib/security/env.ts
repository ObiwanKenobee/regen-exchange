export function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function getOptionalEnv(key: string): string | undefined {
  return process.env[key];
}

export function isTlsDatabaseUrl(url: string): boolean {
  return /sslmode=(require|verify-full|verify-ca)|ssl=true|sslmode=verify-full/i.test(url);
}

export function ensureProductionEnv(): void {
  if (process.env.NODE_ENV === "production") {
    getRequiredEnv("DATABASE_URL");
    getRequiredEnv("JWT_SECRET");
  }
}
