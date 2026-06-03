import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { randomUUID } from "node:crypto";
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

type ErrorCode =
  | "bad_signature"
  | "expired"
  | "future"
  | "replayed"
  | "invalid_json"
  | "invalid_request";

const ERROR_TABLE: Record<ErrorCode, { status: number; message: string }> = {
  bad_signature: { status: 401, message: "Signature verification failed" },
  expired: { status: 410, message: "Request timestamp is outside the allowed window" },
  future: { status: 400, message: "Request timestamp is too far in the future" },
  replayed: { status: 409, message: "Nonce has already been used" },
  invalid_json: { status: 400, message: "Request body is not valid JSON" },
  invalid_request: { status: 400, message: "Request body failed schema validation" },
};

function errorResponse(code: ErrorCode, correlationId: string) {
  const { status, message } = ERROR_TABLE[code];
  return Response.json(
    { ok: false, error: { code, message, correlationId } },
    { status, headers: { "x-correlation-id": correlationId } },
  );
}

export const Route = createFileRoute("/api/public/trade-execute")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const correlationId =
          request.headers.get("x-correlation-id") || randomUUID();
        let json: unknown;
        try {
          json = await request.json();
        } catch {
          return errorResponse("invalid_json", correlationId);
        }
        const parsed = SignedRequestSchema.safeParse(json);
        if (!parsed.success) {
          return errorResponse("invalid_request", correlationId);
        }
        const result = verifyTradeRequest(
          getSecret(),
          parsed.data as SignedTradeRequest,
          nonces,
        );
        if (!result.ok) {
          return errorResponse(result.reason as ErrorCode, correlationId);
        }
        return Response.json(
          { ok: true, correlationId },
          { headers: { "x-correlation-id": correlationId } },
        );
      },
    },
  },
});