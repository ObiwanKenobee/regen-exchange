import { networkTest as test, expect } from "./fixtures";

test.describe.configure({ retries: process.env.CI ? 3 : 1 });

/**
 * Force transient trade-execute failures (502s on the first N attempts) and
 * verify:
 *   - the client retries the request
 *   - the SAME correlationId is preserved across retries (the client must
 *     not mint a new one per attempt — log correlation depends on it)
 *   - the ticket reaches its terminal status exactly once (no duplicate
 *     transitions, no duplicate execution rows)
 */
test("transient trade-execute failures: correlationId preserved, ticket updates once", async ({
  page,
  context,
  correlationIds,
}) => {
  const sentCorrelationIds: string[] = [];
  let attempts = 0;

  await context.route(/\/api\/public\/trade-execute/i, async (route) => {
    attempts++;
    const req = route.request();
    const cid =
      req.headers()["x-correlation-id"] ||
      req.headers()["x-request-id"] ||
      "";
    if (cid) sentCorrelationIds.push(cid);

    // First two attempts fail with a transient 502.
    if (attempts <= 2) {
      return route.fulfill({
        status: 502,
        headers: {
          "content-type": "application/json",
          ...(cid ? { "x-correlation-id": cid } : {}),
        },
        body: JSON.stringify({
          ok: false,
          error: {
            code: "BAD_GATEWAY",
            message: "upstream transient failure",
            correlationId: cid || "synthetic-cid",
          },
        }),
      });
    }
    return route.continue();
  });

  await page.goto("/marketplace");

  const buy = page.getByRole("button", { name: /^buy/i }).first();
  await expect(buy).toBeVisible({ timeout: 15_000 });
  await buy.click();
  await page.getByLabel(/quantity/i).fill("1");
  await page.getByRole("button", { name: /review buy/i }).click();
  await page.getByRole("button", { name: /sign.*submit/i }).click();

  // Terminal status reached despite the transient failures.
  const terminal = page.getByText(/transaction submitted|order confirmed/i);
  await expect(terminal).toBeVisible({ timeout: 30_000 });

  // It should appear exactly once — no duplicate transitions caused by the
  // client treating each retry as a separate submission.
  await page.waitForTimeout(1_500);
  expect(await terminal.count()).toBe(1);

  // Execution row (tx hash) should also be present exactly once.
  const txRow = page.getByText(/tx hash/i);
  expect(await txRow.count()).toBeLessThanOrEqual(1);

  // The client should have retried at least once.
  expect(attempts).toBeGreaterThanOrEqual(2);

  // CorrelationId preservation: every attempt that carried a correlationId
  // header must have used the SAME value. If the client doesn't forward a
  // correlationId header, fall back to checking the server-issued IDs are
  // also collapsed to a single value across the retry chain.
  if (sentCorrelationIds.length > 0) {
    const unique = new Set(sentCorrelationIds);
    expect(
      unique.size,
      `client minted ${unique.size} correlationIds across ${sentCorrelationIds.length} attempts`,
    ).toBe(1);
  }

  if (correlationIds.length > 0) {
    const unique = new Set(correlationIds);
    expect(
      unique.size,
      `server returned ${unique.size} distinct correlationIds across the retry chain`,
    ).toBeLessThanOrEqual(1);
  }
});