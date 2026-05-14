import { createMiddleware } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 80;
const clientRequests = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return (
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-real-ip") ||
    request.headers.get("x-client-ip") ||
    request.headers.get("remote_addr") ||
    "unknown"
  );
}

export function applySecurityHeaders(response: Response): Response {
  const headers = response.headers;
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Permissions-Policy", "geolocation=(), microphone=(), camera=(), payment=()");
  headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none';"
  );
  headers.set("Strict-Transport-Security", "max-age=63072000; includeSubDomains; preload");
  return response;
}

export const securityHeadersMiddleware = createMiddleware().server(async ({ next }) => {
  const response = await next();
  return applySecurityHeaders(response);
});

export const rateLimitMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const ip = getClientIp(request);
  const now = Date.now();
  const existing = clientRequests.get(ip);

  if (!existing || existing.resetAt <= now) {
    clientRequests.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
  } else {
    existing.count += 1;
    clientRequests.set(ip, existing);
    if (existing.count > RATE_LIMIT_MAX_REQUESTS) {
      return new Response(JSON.stringify({ error: "Too many requests" }), {
        status: 429,
        headers: {
          "content-type": "application/json; charset=utf-8",
          "retry-after": String(Math.ceil((existing.resetAt - now) / 1000)),
        },
      });
    }
  }

  const response = await next();
  response.headers.set("X-RateLimit-Limit", String(RATE_LIMIT_MAX_REQUESTS));
  response.headers.set("X-RateLimit-Remaining", String(Math.max(0, (clientRequests.get(ip)?.count ?? 0) - 1)));
  return response;
});

export const csrfProtectionMiddleware = createMiddleware().server(async ({ next }) => {
  const request = getRequest();
  const unsafeMethods = new Set(["POST", "PUT", "PATCH", "DELETE"]);
  if (!unsafeMethods.has(request.method)) {
    return await next();
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const requestUrl = new URL(request.url);

  if (origin) {
    if (origin !== requestUrl.origin) {
      return new Response(JSON.stringify({ error: "Invalid request origin" }), {
        status: 403,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  } else if (referer) {
    const refererUrl = new URL(referer);
    if (refererUrl.origin !== requestUrl.origin) {
      return new Response(JSON.stringify({ error: "Invalid request referer" }), {
        status: 403,
        headers: { "content-type": "application/json; charset=utf-8" },
      });
    }
  } else {
    return new Response(JSON.stringify({ error: "Missing origin or referer" }), {
      status: 403,
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  }

  return await next();
});
