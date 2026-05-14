# Security Design and Threat Modeling

## Threat Model

Atlas Sanctum must protect the marketplace, identity, governance, and financial flows from abuse, data leakage, and unauthorized access.

Key threat categories:
- Account compromise and session theft
- Unauthorized access by low-privilege users
- API abuse, brute-force, and rate-limited attacks
- Sensitive secret exposure in environment and source control
- Cross-site scripting, CSRF, and SSRF attacks
- Weak audit trail and incomplete logging
- Supply chain and dependency compromise
- Tenant isolation failures in multi-tenant mode
- Key and credential rotation gaps

## Mitigation Strategy

### Secure session management
- Use short-lived JWT access tokens with key identifiers (`kid`) for key rotation.
- Store tokens in `sessionStorage` instead of `localStorage` when running in a browser.
- Centralize token handling in `src/lib/auth/session.ts`.

### RBAC / ABAC permissions
- Implement role-based access control through `src/lib/rbac/roles.ts`, `src/lib/rbac/permissions.ts`, and `src/lib/rbac/middleware.ts`.
- Add attribute-based access control support for resource-level policies.
- Enforce RBAC on sensitive server functions and API endpoints.

### Secrets management
- Centralize environment configuration in `src/lib/security/env.ts`.
- Fail fast when required secrets are missing in production.
- Support JWT key rotation and versioned key sets through `src/lib/key-rotation.ts`.

### Encryption at rest / in transit
- Enforce TLS for database connections and warn when production DB URLs are not TLS-enabled in `src/lib/db.ts`.
- Apply secure headers and HSTS in `src/lib/security/middleware.ts`.

### CSRF / XSS / SSRF protection
- Apply strict CSP, X-Frame-Options, and content-type headers.
- Validate `Origin` and `Referer` on unsafe requests.
- Centralize external URL validation in security helpers when needed.

### Audit logs
- Store audit trails in the database using the `AuditLog` model.
- Log RBAC enforcement decisions and access checks in `src/lib/rbac/middleware.ts`.

### Dependency scanning and supply chain security
- Add an explicit `npm audit` script for automated dependency scanning.
- Maintain package version hygiene and avoid untrusted packages.

### Secure multi-tenancy
- Track tenant metadata in authentication and RBAC context.
- Enforce tenant-aware access checks in the RBAC layer.

### Key rotation
- Support `JWT_KEYSET` and `kid` headers for signing and verification.
- Rotate signing keys without invalidating all active tokens immediately.

## Files Updated
- `src/lib/security/env.ts`
- `src/lib/security/middleware.ts`
- `src/lib/auth/session.ts`
- `src/lib/key-rotation.ts`
- `src/lib/auth.middleware.ts`
- `src/lib/auth/auth.context.tsx`
- `src/lib/auth/auth.functions.ts`
- `src/lib/db.ts`
- `src/lib/rbac/permissions.ts`
- `src/lib/rbac/middleware.ts`
- `src/start.ts`
- `src/server.ts`
- `package.json`

## Next Actions
1. Run `npm install` if any new package is added (none required for this change).
2. Run `npm run audit` to identify dependency issues.
3. Review the Prisma schema and migrate the database if tenant fields are added.
4. Continue extending least-privilege access checks in business-critical server functions.
