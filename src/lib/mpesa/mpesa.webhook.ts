import db from "@/lib/db";

export async function handleMpesaWebhook(request: Request): Promise<Response> {
  let payload: unknown = null;
  try {
    payload = await request.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON payload" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const body = (payload as any)?.Body ?? payload;
  const auditDetails = { raw: body };
  const ipAddress =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown";
  const userAgent = request.headers.get("user-agent") || "unknown";

  const stkCallback = body?.stkCallback ?? body?.StkCallback;
  const transactionReceipt = body?.TransactionReceipt || body?.transactionReceipt;
  const transactionType = stkCallback ? "STK" : body?.TransactionType ?? "B2C";
  const transactionId =
    stkCallback?.CheckoutRequestID ||
    stkCallback?.MerchantRequestID ||
    body?.ConversationID ||
    transactionReceipt ||
    `mpesa-${Date.now()}`;

  const resultCode = String(stkCallback?.ResultCode ?? body?.ResultCode ?? body?.resultCode ?? "");
  const resultDesc =
    stkCallback?.ResultDesc || body?.ResultDesc || body?.resultDesc || body?.ResultDescription || "unknown";
  const amount = Number(
    stkCallback?.CallbackMetadata?.Item?.find((item: any) => item?.Name === "Amount")?.Value ??
      stkCallback?.CallbackMetadata?.item?.find((item: any) => item?.name === "Amount")?.value ??
      body?.TransactionAmount ??
      body?.Amount ??
      0,
  );
  const phone =
    stkCallback?.CallbackMetadata?.Item?.find((item: any) => item?.Name === "PhoneNumber")?.Value ??
    body?.PhoneNumber ??
    body?.CustomerMSISDN ??
    "unknown";
  const accountReference =
    stkCallback?.CallbackMetadata?.Item?.find((item: any) => item?.Name === "AccountReference")?.Value ??
    body?.AccountReference ??
    body?.BillRefNumber ??
    "unknown";

  const status = resultCode === "0" ? "completed" : "failed";

  const transactionData = {
    transactionId,
    amount: Number(amount || 0),
    phoneNumber: String(phone || "unknown"),
    accountReference: String(accountReference || "unknown"),
    transactionDesc: String(resultDesc || "M-Pesa callback"),
    transactionType,
    status,
    resultCode: resultCode || undefined,
    resultDesc: resultDesc || undefined,
    processedAt: new Date(),
    details: auditDetails,
    ipAddress,
    userAgent,
  };

  try {
    if (db) {
      await db.mPesaTransaction.upsert({
        where: { transactionId },
        create: transactionData,
        update: {
          amount: transactionData.amount,
          phoneNumber: transactionData.phoneNumber,
          accountReference: transactionData.accountReference,
          transactionDesc: transactionData.transactionDesc,
          transactionType: transactionData.transactionType,
          status: transactionData.status,
          resultCode: transactionData.resultCode,
          resultDesc: transactionData.resultDesc,
          processedAt: transactionData.processedAt,
          details: transactionData.details,
          ipAddress: transactionData.ipAddress,
          userAgent: transactionData.userAgent,
        },
      });
    } else {
      console.info("M-Pesa webhook received but Prisma client is not initialized", transactionData);
    }
  } catch (error) {
    console.error("Failed to persist M-Pesa webhook", error);
    return new Response(JSON.stringify({ ok: false, error: "Webhook persistence failed" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true, transactionId, status }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}
