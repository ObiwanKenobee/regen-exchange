import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { getRequiredEnv, getOptionalEnv } from "./security/env";

export type JwtKeyset = Record<string, string>;

export function parseJwtKeyset(): JwtKeyset {
  const raw = getOptionalEnv("JWT_KEYSET");
  if (!raw) {
    return {
      current: getRequiredEnv("JWT_SECRET"),
    };
  }

  try {
    const parsed = JSON.parse(raw) as JwtKeyset;
    if (!parsed || typeof parsed !== "object") {
      throw new Error("Invalid JWT_KEYSET format");
    }
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse JWT_KEYSET: ${String(error)}`);
  }
}

export function getSigningKey(kid?: string): string {
  const keyset = parseJwtKeyset();
  const effectiveKid = kid || getOptionalEnv("JWT_KID") || "current";
  const signingKey = keyset[effectiveKid];
  if (!signingKey) {
    throw new Error(`JWT signing key not configured for kid=${effectiveKid}`);
  }
  return signingKey;
}

export function signJwt(payload: string | object | Buffer, options?: SignOptions & { kid?: string }) {
  const kid = options?.kid || getOptionalEnv("JWT_KID") || "current";
  const secret = getSigningKey(kid);
  return jwt.sign(payload, secret, {
    ...options,
    header: {
      ...(options?.header ?? {}),
      kid,
    },
  });
}

export function verifyJwt<T extends JwtPayload = JwtPayload>(token: string): T {
  const decoded = jwt.decode(token, { complete: true }) as { header?: { kid?: string } } | null;
  const kid = decoded?.header?.kid || getOptionalEnv("JWT_KID") || "current";
  const secret = getSigningKey(kid);
  return jwt.verify(token, secret) as T;
}
