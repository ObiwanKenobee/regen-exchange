/**
 * RBAC Middleware & API Endpoint Protection
 * 
 * Server-side middleware for TanStack Start functions to enforce
 * role-based access control on all API operations.
 */

import { createMiddleware } from "@tanstack/react-start";
import { z } from "zod";
import db from "@/lib/db";
import { authMiddleware } from "@/lib/auth.middleware";
import { RoleType, Permission } from "./roles";
import { verifyJwt } from "../key-rotation";
import {
  RBACContext,
  createRBACContext,
  hasAnyPermission,
  hasAllPermissions,
  isEndpointAccessible,
  createAuditLog,
  ProtectedEndpointConfig,
  AuditLogEntry,
  requirePermission,
} from "./permissions";

/**
 * Extract RBAC context from request headers.
 * Supports JWT authentication and Prisma-backed user role resolution.
 */
export async function extractRBACContext(headers: Headers): Promise<RBACContext> {
  const authHeader = headers.get("authorization") || headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing authorization header");
  }

  const token = authHeader.substring(7);
  const decoded = verifyJwt<{ userId?: string; role?: RoleType }>(token);

  const userId = decoded?.userId;
  if (!userId) {
    throw new Error("Invalid authentication token");
  }

  const dbUser = db ? await db.user.findUnique({ where: { id: userId } }) : null;
  const role =
    (dbUser?.role as RoleType | undefined) ?? decoded.role ?? RoleType.STUDENT_RESEARCHER;

  return createRBACContext(userId, role);
}

export const rbacContextMiddleware = createMiddleware()
  .middleware([authMiddleware])
  .server(async ({ next, context }) => {
    const authUser = (context as any)?.user;
    if (!authUser || (context as any)?.isAuthenticated !== true) {
      return next({ context });
    }

    const role = authUser.role as RoleType | undefined;
    if (!authUser.id || !role) {
      return next({ context });
    }

    return next({
      context: {
        ...context,
        rbac: createRBACContext(authUser.id, role, {
          tenantId: authUser.tenantId,
          role: authUser.role,
        }),
      },
    });
  });

/**
 * Protect a server function with RBAC
 * Usage: await protectEndpoint(context, { requiredPermissions: [Permission.CREATE_MISSION] })
 */
export async function protectEndpoint(
  context: RBACContext,
  config: ProtectedEndpointConfig,
  action?: string
): Promise<void> {
  const authorized = isEndpointAccessible(context, config);
  const auditLog = createAuditLog(
    context,
    action || "protected_endpoint",
    "api_endpoint",
    undefined,
    authorized ? "success" : "denied"
  );

  await logAuditEvent(auditLog);

  if (!authorized) {
    throw new Error(`Access denied: insufficient permissions`);
  }
}

/**
 * Schema for validating RBAC context in server functions
 */
export const RBACContextSchema = z.object({
  userId: z.string(),
  role: z.enum([
    "super_admin",
    "city_operator",
    "ecological_analyst",
    "student_researcher",
    "ngo_partner",
    "government_official",
    "oracle_validator",
    "treasury_auditor",
    "community_steward",
  ] as const),
  permissions: z.array(z.string()),
});

/**
 * Middleware wrapper for server functions
 * 
 * Usage in server functions:
 * ```
 * export const createMission = createServerFn({ method: "POST" })
 *   .middleware([requireRBAC([Permission.CREATE_MISSION])])
 *   .handler(async (args) => { ... })
 * ```
 */
export function requireRBAC(requiredPermissions: Permission[], requireAll: boolean = true) {
  return createMiddleware()
    .middleware([rbacContextMiddleware])
    .server(async ({ next, context }) => {
      const rbacContext = (context as any)?.rbac as RBACContext | undefined;
      if (!rbacContext) {
        throw new Error("RBAC context not found in request");
      }

      const authorized = requireAll
        ? hasAllPermissions(rbacContext, requiredPermissions)
        : hasAnyPermission(rbacContext, requiredPermissions);

      const auditLog = createAuditLog(
        rbacContext,
        "requireRBAC",
        "api_endpoint",
        undefined,
        authorized ? "success" : "denied",
        { requiredPermissions, requireAll }
      );
      await logAuditEvent(auditLog);

      if (!authorized) {
        throw new Error(`Access denied: insufficient permissions`);
      }

      return await next({ context });
    });
}

/**
 * Higher-order function to wrap server function handlers with RBAC protection
 */
