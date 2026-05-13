# Atlas Sanctum Implementation Roadmap

## Completed foundation work

- Implemented a 9-role RBAC system with expressive `RoleType` and `Permission` enums.
- Added production-ready auth middleware with JWT decoding, Prisma-backed user role resolution, and role-aware auth context.
- Added audit logging support via Prisma `AuditLog` model and database persistence.
- Added M-Pesa STK and B2C payment server functions with environment-sensitive demo fallback.
- Built a dedicated M-Pesa webhook handler for callback persistence and treasury reconciliation.
- Added observability and research hub route scaffolding for platform monitoring and intelligence surfaces.

## Backend improvements

- `src/lib/rbac/middleware.ts`
  - Decodes JWT from the authorization header
  - Resolves user role from `User` record in Postgres
  - Produces full RBAC context for permission checks
  - Persists audit events to `AuditLog`

- `src/lib/mpesa/mpesa.webhook.ts`
  - Accepts Safaricom Daraja webhook callbacks at `/api/mpesa/webhook`
  - Extracts transaction metadata and upserts `MPesaTransaction`
  - Logs callback IP and user-agent for compliance

- `src/server.ts`
  - Routes webhook requests before the built-in `@tanstack/react-start` server entry

## Observability & scalability assets

- Added `infra/observability/prometheus.yml` for Prometheus scrape config.
- Added `infra/observability/grafana-dashboard.json` as a starter dashboard for platform health.
- Added `infra/k8s/atlas-backend.yaml` and `infra/k8s/kafka-deployment.yaml` for Kubernetes service scaffolding.

## Feature surfaces added

- `src/routes/observability.tsx` — platform monitoring dashboard.
- `src/routes/research-hub.tsx` — collaborative research and intelligence summary.

## Recommended next steps

1. Wire route navigation into the main dashboard and sidebar.
2. Add RBAC middleware to existing `createServerFn` handlers across marketplace, oracle, and governance services.
3. Build MPesa callback routing into Cloudflare route configuration and secure with HMAC verification.
4. Add actual audit log query APIs and admin dashboards for `TREASURY_AUDITOR`/`SUPER_ADMIN` roles.
5. Seed roles and permissions into the Postgres `roles` table for runtime administration.
