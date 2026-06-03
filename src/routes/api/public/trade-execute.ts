import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  NonceStore,
  verifyTradeRequest,
  type SignedTradeRequest,
} from "@/lib/security/trade-signature";

// Module-scoped nonce store. In a real deployment this would be backed by
// Redis/Durable Object; for the public test endpoint an in-memory store is
// sufficient and matches the unit tests.
const nonces = new NonceStore(60_000);

const SignedRequestSchema = z.object({
  payload: z.unknown(),
  timestamp: z.number().int().positive(),
  nonce: z.string().min(8).max(128),
  signature: z.string().regex(/^[a-f0-9]+$/i).min(32).max(256),
});

function getSecret(): string {
  return process.env.TRADE_EXEC_SECRET || "dev-trade-secret";
}

function reasonToStatus(reason: string): number {
  switch (reason) {
    case "bad_signature":
      return 401;
    case "expired":
      return 410;
    case "future":
      return 400;
    case "replayed":
      return 409;
    default:
      return 400;
  }
}

export const Route = createFileRoute("/api/public/trade-execute")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }
        const parsed = SignedRequestSchema.safeParse(json);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_request" }, { status: 400 });
        }
        const result = verifyTradeRequest(
          getSecret(),
          parsed.data as SignedTradeRequest,
          nonces,
        );
        if (!result.ok) {
          return Response.json(
            { ok: false, error: result.reason },
            { status: reasonToStatus(result.reason) },
          );
        }
        return Response.json({ ok: true });
      },
    },
  },
});