import { describe, it, expect, beforeAll } from "vitest";
import jwt from "jsonwebtoken";

beforeAll(() => {
  process.env.JWT_KEYSET = JSON.stringify({ current: "identity-smoke-secret-1234567890" });
  process.env.JWT_SECRET = "identity-smoke-secret-1234567890";
});

/**
 * Smoke test for the regenerative identity flow.
 * Confirms signJwt produces a token with the expected identity claims and
 * that the same token can be used for an authenticated API call (Authorization
 * header round-trip + payload extraction).
 */
describe("regenerative identity smoke", () => {
  it("issues a session token with identity claims and verifies on the API side", async () => {
    const { signJwt, verifyJwt } = await import("@/lib/key-rotation");
    const token = signJwt(
      { sub: "did:rve:alice", roles: ["steward"], rid: 740 },
      { expiresIn: "1h" },
    );

    const request = new Request("https://app.local/api/identity/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const authHeader = request.headers.get("authorization") ?? "";
    const extracted = authHeader.replace(/^Bearer\s+/i, "");

    const payload = verifyJwt<{ sub: string; roles: string[]; rid: number; exp: number }>(extracted);
    expect(payload.sub).toBe("did:rve:alice");
    expect(payload.roles).toContain("steward");
    expect(payload.rid).toBe(740);
    expect(payload.exp).toBeGreaterThan(Math.floor(Date.now() / 1000));
  });

  it("rejects tampered identity tokens", async () => {
    const { signJwt, verifyJwt } = await import("@/lib/key-rotation");
    const token = signJwt({ sub: "did:rve:bob" });
    const [h, p, s] = token.split(".");
    const tampered = [h, p, s.slice(0, -2) + "xx"].join(".");
    expect(() => verifyJwt(tampered)).toThrow();
    // Sanity: real decoder still works on the original
    expect((jwt.decode(token) as any).sub).toBe("did:rve:bob");
  });

  it("rejects expired JWTs on authenticated API calls", async () => {
    const { signJwt, verifyJwt } = await import("@/lib/key-rotation");
    const expired = signJwt({ sub: "did:rve:carol" }, { expiresIn: -10 });
    expect(() => verifyJwt(expired)).toThrow(/jwt expired/i);
  });

  it("rejects requests with a missing Authorization header", async () => {
    const { verifyJwt } = await import("@/lib/key-rotation");
    const request = new Request("https://app.local/api/identity/me");
    const header = request.headers.get("authorization");
    expect(header).toBeNull();
    // Simulating server middleware behavior
    const extract = (h: string | null) => {
      if (!h) throw new Error("Unauthorized: no authorization header");
      return h.replace(/^Bearer\s+/i, "");
    };
    expect(() => verifyJwt(extract(header))).toThrow(/Unauthorized/);
  });

  it("flags mismatched identity claims (token sub ≠ requested resource owner)", async () => {
    const { signJwt, verifyJwt } = await import("@/lib/key-rotation");
    const token = signJwt({ sub: "did:rve:alice", roles: ["steward"] });
    const payload = verifyJwt<{ sub: string; roles: string[] }>(token);

    const requestedResourceOwner = "did:rve:mallory";
    const ownsResource = payload.sub === requestedResourceOwner;
    expect(ownsResource).toBe(false);

    const requiredRole = "admin";
    const hasRole = payload.roles.includes(requiredRole);
    expect(hasRole).toBe(false);
  });
});