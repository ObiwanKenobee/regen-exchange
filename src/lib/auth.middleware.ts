import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import db from "@/lib/db";
import { RoleType } from "./rbac/roles";
import { verifyJwt } from "./key-rotation";

export interface AuthUser {
  id: string;
  did: string;
  tenantId?: string;
  name?: string;
  email?: string;
  walletAddress?: string;
  mpesaNumber?: string;
  ridScore: number;
  reputationHistory: any[];
  role: RoleType;
}

export interface AuthContext {
  user: AuthUser | null;
  isAuthenticated: boolean;
}

// Simple authentication middleware for server functions
export const authMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next({
      context: {
        user: null,
        isAuthenticated: false,
      } as AuthContext,
    });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyJwt(token) as {
      userId: string;
      did: string;
      tenantId?: string;
      email?: string;
      walletAddress?: string;
      mpesaNumber?: string;
      ridScore?: number;
      role?: RoleType;
      iat?: number;
      exp?: number;
    };

    const userId = decoded.userId;
    if (!userId) {
      throw new Error("Invalid authentication token");
    }

    let user: AuthUser = {
      id: userId,
      did: decoded.did || `did:rve:${userId}`,
      tenantId: decoded.tenantId,
      name: undefined,
      email: decoded.email,
      walletAddress: decoded.walletAddress,
      mpesaNumber: decoded.mpesaNumber,
      ridScore: decoded.ridScore ?? 0,
      reputationHistory: [],
      role: decoded.role ?? RoleType.STUDENT_RESEARCHER,
    };

    if (db) {
      const dbUser = await db.user.findUnique({ where: { id: userId } });
      if (dbUser) {
        user = {
          id: dbUser.id,
          did: dbUser.did ?? user.did,
          tenantId: (dbUser as any).tenantId ?? user.tenantId,
          name: dbUser.name ?? undefined,
          email: dbUser.email ?? undefined,
          walletAddress: dbUser.walletAddress ?? undefined,
          mpesaNumber: dbUser.mpesaNumber ?? undefined,
          ridScore: dbUser.ridScore,
          reputationHistory: (dbUser.reputationHistory as any[]) ?? [],
          role: (dbUser.role as RoleType) ?? user.role,
        };
      }
    }

    return next({
      context: {
        user,
        isAuthenticated: true,
      } as AuthContext,
    });
  } catch (error) {
    return next({
      context: {
        user: null,
        isAuthenticated: false,
      } as AuthContext,
    });
  }
});

// Helper function to get current user from context
export function getCurrentUser() {
  const request = getRequest();
  const authHeader = request.headers.get("authorization") || request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const decoded = verifyJwt(token) as {
      userId: string;
      did: string;
      tenantId?: string;
      email?: string;
      walletAddress?: string;
      mpesaNumber?: string;
      ridScore?: number;
      role?: RoleType;
    };

    return {
      id: decoded.userId,
      did: decoded.did || `did:rve:${decoded.userId}`,
      tenantId: decoded.tenantId,
      email: decoded.email,
      walletAddress: decoded.walletAddress,
      mpesaNumber: decoded.mpesaNumber,
      ridScore: decoded.ridScore ?? 0,
      reputationHistory: [],
      role: decoded.role ?? RoleType.STUDENT_RESEARCHER,
    } as AuthUser;
  } catch {
    return null;
  }
}

// Helper function to require authentication in server functions
export function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

export const requireAuthMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (!context.isAuthenticated || !context.user) {
      throw new Error("Authentication required");
    }
    return await next({ context });
  });

export const requireRIDScoreMiddleware = (minScore: number) =>
  createMiddleware()
    .middleware([requireAuthMiddleware])
    .server(async ({ next, context }) => {
      if (context.user!.ridScore < minScore) {
        throw new Error(`Minimum RID score of ${minScore} required`);
      }
      return await next({ context });
    });