export function withRBACProtection<T extends Record<string, any>>(
  handler: (data: T, context: RBACContext) => Promise<any>,
  requiredPermissions: Permission[]
) {
  return async (data: T, context: RBACContext) => {
    // Check permissions
    for (const permission of requiredPermissions) {
      requirePermission(context, permission, handler.name);
    }

    // Log audit entry
    const auditLog = createAuditLog(context, handler.name, "server_function");

    try {
      const result = await handler(data, context);
      auditLog.result = "success";
      // TODO: Store audit log
      return result;
    } catch (error) {
      auditLog.result = "error";
      auditLog.details = { error: String(error) };
      // TODO: Store audit log
      throw error;
    }
  };
}

/**
 * API Decorator Pattern (for reference)
 * 
 * In a more sophisticated setup, you could use decorators:
 * 
 * @Protected([Permission.CREATE_MISSION])
 * export const createMission = createServerFn(...)
 */
export interface ProtectedAPIEndpoint {
  name: string;
  requiredPermissions: Permission[];
  requiredRole?: RoleType;
}

/**
 * Registry of protected endpoints (for documentation & validation)
 */
export const PROTECTED_ENDPOINTS: Record<string, ProtectedAPIEndpoint> = {
  // Steward operations
  "steward.create": {
    name: "createSteward",
    requiredPermissions: [Permission.MANAGE_USERS],
  },
  "steward.update": {
    name: "updateSteward",
    requiredPermissions: [Permission.EDIT_USER_PROFILE],
  },

  // Mission operations
  "mission.create": {
    name: "createMission",
    requiredPermissions: [Permission.CREATE_MISSION],
  },
  "mission.assign": {
    name: "assignMission",
    requiredPermissions: [Permission.ASSIGN_MISSION],
  },
  "mission.complete": {
    name: "completeMission",
    requiredPermissions: [Permission.COMPLETE_MISSION],
  },

  // Asset operations
  "asset.create": {
    name: "createAsset",
    requiredPermissions: [Permission.EDIT_ECOLOGICAL_DATA],
  },
  "asset.transfer": {
    name: "transferAssetOwnership",
    requiredPermissions: [Permission.EXECUTE_TRADE],
  },

  // Marketplace operations
  "marketplace.create_listing": {
    name: "createListing",
    requiredPermissions: [Permission.CREATE_LISTING],
  },
  "marketplace.place_bid": {
    name: "placeBid",
    requiredPermissions: [Permission.EXECUTE_TRADE],
  },

  // Oracle operations
  "oracle.verify": {
    name: "submitVerification",
    requiredPermissions: [Permission.VERIFY_CLAIM],
  },
  "oracle.score": {
    name: "scoreConfidence",
    requiredPermissions: [Permission.SCORE_CONFIDENCE],
  },

  // Governance operations
  "governance.create_proposal": {
    name: "createProposal",
    requiredPermissions: [Permission.CREATE_PROPOSAL],
  },
  "governance.vote": {
    name: "voteOnProposal",
    requiredPermissions: [Permission.VOTE_PROPOSAL],
  },

  // Financial operations
  "financial.mint": {
    name: "mintRIU",
    requiredPermissions: [Permission.MINT_RIU],
  },
  "financial.stake": {
    name: "stakeRIU",
    requiredPermissions: [Permission.STAKE_RIU],
  },

  // Audit operations
  "audit.view": {
    name: "viewAuditLog",
    requiredPermissions: [Permission.VIEW_AUDIT_LOG],
  },
  "audit.report": {
    name: "generateComplianceReport",
    requiredPermissions: [Permission.GENERATE_COMPLIANCE_REPORT],
  },
};

/**
 * Create audit log in database
 * TODO: Implement actual database persistence
 */
export async function logAuditEvent(
  auditLog: AuditLogEntry
): Promise<void> {
  if (!db) {
    console.log("[AUDIT]", auditLog);
    return;
  }

  await db.auditLog.create({
    data: {
      userId: auditLog.userId,
      userRole: auditLog.userRole,
      action: auditLog.action,
      resourceType: auditLog.resourceType,
      resourceId: auditLog.resourceId,
      result: auditLog.result,
      details: auditLog.details,
      ipAddress: auditLog.details?.ipAddress as string | undefined,
      userAgent: auditLog.details?.userAgent as string | undefined,
      timestamp: auditLog.timestamp,
    },
  });
}
