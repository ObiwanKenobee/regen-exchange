/**
 * Atlas Sanctum RBAC System
 * 
 * 9-role model with hierarchical permission system for civilization-scale
 * ecological coordination. Each role represents distinct operational capacity.
 */

export enum RoleType {
  SUPER_ADMIN = "super_admin",
  CITY_OPERATOR = "city_operator",
  ECOLOGICAL_ANALYST = "ecological_analyst",
  STUDENT_RESEARCHER = "student_researcher",
  NGO_PARTNER = "ngo_partner",
  GOVERNMENT_OFFICIAL = "government_official",
  ORACLE_VALIDATOR = "oracle_validator",
  TREASURY_AUDITOR = "treasury_auditor",
  COMMUNITY_STEWARD = "community_steward",
}

export enum Permission {
  // User Management
  MANAGE_USERS = "manage_users",
  VIEW_USER_PROFILE = "view_user_profile",
  EDIT_USER_PROFILE = "edit_user_profile",

  // System Configuration
  SYSTEM_CONFIG = "system_config",
  MANAGE_ROLES = "manage_roles",
  EMERGENCY_OVERRIDE = "emergency_override",

  // Ecological Data
  VIEW_ECOLOGICAL_DATA = "view_ecological_data",
  EDIT_ECOLOGICAL_DATA = "edit_ecological_data",
  CREATE_RESTORATION_ZONE = "create_restoration_zone",
  ACCESS_SATELLITE_DATA = "access_satellite_data",

  // Sensor & IoT
  VIEW_SENSOR_DATA = "view_sensor_data",
  MANAGE_SENSORS = "manage_sensors",
  INGEST_SENSOR_DATA = "ingest_sensor_data",

  // Missions
  CREATE_MISSION = "create_mission",
  VIEW_MISSIONS = "view_missions",
  ASSIGN_MISSION = "assign_mission",
  VERIFY_MISSION = "verify_mission",
  COMPLETE_MISSION = "complete_mission",

  // Marketplace
  VIEW_MARKETPLACE = "view_marketplace",
  CREATE_LISTING = "create_listing",
  EXECUTE_TRADE = "execute_trade",
  MANAGE_ORDERS = "manage_orders",

  // Oracle Operations
  CREATE_ORACLE_TASK = "create_oracle_task",
  VERIFY_CLAIM = "verify_claim",
  SCORE_CONFIDENCE = "score_confidence",
  RESOLVE_DISPUTES = "resolve_disputes",

  // Governance
  VIEW_GOVERNANCE = "view_governance",
  CREATE_PROPOSAL = "create_proposal",
  VOTE_PROPOSAL = "vote_proposal",
  DELEGATE_VOTING_POWER = "delegate_voting_power",
  EXECUTE_PROPOSAL = "execute_proposal",

  // Financial
  VIEW_FINANCIAL_DATA = "view_financial_data",
  EXECUTE_TRANSACTION = "execute_transaction",
  MANAGE_TREASURY = "manage_treasury",
  APPROVE_TRANSFER = "approve_transfer",
  MINT_RIU = "mint_riu",
  STAKE_RIU = "stake_riu",

  // Audit & Compliance
  VIEW_AUDIT_LOG = "view_audit_log",
  GENERATE_COMPLIANCE_REPORT = "generate_compliance_report",

  // Research
  VIEW_RESEARCH_DATA = "view_research_data",
  CONTRIBUTE_RESEARCH = "contribute_research",
  CREATE_DATASET = "create_dataset",

  // Analytics & Reports
  VIEW_ANALYTICS = "view_analytics",
  CREATE_REPORT = "create_report",
  ACCESS_INTELLIGENCE_DATA = "access_intelligence_data",

  // Community
  CREATE_COMMUNITY_INITIATIVE = "create_community_initiative",
  MANAGE_COMMUNITY_EVENTS = "manage_community_events",
  MODERATE_CONTENT = "moderate_content",
}

/**
 * Role-to-Permission mapping
 * Defines what each role can do within the system
 */
