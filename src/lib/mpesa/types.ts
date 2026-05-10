/** Client-safe M-Pesa / treasury rail types */

export type MpesaRailPurpose =
  | "buy_riu"
  | "sell_riu_offramp"
  | "steward_earnings"
  | "microgrant"
  | "climate_cashback"
  | "gig_payout"
  | "dao_incentive"
  | "merchant_checkout"
  | "utility_credit"
  | "deposit"
  | "other";

export type MpesaStkInitResult = {
  ok: boolean;
  demo?: boolean;
  merchantRequestId?: string;
  checkoutRequestId?: string;
  customerMessage?: string;
  responseDescription?: string;
  responseCode?: string;
  error?: string;
};

export type MpesaStkQueryResult = {
  ok: boolean;
  demo?: boolean;
  resultCode?: string;
  resultDesc?: string;
  error?: string;
};

export type MpesaB2cResult = {
  ok: boolean;
  demo?: boolean;
  conversationId?: string;
  originatorConversationId?: string;
  responseDescription?: string;
  error?: string;
};

export const MPESA_USE_CASES = [
  {
    title: "River cleanup rewards",
    layer: "Community earnings",
  },
  {
    title: "Waste collection incentives",
    layer: "Gig economy",
  },
  {
    title: "Urban farming participation",
    layer: "Missions",
  },
  {
    title: "Biodiversity monitoring",
    layer: "Data gigs",
  },
  {
    title: "Climate surveys & sensor maintenance",
    layer: "Verified tasks",
  },
  {
    title: "DAO-approved microgrants",
    layer: "Treasury → M-Pesa",
  },
  {
    title: "Eco-markets & solar vendors (RIU + M-Pesa)",
    layer: "Merchant loop",
  },
  {
    title: "Utility discounts via RIU offsets",
    layer: "Smart utilities",
  },
  {
    title: "Voting & environmental reporting stipends",
    layer: "DAO incentives",
  },
] as const;
