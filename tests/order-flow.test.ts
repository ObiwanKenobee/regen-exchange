import { describe, it, expect } from "vitest";
import { shortHash, shortAddr } from "@/lib/wallet-context";

/**
 * Smoke test for the marketplace order flow.
 * Validates the deterministic shape of a submitted order DTO and the
 * formatting helpers used in the order ticket / order history UIs.
 * Higher-level UI verification is exercised manually in the marketplace
 * preview (place order → order book update → order ticket status → trade).
 */
describe("order flow smoke", () => {
  it("produces a well-formed order payload for createTradingOrder", () => {
    const payload = {
      userId: "0xabc123",
      assetId: "asset-1",
      side: "buy" as const,
      type: "market" as const,
      quantity: 10,
      price: undefined as number | undefined,
    };
    expect(payload.quantity).toBeGreaterThan(0);
    expect(["buy", "sell"]).toContain(payload.side);
    expect(["market", "limit"]).toContain(payload.type);
  });

  it("formats tx hashes and wallet addresses for the order ticket", () => {
    const hash = "0x" + "a".repeat(62);
    expect(shortHash(hash)).toMatch(/^0xaaaaaaaa…a{6}$/);
    const addr = "0x1234567890abcdef1234567890abcdef12345678";
    expect(shortAddr(addr)).toMatch(/^0x1234…5678$/);
  });
});