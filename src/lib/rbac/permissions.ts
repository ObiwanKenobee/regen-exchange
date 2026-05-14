/**
 * RBAC Permissions & Access Control Logic
 * 
 * Centralized permission checking for Atlas Sanctum operations.
 * Provides granular control over who can access what.
 */

import { RoleType, Permission, roleHasPermission, ROLE_PERMISSIONS } from "./roles";

export interface ABACPolicy {
  attribute: string;
  operator: "equals" | "in" | "contains" | "exists";
  value?: unknown;
}

export interface RBACContext {
  userId: string;
  role: RoleType;
  permissions: Permission[];
  tenantId?: string;
  attributes?: Record<string, unknown>;
}

/**
 * Create RBAC context from user role
 */
export function createRBACContext(
  userId: string,
  role: RoleType,
  attributes: Record<string, unknown> = {}
): RBACContext {
  return {
    userId,
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
    tenantId: attributes.tenantId as string | undefined,
    attributes,
  };
}

export function evaluateABAC(
  context: RBACContext,
  policies: ABACPolicy[] = []
): boolean {
  if (!policies || policies.length === 0) {
    return true;
  }

  for (const policy of policies) {
    const actual = context.attributes?.[policy.attribute];
    switch (policy.operator) {
      case "equals":
        if (actual !== policy.value) return false;
        break;
      case "in":
        if (!Array.isArray(policy.value)) return false;
        if (!policy.value.includes(actual)) return false;
        break;
      case "contains":
        if (Array.isArray(actual)) {
          if (!actual.includes(policy.value)) return false;
        } else if (typeof actual === "string" && typeof policy.value === "string") {
          if (!actual.includes(policy.value)) return false;
        } else {
          return false;
        }
        break;
      case "exists":
        if (actual === undefined || actual === null) return false;
        break;
      default:
        return false;
    }
  }

  return true;
}

export function requireABAC(
  context: RBACContext,
  policies: ABACPolicy[],
  action: string
): void {
  if (!evaluateABAC(context, policies)) {
    throw new Error(`Unauthorized by ABAC policy for action "${action}"`);
  }
}

/**
 * Check if user has single permission
 */
export function hasPermission(
  context: RBACContext,
  permission: Permission
): boolean {
  return context.permissions.includes(permission);
}

/**
 * Check if user has ANY of the required permissions
 */
export function hasAnyPermission(
  context: RBACContext,
  permissions: Permission[]
): boolean {
  return permissions.some((p) => context.permissions.includes(p));
}

/**
 * Check if user has ALL required permissions
 */
export function hasAllPermissions(
  context: RBACContext,
  permissions: Permission[]
): boolean {
  return permissions.every((p) => context.permissions.includes(p));
}

/**
 * Require permission or throw error
 */
export function requirePermission(
  context: RBACContext,
  permission: Permission,
  action: string
): void {
  if (!hasPermission(context, permission)) {
    throw new Error(
      `Unauthorized: User lacks "${permission}" permission for action "${action}"`
    );
  }
}

/**
 * Require any permission or throw error
 */
export function requireAnyPermission(
  context: RBACContext,
  permissions: Permission[],
  action: string
): void {
  if (!hasAnyPermission(context, permissions)) {
    throw new Error(
      `Unauthorized: User lacks required permissions for action "${action}"`
    );
  }
}

/**
 * Require all permissions or throw error
 */
export function requireAllPermissions(
  context: RBACContext,
  permissions: Permission[],
  action: string
): void {
  if (!hasAllPermissions(context, permissions)) {
    throw new Error(
      `Unauthorized: User lacks required permissions for action "${action}"`
    );
  }
}

/**
 * Filter resources based on user role
 * Useful for listing data with role-based visibility
 */
export function filterByRole<T extends { requiredRole?: RoleType }>(
  items: T[],
  userRole: RoleType
): T[] {
  return items.filter((item) => {
    if (!item.requiredRole) return true;
    // Simple role hierarchy check - in production, use more sophisticated logic
    const roleHierarchy: Record<RoleType, number> = {
      [RoleType.SUPER_ADMIN]: 9,
      [RoleType.GOVERNMENT_OFFICIAL]: 8,
      [RoleType.TREASURY_AUDITOR]: 7,
      [RoleType.ORACLE_VALIDATOR]: 6,
      [RoleType.CITY_OPERATOR]: 5,
      [RoleType.ECOLOGICAL_ANALYST]: 5,
      [RoleType.NGO_PARTNER]: 4,
      [RoleType.COMMUNITY_STEWARD]: 3,
      [RoleType.STUDENT_RESEARCHER]: 2,
    };
    return roleHierarchy[userRole] >= roleHierarchy[item.requiredRole];
  });
}

