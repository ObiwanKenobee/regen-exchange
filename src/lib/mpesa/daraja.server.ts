/**
 * Safaricom Daraja API — server-only.
 * Configure via env (see .env.example). Without credentials, callers should use demo responses.
 */

import { normalizeKenyaMsisdn } from "./phone";

export type MpesaEnvConfig = {
  baseUrl: string;
  consumerKey: string;
  consumerSecret: string;
  shortcode: string;
  passkey: string;
  stkCallbackUrl?: string;
  /** B2C optional */
  initiatorName?: string;
  securityCredential?: string;
  b2cShortcode?: string;
  b2cResultUrl?: string;
  b2cQueueTimeoutUrl?: string;
};

function readEnv(key: string): string | undefined {
  try {
    if (typeof process !== "undefined" && process.env?.[key]) {
      return process.env[key];
    }
  } catch {
    /* Cloudflare / edge */
  }
  return undefined;
}

export function getMpesaConfig(): MpesaEnvConfig | null {
  const consumerKey = readEnv("MPESA_CONSUMER_KEY");
  const consumerSecret = readEnv("MPESA_CONSUMER_SECRET");
  const shortcode = readEnv("MPESA_SHORTCODE");
  const passkey = readEnv("MPESA_PASSKEY");
  if (!consumerKey || !consumerSecret || !shortcode || !passkey) {
    return null;
  }
  const envName = readEnv("MPESA_ENV") ?? "sandbox";
  const baseUrl =
    envName === "production"
      ? "https://api.safaricom.co.ke"
      : "https://sandbox.safaricom.co.ke";

  return {
    baseUrl,
    consumerKey,
    consumerSecret,
    shortcode,
    passkey,
    stkCallbackUrl: readEnv("MPESA_STK_CALLBACK_URL"),
    initiatorName: readEnv("MPESA_B2C_INITIATOR_NAME"),
    securityCredential: readEnv("MPESA_B2C_SECURITY_CREDENTIAL"),
    b2cShortcode: readEnv("MPESA_B2C_SHORTCODE"),
    b2cResultUrl: readEnv("MPESA_B2C_RESULT_URL"),
    b2cQueueTimeoutUrl: readEnv("MPESA_B2C_QUEUE_TIMEOUT_URL"),
  };
}

async function fetchAccessToken(cfg: MpesaEnvConfig): Promise<string> {
  const auth = btoa(`${cfg.consumerKey}:${cfg.consumerSecret}`);
  const res = await fetch(
    `${cfg.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
    },
  );
  if (!res.ok) {
    throw new Error(`Daraja OAuth failed: ${res.status}`);
  }
  const json = (await res.json()) as { access_token?: string };
  if (!json.access_token) {
    throw new Error("Daraja OAuth: missing access_token");
  }
  return json.access_token;
}

function stkTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${now.getFullYear()}` +
    `${pad(now.getMonth() + 1)}` +
    `${pad(now.getDate())}` +
    `${pad(now.getHours())}` +
    `${pad(now.getMinutes())}` +
    `${pad(now.getSeconds())}`
  );
}

function encodeStkPassword(shortcode: string, passkey: string, timestamp: string): string {
  return btoa(`${shortcode}${passkey}${timestamp}`);
}

