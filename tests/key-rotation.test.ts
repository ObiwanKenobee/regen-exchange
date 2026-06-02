import { describe, it, expect, beforeAll, afterEach } from "vitest";
import jwt from "jsonwebtoken";

const OLD_SECRET = "old-secret-rotation-test-aaaaaaaaaaaaaaaa";
const NEW_SECRET = "new-secret-rotation-test-bbbbbbbbbbbbbbbb";

beforeAll(() => {
  process.env.JWT_KEYSET = JSON.stringify({ v1: OLD_SECRET, v2: NEW_SECRET });
  process.env.JWT_KID = "v1";
  process.env.JWT_SECRET = OLD_SECRET;
});

afterEach(() => {
  process.env.JWT_KID = "v1";
});

describe("JWT key rotation", () => {
  it("signs with the active kid and embeds it in the header", async () => {
    const { signJwt } = await import("@/lib/key-rotation");
    const token = signJwt({ sub: "user-1" });
    const decoded = jwt.decode(token, { complete: true }) as any;
    expect(decoded.header.kid).toBe("v1");
    expect(decoded.payload.sub).toBe("user-1");
  });

  it("verifies tokens issued under the previous key after rotation", async () => {
    const { signJwt, verifyJwt } = await import("@/lib/key-rotation");
    const oldToken = signJwt({ sub: "legacy-user" });

    // Rotate active key
    process.env.JWT_KID = "v2";
    const newToken = signJwt({ sub: "fresh-user" });

    const oldPayload = verifyJwt<{ sub: string }>(oldToken);
    const newPayload = verifyJwt<{ sub: string }>(newToken);

    expect(oldPayload.sub).toBe("legacy-user");
    expect(newPayload.sub).toBe("fresh-user");
    const decodedNew = jwt.decode(newToken, { complete: true }) as any;
    expect(decodedNew.header.kid).toBe("v2");
  });

  it("rejects tokens with an unknown kid", async () => {
    const { verifyJwt } = await import("@/lib/key-rotation");
    const forged = jwt.sign({ sub: "x" }, "stranger-secret", {
      header: { alg: "HS256", kid: "v3-missing" },
    });
    expect(() => verifyJwt(forged)).toThrow();
  });
});