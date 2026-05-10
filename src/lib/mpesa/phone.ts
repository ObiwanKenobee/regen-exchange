/** Normalize Kenyan phone numbers to 2547XXXXXXXX */

export function normalizeKenyaMsisdn(input: string): string | null {
  const d = input.replace(/\D/g, "");
  if (!d.length) return null;
  if (d.startsWith("254") && d.length === 12) return d;
  if (d.startsWith("0") && d.length === 10) return `254${d.slice(1)}`;
  if (d.length === 9 && d.startsWith("7")) return `254${d}`;
  if (d.length === 10 && d.startsWith("7")) return `254${d}`;
  return null;
}

export function formatMsisdnDisplay(msisdn254: string): string {
  if (msisdn254.length !== 12 || !msisdn254.startsWith("254")) return msisdn254;
  return `0${msisdn254.slice(3)}`;
}