export const ROLE_PERMISSIONS: Record<RoleType, Permission[]> = {
  [RoleType.SUPER_ADMIN]: [
    // All permissions
    Permission.MANAGE_USERS,
    Permission.VIEW_USER_PROFILE,
    Permission.EDIT_USER_PROFILE,
    Permission.SYSTEM_CONFIG,
    Permission.MANAGE_ROLES,
    Permission.EMERGENCY_OVERRIDE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.EDIT_ECOLOGICAL_DATA,
    Permission.CREATE_RESTORATION_ZONE,
    Permission.ACCESS_SATELLITE_DATA,
    Permission.VIEW_SENSOR_DATA,
    Permission.MANAGE_SENSORS,
    Permission.INGEST_SENSOR_DATA,
    Permission.CREATE_MISSION,
    Permission.VIEW_MISSIONS,
    Permission.ASSIGN_MISSION,
    Permission.VERIFY_MISSION,
    Permission.COMPLETE_MISSION,
    Permission.VIEW_MARKETPLACE,
    Permission.CREATE_LISTING,
    Permission.EXECUTE_TRADE,
    Permission.MANAGE_ORDERS,
    Permission.CREATE_ORACLE_TASK,
    Permission.VERIFY_CLAIM,
    Permission.SCORE_CONFIDENCE,
    Permission.RESOLVE_DISPUTES,
    Permission.VIEW_GOVERNANCE,
    Permission.CREATE_PROPOSAL,
    Permission.VOTE_PROPOSAL,
    Permission.DELEGATE_VOTING_POWER,
    Permission.EXECUTE_PROPOSAL,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.EXECUTE_TRANSACTION,
    Permission.MANAGE_TREASURY,
    Permission.APPROVE_TRANSFER,
    Permission.MINT_RIU,
    Permission.STAKE_RIU,
    Permission.VIEW_AUDIT_LOG,
    Permission.GENERATE_COMPLIANCE_REPORT,
    Permission.VIEW_RESEARCH_DATA,
    Permission.CONTRIBUTE_RESEARCH,
    Permission.CREATE_DATASET,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_REPORT,
    Permission.ACCESS_INTELLIGENCE_DATA,
    Permission.CREATE_COMMUNITY_INITIATIVE,
    Permission.MANAGE_COMMUNITY_EVENTS,
    Permission.MODERATE_CONTENT,
  ],

  [RoleType.CITY_OPERATOR]: [
    Permission.VIEW_USER_PROFILE,
    Permission.EDIT_USER_PROFILE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.EDIT_ECOLOGICAL_DATA,
    Permission.CREATE_RESTORATION_ZONE,
    Permission.VIEW_SENSOR_DATA,
    Permission.CREATE_MISSION,
    Permission.VIEW_MISSIONS,
    Permission.ASSIGN_MISSION,
    Permission.VERIFY_MISSION,
    Permission.COMPLETE_MISSION,
    Permission.VIEW_MARKETPLACE,
    Permission.EXECUTE_TRADE,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_PROPOSAL,
    Permission.DELEGATE_VOTING_POWER,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_AUDIT_LOG,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_REPORT,
    Permission.ACCESS_INTELLIGENCE_DATA,
    Permission.CREATE_COMMUNITY_INITIATIVE,
    Permission.MANAGE_COMMUNITY_EVENTS,
  ],

  [RoleType.ECOLOGICAL_ANALYST]: [
    Permission.VIEW_USER_PROFILE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.EDIT_ECOLOGICAL_DATA,
    Permission.CREATE_RESTORATION_ZONE,
    Permission.ACCESS_SATELLITE_DATA,
    Permission.VIEW_SENSOR_DATA,
    Permission.CREATE_MISSION,
    Permission.VIEW_MISSIONS,
    Permission.VERIFY_MISSION,
    Permission.VIEW_MARKETPLACE,
    Permission.VIEW_GOVERNANCE,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.VIEW_RESEARCH_DATA,
    Permission.CONTRIBUTE_RESEARCH,
    Permission.CREATE_DATASET,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_REPORT,
    Permission.ACCESS_INTELLIGENCE_DATA,
  ],

  [RoleType.STUDENT_RESEARCHER]: [
    Permission.VIEW_USER_PROFILE,
    Permission.EDIT_USER_PROFILE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.VIEW_SENSOR_DATA,
    Permission.VIEW_MISSIONS,
    Permission.COMPLETE_MISSION,
    Permission.VIEW_MARKETPLACE,
    Permission.EXECUTE_TRADE,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_PROPOSAL,
    Permission.VIEW_RESEARCH_DATA,
    Permission.CONTRIBUTE_RESEARCH,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_COMMUNITY_INITIATIVE,
  ],

  [RoleType.NGO_PARTNER]: [
    Permission.VIEW_USER_PROFILE,
    Permission.EDIT_USER_PROFILE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.EDIT_ECOLOGICAL_DATA,
    Permission.CREATE_RESTORATION_ZONE,
    Permission.VIEW_SENSOR_DATA,
    Permission.MANAGE_SENSORS,
    Permission.CREATE_MISSION,
    Permission.VIEW_MISSIONS,
    Permission.ASSIGN_MISSION,
    Permission.VERIFY_MISSION,
    Permission.COMPLETE_MISSION,
    Permission.VIEW_MARKETPLACE,
    Permission.CREATE_LISTING,
    Permission.EXECUTE_TRADE,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_GOVERNANCE,
    Permission.CREATE_PROPOSAL,
    Permission.VOTE_PROPOSAL,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.EXECUTE_TRANSACTION,
    Permission.STAKE_RIU,
    Permission.VIEW_RESEARCH_DATA,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_REPORT,
    Permission.CREATE_COMMUNITY_INITIATIVE,
    Permission.MANAGE_COMMUNITY_EVENTS,
  ],

  [RoleType.GOVERNMENT_OFFICIAL]: [
    Permission.VIEW_USER_PROFILE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.VIEW_SENSOR_DATA,
    Permission.VIEW_MISSIONS,
    Permission.VIEW_MARKETPLACE,
    Permission.VIEW_GOVERNANCE,
    Permission.CREATE_PROPOSAL,
    Permission.VOTE_PROPOSAL,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.APPROVE_TRANSFER,
    Permission.VIEW_AUDIT_LOG,
    Permission.GENERATE_COMPLIANCE_REPORT,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_REPORT,
    Permission.ACCESS_INTELLIGENCE_DATA,
  ],

  [RoleType.ORACLE_VALIDATOR]: [
    Permission.VIEW_USER_PROFILE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.ACCESS_SATELLITE_DATA,
    Permission.VIEW_SENSOR_DATA,
    Permission.VIEW_MISSIONS,
    Permission.CREATE_ORACLE_TASK,
    Permission.VERIFY_CLAIM,
    Permission.SCORE_CONFIDENCE,
    Permission.RESOLVE_DISPUTES,
    Permission.MINT_RIU,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_PROPOSAL,
    Permission.VIEW_RESEARCH_DATA,
    Permission.VIEW_ANALYTICS,
  ],

  [RoleType.TREASURY_AUDITOR]: [
    Permission.VIEW_USER_PROFILE,
    Permission.VIEW_MISSIONS,
    Permission.VIEW_MARKETPLACE,
    Permission.MANAGE_ORDERS,
    Permission.VIEW_GOVERNANCE,
    Permission.VIEW_FINANCIAL_DATA,
    Permission.MANAGE_TREASURY,
    Permission.APPROVE_TRANSFER,
    Permission.VIEW_AUDIT_LOG,
    Permission.GENERATE_COMPLIANCE_REPORT,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_REPORT,
  ],

  [RoleType.COMMUNITY_STEWARD]: [
    Permission.VIEW_USER_PROFILE,
    Permission.EDIT_USER_PROFILE,
    Permission.VIEW_ECOLOGICAL_DATA,
    Permission.VIEW_SENSOR_DATA,
    Permission.VIEW_MISSIONS,
    Permission.COMPLETE_MISSION,
    Permission.VIEW_MARKETPLACE,
    Permission.EXECUTE_TRADE,
    Permission.VIEW_GOVERNANCE,
    Permission.VOTE_PROPOSAL,
    Permission.DELEGATE_VOTING_POWER,
    Permission.VIEW_RESEARCH_DATA,
    Permission.VIEW_ANALYTICS,
    Permission.CREATE_COMMUNITY_INITIATIVE,
    Permission.MANAGE_COMMUNITY_EVENTS,
    Permission.MODERATE_CONTENT,
  ],
};