export async function darajaInitiateStkPush(params: {
  cfg: MpesaEnvConfig;
  phone: string;
  amount: number;
  accountReference: string;
  transactionDesc: string;
}): Promise<{
  ok: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  customerMessage?: string;
  responseDescription?: string;
  responseCode?: string;
  error?: string;
}> {
  const msisdn = normalizeKenyaMsisdn(params.phone);
  if (!msisdn) {
    return { ok: false, error: "Invalid Kenyan phone number" };
  }

  const callbackUrl = params.cfg.stkCallbackUrl;
  if (!callbackUrl) {
    return {
      ok: false,
      error:
        "MPESA_STK_CALLBACK_URL is required for live STK Push (public HTTPS URL for Safaricom callbacks)",
    };
  }

  const token = await fetchAccessToken(params.cfg);
  const timestamp = stkTimestamp();
  const password = encodeStkPassword(params.cfg.shortcode, params.cfg.passkey, timestamp);

  const body = {
    BusinessShortCode: params.cfg.shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.floor(params.amount),
    PartyA: msisdn,
    PartyB: params.cfg.shortcode,
    PhoneNumber: msisdn,
    CallBackURL: callbackUrl,
    AccountReference: params.accountReference.slice(0, 12),
    TransactionDesc: params.transactionDesc.slice(0, 13),
  };

  const res = await fetch(`${params.cfg.baseUrl}/mpesa/stkpush/v1/processrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as Record<string, unknown>;
  const responseCode = String(json.ResponseCode ?? "");
  const isOk = responseCode === "0";

  return {
    ok: isOk,
    merchantRequestId: json.MerchantRequestId as string | undefined,
    checkoutRequestId: json.CheckoutRequestID as string | undefined,
    customerMessage: json.CustomerMessage as string | undefined,
    responseDescription: json.ResponseDescription as string | undefined,
    responseCode,
    error: isOk ? undefined : String(json.errorMessage ?? json.ResponseDescription ?? "STK failed"),
  };
}

export async function darajaQueryStkPush(params: {
  cfg: MpesaEnvConfig;
  checkoutRequestId: string;
}): Promise<{ ok: boolean; resultCode?: string; resultDesc?: string; error?: string }> {
  const token = await fetchAccessToken(params.cfg);
  const timestamp = stkTimestamp();
  const password = encodeStkPassword(params.cfg.shortcode, params.cfg.passkey, timestamp);

  const body = {
    BusinessShortCode: params.cfg.shortcode,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: params.checkoutRequestId,
  };

  const res = await fetch(`${params.cfg.baseUrl}/mpesa/stkpushquery/v1/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as Record<string, unknown>;
  const resultCode = String(json.ResultCode ?? json.resultCode ?? "");
  /** 0 = success on query for completed payment */
  const isOk = resultCode === "0";

  return {
    ok: isOk,
    resultCode,
    resultDesc: String(json.ResultDesc ?? json.resultDesc ?? ""),
    error: isOk ? undefined : String(json.ResultDesc ?? json.errorMessage ?? "Query failed"),
  };
}

/**
 * B2C Business Payment — requires encrypted SecurityCredential from Safaricom tooling.
 */
export async function darajaB2cPayment(params: {
  cfg: MpesaEnvConfig;
  phone: string;
  amount: number;
  remarks: string;
  occasion: string;
}): Promise<{
  ok: boolean;
  conversationId?: string;
  originatorConversationId?: string;
  responseDescription?: string;
  error?: string;
}> {
  const msisdn = normalizeKenyaMsisdn(params.phone);
  if (!msisdn) {
    return { ok: false, error: "Invalid Kenyan phone number" };
  }

  const {
    initiatorName,
    securityCredential,
    b2cShortcode,
    b2cResultUrl,
    b2cQueueTimeoutUrl,
  } = params.cfg;

  if (
    !initiatorName ||
    !securityCredential ||
    !b2cShortcode ||
    !b2cResultUrl ||
    !b2cQueueTimeoutUrl
  ) {
    return {
      ok: false,
      error:
        "B2C not configured: set MPESA_B2C_INITIATOR_NAME, MPESA_B2C_SECURITY_CREDENTIAL, MPESA_B2C_SHORTCODE, MPESA_B2C_RESULT_URL, MPESA_B2C_QUEUE_TIMEOUT_URL",
    };
  }

  const token = await fetchAccessToken(params.cfg);

  const body = {
    InitiatorName: initiatorName,
    SecurityCredential: securityCredential,
    CommandID: "BusinessPayment",
    Amount: Math.floor(params.amount),
    PartyA: b2cShortcode,
    PartyB: msisdn,
    Remarks: params.remarks.slice(0, 100),
    QueueTimeOutURL: b2cQueueTimeoutUrl,
    ResultURL: b2cResultUrl,
    Occasion: params.occasion.slice(0, 100),
  };

  const res = await fetch(`${params.cfg.baseUrl}/mpesa/b2c/v1/paymentrequest`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as Record<string, unknown>;
  const responseCode = String(json.ResponseCode ?? "");
  const isOk = responseCode === "0";

  return {
    ok: isOk,
    conversationId: json.ConversationID as string | undefined,
    originatorConversationId: json.OriginatorConversationID as string | undefined,
    responseDescription: json.ResponseDescription as string | undefined,
    error: isOk ? undefined : String(json.errorMessage ?? json.ResponseDescription ?? "B2C failed"),
  };
}