/**
 * Resource-level access control
 * Check if user can access specific resource based on ownership or role
 */
export interface ResourceAccessControl {
  resourceId: string;
  ownerUserId?: string;
  requiredRole?: RoleType;
  requiredPermission?: Permission;
}

export function canAccessResource(
  context: RBACContext,
  resource: ResourceAccessControl
): boolean {
  // Super admin can access everything
  if (context.role === RoleType.SUPER_ADMIN) return true;

  // Owner can always access their resources
  if (resource.ownerUserId === context.userId) return true;

  // Check role requirement
  if (resource.requiredRole) {
    if (!roleHasPermission(context.role, resource.requiredPermission || Permission.VIEW_AUDIT_LOG)) {
      return false;
    }
  }

  // Check permission requirement
  if (resource.requiredPermission) {
    if (!hasPermission(context, resource.requiredPermission)) {
      return false;
    }
  }

  return true;
}

/**
 * API endpoint protection
 * Used in server functions to enforce access control
 */
export interface ProtectedEndpointConfig {
  requiredPermissions?: Permission[];
  requiredRole?: RoleType;
  requireAll?: boolean; // If true, all permissions required. If false, any permission sufficient.
}

export function isEndpointAccessible(
  context: RBACContext,
  config: ProtectedEndpointConfig
): boolean {
  // Super admin bypass
  if (context.role === RoleType.SUPER_ADMIN) return true;

  // Check role requirement
  if (config.requiredRole && context.role !== config.requiredRole) {
    return false;
  }

  // Check permissions
  if (config.requiredPermissions && config.requiredPermissions.length > 0) {
    if (config.requireAll) {
      return hasAllPermissions(context, config.requiredPermissions);
    } else {
      return hasAnyPermission(context, config.requiredPermissions);
    }
  }

  return true;
}

/**
 * Audit log entry for compliance
 */
export interface AuditLogEntry {
  userId: string;
  userRole: RoleType;
  action: string;
  resourceType: string;
  resourceId?: string;
  timestamp: Date;
  result: "success" | "denied" | "error";
  details?: Record<string, unknown>;
}

/**
 * Create audit log entry
 */
export function createAuditLog(
  context: RBACContext,
  action: string,
  resourceType: string,
  resourceId?: string,
  result: "success" | "denied" | "error" = "success",
  details?: Record<string, unknown>
): AuditLogEntry {
  return {
    userId: context.userId,
    userRole: context.role,
    action,
    resourceType,
    resourceId,
    timestamp: new Date(),
    result,
    details,
  };
}

/**
 * Permission matrix for common operations
 * Quick reference for what role can do what operation
 */
export const OPERATION_PERMISSIONS = {
  // User operations
  "user.view": [Permission.VIEW_USER_PROFILE],
  "user.edit": [Permission.EDIT_USER_PROFILE],
  "user.manage": [Permission.MANAGE_USERS],

  // Ecological operations
  "ecology.view": [Permission.VIEW_ECOLOGICAL_DATA],
  "ecology.edit": [Permission.EDIT_ECOLOGICAL_DATA],
  "ecology.create_zone": [Permission.CREATE_RESTORATION_ZONE],
  "ecology.access_satellite": [Permission.ACCESS_SATELLITE_DATA],

  // Mission operations
  "mission.create": [Permission.CREATE_MISSION],
  "mission.view": [Permission.VIEW_MISSIONS],
  "mission.assign": [Permission.ASSIGN_MISSION],
  "mission.verify": [Permission.VERIFY_MISSION],
  "mission.complete": [Permission.COMPLETE_MISSION],

  // Marketplace operations
  "marketplace.view": [Permission.VIEW_MARKETPLACE],
  "marketplace.create_listing": [Permission.CREATE_LISTING],
  "marketplace.trade": [Permission.EXECUTE_TRADE],

  // Oracle operations
  "oracle.verify": [Permission.VERIFY_CLAIM],
  "oracle.score": [Permission.SCORE_CONFIDENCE],

  // Governance operations
  "governance.create_proposal": [Permission.CREATE_PROPOSAL],
  "governance.vote": [Permission.VOTE_PROPOSAL],
  "governance.delegate": [Permission.DELEGATE_VOTING_POWER],

  // Financial operations
  "financial.view": [Permission.VIEW_FINANCIAL_DATA],
  "financial.execute": [Permission.EXECUTE_TRANSACTION],
  "financial.mint_riu": [Permission.MINT_RIU],
  "financial.stake": [Permission.STAKE_RIU],

  // Audit operations
  "audit.view": [Permission.VIEW_AUDIT_LOG],
  "audit.report": [Permission.GENERATE_COMPLIANCE_REPORT],
};
