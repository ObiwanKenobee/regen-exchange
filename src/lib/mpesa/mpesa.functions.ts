import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  darajaB2cPayment,
  darajaInitiateStkPush,
  darajaQueryStkPush,
  getMpesaConfig,
} from "./daraja.server";
import type { MpesaB2cResult, MpesaStkInitResult, MpesaStkQueryResult } from "./types";

export type { MpesaRailPurpose } from "./types";

const stkInput = z.object({
  phone: z.string().min(9).max(20),
  amount: z.number().int().min(1).max(250_000),
  accountReference: z.string().min(1).max(12),
  transactionDesc: z.string().min(1).max(13).optional(),
  purpose: z
    .enum([
      "buy_riu",
      "sell_riu_offramp",
      "steward_earnings",
      "microgrant",
      "climate_cashback",
      "gig_payout",
      "dao_incentive",
      "merchant_checkout",
      "utility_credit",
      "deposit",
      "other",
    ])
    .optional(),
});

const stkQueryInput = z.object({
  checkoutRequestId: z.string().min(5),
});

const b2cInput = z.object({
  phone: z.string().min(9).max(20),
  amount: z.number().int().min(1).max(250_000),
  remarks: z.string().min(1).max(100),
  occasion: z.string().min(1).max(100),
  purpose: z
    .enum([
      "steward_earnings",
      "microgrant",
      "climate_cashback",
      "gig_payout",
      "dao_incentive",
      "sell_riu_offramp",
      "other",
    ])
    .optional(),
});

/**
 * STK Push — user confirms payment on phone (on-ramp: M-Pesa → treasury → RIU credit).
 */
export const initiateMpesaStkPush = createServerFn({ method: "POST" })
  .inputValidator(stkInput)
  .handler(async ({ data }): Promise<MpesaStkInitResult> => {
    const cfg = getMpesaConfig();
    const desc =
      data.transactionDesc ??
      (data.purpose === "buy_riu"
        ? "Buy RIU"
        : data.purpose === "climate_cashback"
          ? "Cashback"
          : "RVE Pay");

    if (!cfg) {
      return {
        ok: true,
        demo: true,
        checkoutRequestId: `DEMO-STK-${Date.now()}`,
        merchantRequestId: `DEMO-MR-${Date.now()}`,
        customerMessage:
          "Demo mode: add MPESA_CONSUMER_KEY, MPESA_CONSUMER_SECRET, MPESA_SHORTCODE, MPESA_PASSKEY, MPESA_STK_CALLBACK_URL for live STK Push.",
        responseDescription: "Demo STK accepted",
        responseCode: "0",
      };
    }

    const result = await darajaInitiateStkPush({
      cfg,
      phone: data.phone,
      amount: data.amount,
      accountReference: data.accountReference,
      transactionDesc: desc,
    });

    return {
      ok: result.ok,
      merchantRequestId: result.merchantRequestId,
      checkoutRequestId: result.checkoutRequestId,
      customerMessage: result.customerMessage,
      responseDescription: result.responseDescription,
      responseCode: result.responseCode,
      error: result.error,
    };
  });

/**
 * Query STK status (poll after STK — production should rely on callback + idempotent treasury).
 */
export const queryMpesaStkStatus = createServerFn({ method: "POST" })
  .inputValidator(stkQueryInput)
  .handler(async ({ data }): Promise<MpesaStkQueryResult> => {
    if (data.checkoutRequestId.startsWith("DEMO-")) {
      return {
        ok: true,
        demo: true,
        resultCode: "0",
        resultDesc: "Demo: assume success after user confirms on handset",
      };
    }

    const cfg = getMpesaConfig();
    if (!cfg) {
      return { ok: false, error: "M-Pesa not configured" };
    }

    const result = await darajaQueryStkPush({ cfg, checkoutRequestId: data.checkoutRequestId });
    return {
      ok: result.ok,
      resultCode: result.resultCode,
      resultDesc: result.resultDesc,
      error: result.error,
    };
  });

/**
 * B2C payout — treasury to customer M-Pesa (earnings, microgrants, gig pay, off-ramp).
 * Requires Daraja B2C credentials + encrypted SecurityCredential.
 */
export const requestMpesaB2cPayout = createServerFn({ method: "POST" })
  .inputValidator(b2cInput)
  .handler(async ({ data }): Promise<MpesaB2cResult> => {
    void data.purpose;

    const cfg = getMpesaConfig();
    if (!cfg) {
      return {
        ok: true,
        demo: true,
        conversationId: `DEMO-B2C-${Date.now()}`,
        originatorConversationId: `DEMO-ORIG-${Date.now()}`,
        responseDescription:
          "Demo payout queued — configure B2C env vars for live disbursement to M-Pesa.",
      };
    }

    const result = await darajaB2cPayment({
      cfg,
      phone: data.phone,
      amount: data.amount,
      remarks: data.remarks,
      occasion: data.occasion,
    });

    return {
      ok: result.ok,
      conversationId: result.conversationId,
      originatorConversationId: result.originatorConversationId,
      responseDescription: result.responseDescription,
      error: result.error,
    };
  });