export interface RoleInfo {
  type: RoleType;
  title: string;
  description: string;
  tier: "admin" | "operator" | "contributor" | "participant";
  permissions: Permission[];
}

export const ROLE_DEFINITIONS: Record<RoleType, RoleInfo> = {
  [RoleType.SUPER_ADMIN]: {
    type: RoleType.SUPER_ADMIN,
    title: "Super Administrator",
    description:
      "System-level governance, user management, emergency overrides, configuration",
    tier: "admin",
    permissions: ROLE_PERMISSIONS[RoleType.SUPER_ADMIN],
  },
  [RoleType.CITY_OPERATOR]: {
    type: RoleType.CITY_OPERATOR,
    title: "City Operator",
    description:
      "Local restoration project coordination, mission management, resource allocation, city-level reporting",
    tier: "operator",
    permissions: ROLE_PERMISSIONS[RoleType.CITY_OPERATOR],
  },
  [RoleType.ECOLOGICAL_ANALYST]: {
    type: RoleType.ECOLOGICAL_ANALYST,
    title: "Ecological Analyst",
    description:
      "Data analysis, intelligence reports, restoration zone design, ecosystem modeling, satellite interpretation",
    tier: "operator",
    permissions: ROLE_PERMISSIONS[RoleType.ECOLOGICAL_ANALYST],
  },
  [RoleType.STUDENT_RESEARCHER]: {
    type: RoleType.STUDENT_RESEARCHER,
    title: "Student Researcher",
    description:
      "Learning-focused role, mission participation, research contribution, limited marketplace access",
    tier: "participant",
    permissions: ROLE_PERMISSIONS[RoleType.STUDENT_RESEARCHER],
  },
  [RoleType.NGO_PARTNER]: {
    type: RoleType.NGO_PARTNER,
    title: "NGO Partner",
    description:
      "Mission creation, team management, impact tracking, marketplace participation, governance involvement",
    tier: "operator",
    permissions: ROLE_PERMISSIONS[RoleType.NGO_PARTNER],
  },
  [RoleType.GOVERNMENT_OFFICIAL]: {
    type: RoleType.GOVERNMENT_OFFICIAL,
    title: "Government Official",
    description:
      "Policy oversight, regulatory compliance, governance voting, budget approval, compliance reporting",
    tier: "operator",
    permissions: ROLE_PERMISSIONS[RoleType.GOVERNMENT_OFFICIAL],
  },
  [RoleType.ORACLE_VALIDATOR]: {
    type: RoleType.ORACLE_VALIDATOR,
    title: "Oracle Validator",
    description:
      "Verification of restoration claims, image/sensor validation, confidence scoring, dispute resolution",
    tier: "contributor",
    permissions: ROLE_PERMISSIONS[RoleType.ORACLE_VALIDATOR],
  },
  [RoleType.TREASURY_AUDITOR]: {
    type: RoleType.TREASURY_AUDITOR,
    title: "Treasury Auditor",
    description:
      "Financial oversight, transaction auditing, compliance verification, treasury analytics",
    tier: "operator",
    permissions: ROLE_PERMISSIONS[RoleType.TREASURY_AUDITOR],
  },
  [RoleType.COMMUNITY_STEWARD]: {
    type: RoleType.COMMUNITY_STEWARD,
    title: "Community Steward",
    description:
      "Local initiative creation, event coordination, community moderation, grassroots impact tracking",
    tier: "contributor",
    permissions: ROLE_PERMISSIONS[RoleType.COMMUNITY_STEWARD],
  },
};

/**
 * Helper to get all permissions for a role
 */
export function getPermissionsForRole(role: RoleType): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/**
 * Helper to check if role has permission
 */
export function roleHasPermission(
  role: RoleType,
  permission: Permission
): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Get role tier (for UI hierarchical visualization)
 */
export function getRoleTier(role: RoleType): "admin" | "operator" | "contributor" | "participant" {
  return ROLE_DEFINITIONS[role]?.tier ?? "participant";
}
