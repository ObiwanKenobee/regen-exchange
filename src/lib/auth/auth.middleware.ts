import { createMiddleware } from "@tanstack/react-start";
import jwt from "jsonwebtoken";
import db from "@/lib/db";
import { RoleType } from "@/lib/rbac/roles";

interface JWTPayload {
  userId: string;
  did: string;
  ridScore: number;
  iat: number;
  exp: number;
}

export interface AuthContext {
  user: {
    id: string;
    did: string;
    ridScore: number;
    role: RoleType;
    reputationHistory: any[];
    mpesaNumber?: string;
    walletAddress?: string;
    email?: string;
  } | null;
  isAuthenticated: boolean;
}

/**
 * Authentication middleware for protecting server functions
 */
export const authMiddleware = createMiddleware()
  .server(async ({ next, request }) => {
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return await next({
        context: {
          user: null,
          isAuthenticated: false,
        } as AuthContext,
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as JWTPayload;

      let user: any = {
        id: decoded.userId,
        did: decoded.did,
        ridScore: decoded.ridScore,
        role: RoleType.STUDENT_RESEARCHER,
        reputationHistory: [] as any[],
        mpesaNumber: "+254712345678",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
        email: "user@example.com",
      };

      if (db) {
        const dbUser = await db.user.findUnique({
          where: { id: decoded.userId },
          include: { portfolio: true },
        });

        if (dbUser) {
          user = {
            id: dbUser.id,
            did: dbUser.did ?? decoded.did,
            ridScore: dbUser.ridScore,
            reputationHistory: (dbUser.reputationHistory as any[]) ?? [],
            mpesaNumber: dbUser.mpesaNumber ?? undefined,
            walletAddress: dbUser.walletAddress ?? undefined,
            email: dbUser.email ?? undefined,
          };
        }
      }

      return await next({
        context: {
          user,
          isAuthenticated: true,
        } as AuthContext,
      });
    } catch (error) {
      return await next({
        context: {
          user: null,
          isAuthenticated: false,
        } as AuthContext,
      });
    }
  });

/**
 * Require authentication middleware - throws error if not authenticated
 */
export const requireAuthMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    if (!context.isAuthenticated || !context.user) {
      throw new Error("Authentication required");
    }

    return await next({ context });
  });

/**
 * Check if user has minimum RID score
 */
export const requireRIDScoreMiddleware = (minScore: number) =>
  createMiddleware()
    .middleware([requireAuthMiddleware])
    .server(async ({ next, context }) => {
      if (context.user!.ridScore < minScore) {
        throw new Error(`Minimum RID score of ${minScore} required`);
      }

      return await next({ context });
    });