import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireAuthMiddleware, requireRIDScoreMiddleware } from "../auth/auth.middleware";
import { updateRIDScore } from "../auth/auth.functions";
import db from "@/lib/db";

// Mock data - will be replaced with database queries
const mockAssets = [
  {
    id: "1",
    symbol: "CARBON",
    name: "Carbon Credit",
    type: "carbon",
    description: "Verified carbon sequestration credits",
    totalSupply: 1000000,
    currentPrice: 25.50,
    marketCap: 25500000,
    verificationScore: 95.2,
    oracleId: "oracle-123",
    contractAddress: "0x1234567890123456789012345678901234567890",
    metadata: {
      region: "Kenya",
      methodology: "ARR",
      vintage: "2024"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: "2",
    symbol: "WATER",
    name: "Water Conservation",
    type: "water",
    description: "Verified water conservation credits",
    totalSupply: 500000,
    currentPrice: 12.75,
    marketCap: 6375000,
    verificationScore: 88.7,
    oracleId: "oracle-456",
    contractAddress: "0x0987654321098765432109876543210987654321",
    metadata: {
      region: "Tanzania",
      methodology: "Water Conservation",
      vintage: "2024"
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

const mockProposals = [
  {
    id: "RIP-043",
    title: "Implement automated oracle verification for carbon credits",
    description: "Use AI-oracle consensus to accelerate credit validation while reducing manual audit overhead.",
    status: "active",
    for: 52,
    against: 8,
    abstain: 2,
    ts: "open",
    quorum: false,
    canVote: true,
    votingStartsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    votingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [],
  },
  {
    id: "RIP-038",
    title: "Add Quechua Cultural Archive validator set",
    description: "Expand cultural evidence validation with indigenous knowledge custodians for heritage projects.",
    status: "active",
    for: 45,
    against: 35,
    abstain: 5,
    ts: "3d left",
    quorum: false,
    canVote: true,
    votingStartsAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    votingEndsAt: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [],
  },
  {
    id: "RIP-039",
    title: "Adjust restoration fee to 0.5% (was 0.4%)",
    description: "Rebalance platform revenue for next funding cycle and additional irrigation grants.",
    status: "rejected",
    for: 28,
    against: 68,
    abstain: 4,
    ts: "final",
    quorum: true,
    canVote: false,
    votingStartsAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    votingEndsAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    votes: [],
  },
];

const mockOrders = [
  {
    id: "1",
    userId: "user-123",
    assetId: "asset-456",
    side: "buy",
    orderType: "market",
    quantity: 100,
    price: 25.50,
    status: "filled",
    txHash: "0xabcdef1234567890",
    oracleVerificationId: "verification-789",
    executedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "user-123",
    assetId: "asset-789",
    side: "sell",
    orderType: "limit",
    quantity: 50,
    price: 26.00,
    status: "pending",
    createdAt: new Date().toISOString(),
  },
];

const mockPortfolio = {
  id: "portfolio-123",
  userId: "user-123",
  totalValue: 12500.75,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  items: [
    {
      id: "item-1",
      portfolioId: "portfolio-123",
      assetId: "asset-456",
      quantity: 250,
      avgPrice: 24.50,
      currentValue: 6375.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: "item-2",
      portfolioId: "portfolio-123",
      assetId: "asset-789",
      quantity: 150,
      avgPrice: 12.00,
      currentValue: 1950.00,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

// Input validators
const getAssetsInput = z.object({
  type: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
}).optional();

const createOrderInput = z.object({
  userId: z.string(),
  assetId: z.string(),
  side: z.enum(["buy", "sell"]),
  orderType: z.enum(["market", "limit"]).optional().default("market"),
  quantity: z.number().positive(),
  price: z.number().positive().optional(),
});

const getProposalsInput = z.object({
  status: z.string().optional(),
  limit: z.number().int().min(1).max(50).optional(),
}).optional();

/**
 * Get all assets with optional filtering
 */
export const getAssets = createServerFn({ method: "GET" })
  .inputValidator(getAssetsInput)
  .handler(async ({ data }): Promise<typeof mockAssets> => {
    let filteredAssets = mockAssets;

    if (db) {
      filteredAssets = await db.asset.findMany({
        where: data?.type ? { type: data.type } : undefined,
        take: data?.limit,
        orderBy: { updatedAt: "desc" },
      });
    }

    if (data?.type) {
      filteredAssets = filteredAssets.filter(asset => asset.type === data.type);
    }

    if (data?.limit) {
      filteredAssets = filteredAssets.slice(0, data.limit);
    }

    return filteredAssets;
  });

/**
 * Get orders with optional filtering
 */
export const getOrders = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    userId: z.string().optional(),
    assetId: z.string().optional(),
    status: z.string().optional(),
    limit: z.number().int().min(1).max(100).optional(),
  }).optional())
  .handler(async ({ data }): Promise<typeof mockOrders> => {
    if (db) {
      const where: any = {};
      if (data?.userId) where.userId = data.userId;
      if (data?.assetId) where.assetId = data.assetId;
      if (data?.status) where.status = data.status;

      return await db.order.findMany({
        where,
        take: data?.limit,
        orderBy: { createdAt: "desc" },
      });
    }

    let filteredOrders = mockOrders;

    if (data?.userId) {
      filteredOrders = filteredOrders.filter(order => order.userId === data.userId);
    }

    if (data?.assetId) {
      filteredOrders = filteredOrders.filter(order => order.assetId === data.assetId);
    }

    if (data?.status) {
      filteredOrders = filteredOrders.filter(order => order.status === data.status);
    }

    if (data?.limit) {
      filteredOrders = filteredOrders.slice(0, data.limit);
    }

    return filteredOrders;
  });

/**
 * Get governance proposals
 */
export const getProposals = createServerFn({ method: "GET" })
  .inputValidator(getProposalsInput)
  .handler(async ({ data }) => {
    if (db) {
      const where: any = {};
      if (data?.status) where.status = data.status;

      const proposals = await db.governanceProposal.findMany({
        where,
        include: { votes: true },
        take: data?.limit,
        orderBy: { createdAt: "desc" },
      });

      return proposals.map((proposal) => {
        const counts = proposal.votes.reduce(
          (acc, vote) => {
            acc[vote.vote] = (acc[vote.vote] ?? 0) + 1;
            return acc;
          },
        {} as Record<string, number>);

        const total = counts.for + counts.against + counts.abstain || 1;
        return {
          id: proposal.id,
          title: proposal.title,
          description: proposal.description,
          status: proposal.status,
          for: Math.round((counts.for ?? 0) / total * 100),
          against: Math.round((counts.against ?? 0) / total * 100),
          abstain: Math.round((counts.abstain ?? 0) / total * 100),
          ts: proposal.votingEndsAt ? `${Math.max(0, Math.ceil((proposal.votingEndsAt.getTime() - Date.now()) / 1000 / 60 / 60 / 24))}d left` : "open",
          quorum: proposal.votingEndsAt ? proposal.votingEndsAt.getTime() > Date.now() : false,
          canVote: proposal.status === "active",
        };
      });
    }

    return mockProposals;
  });

/**
 * Create a new order
 */
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware])
  .inputValidator(createOrderInput)
  .handler(async ({ data, context }): Promise<{ id: string; status: string; message: string }> => {
    const userId = context.user!.id;
    const orderId = Math.random().toString(36).substr(2, 9);
    let status = "pending";

    if (db) {
      const asset = await db.asset.findUnique({ where: { id: data.assetId } });
      if (!asset) {
        throw new Error("Asset not found");
      }

      const price = data.price ?? asset.currentPrice;
      const order = await db.order.create({
        data: {
          userId,
          assetId: data.assetId,
          side: data.side,
          orderType: data.orderType,
          quantity: data.quantity,
          price,
          status,
        },
      });

      status = order.status;
      console.log(`Created order ${order.id} for user ${userId}`);
    } else {
      mockOrders.push({
        id: orderId,
        userId,
        assetId: data.assetId,
        side: data.side,
        orderType: data.orderType,
        quantity: data.quantity,
        price: data.price ?? 0,
        status,
        createdAt: new Date().toISOString(),
      });
    }

    try {
      await updateRIDScore({
        userId,
        activity: "trade",
        impact: 2,
      });
    } catch (error) {
      console.warn("Failed to update RID score:", error);
    }

    return {
      id: orderId,
      status,
      message: "Order created successfully",
    };
  });

/**
 * Vote on governance proposal
 */
export const voteOnProposal = createServerFn({ method: "POST" })
  .middleware([requireAuthMiddleware, requireRIDScoreMiddleware(25)])
  .inputValidator(z.object({
    proposalId: z.string(),
    vote: z.enum(["for", "against", "abstain"]),
  }))
  .handler(async ({ data, context }): Promise<{ success: boolean; message: string }> => {
    const userId = context.user!.id;

    if (db) {
      const proposal = await db.governanceProposal.findUnique({ where: { id: data.proposalId } });
      if (!proposal || proposal.status !== "active") {
        throw new Error("Proposal not available for voting");
      }

      const existingVote = await db.governanceVote.findUnique({
        where: {
          proposalId_userId: {
            proposalId: data.proposalId,
            userId,
          },
        },
      });

      if (existingVote) {
        throw new Error("You have already voted on this proposal");
      }

      await db.governanceVote.create({
        data: {
          proposalId: data.proposalId,
          userId,
          vote: data.vote,
          votingPower: context.user!.ridScore,
        },
      });
    } else {
      console.log(`User ${userId} voted ${data.vote} on proposal ${data.proposalId}`);
    }

    try {
      await updateRIDScore({
        userId,
        activity: "governance_vote",
        impact: 3,
      });
    } catch (error) {
      console.warn("Failed to update RID score:", error);
    }

    return {
      success: true,
      message: `Vote recorded: ${data.vote}`,
    };
  });