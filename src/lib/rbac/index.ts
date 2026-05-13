/**
 * RBAC Module Exports
 * 
 * Centralized access to all role-based access control functionality
 */

// Roles & Permissions
export { RoleType, Permission, ROLE_PERMISSIONS, ROLE_DEFINITIONS, roleHasPermission, getPermissionsForRole, getRoleTier } from "./roles";

// Permission Checking
export {
  createRBACContext,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  requirePermission,
  requireAnyPermission,
  requireAllPermissions,
  filterByRole,
  canAccessResource,
  isEndpointAccessible,
  createAuditLog,
  OPERATION_PERMISSIONS,
  type RBACContext,
  type ResourceAccessControl,
  type ProtectedEndpointConfig,
  type AuditLogEntry,
} from "./permissions";

// Middleware & Protection
export {
  extractRBACContext,
  protectEndpoint,
  rbacContextMiddleware,
  RBACContextSchema,
  requireRBAC,
  withRBACProtection,
  PROTECTED_ENDPOINTS,
  logAuditEvent,
  type ProtectedAPIEndpoint,
} from "./middleware";
