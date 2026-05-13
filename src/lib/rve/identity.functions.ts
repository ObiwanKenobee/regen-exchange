import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import db from "@/lib/db";

// Identity and RID Score Types
export interface UserProfile {
  id: string;
  email: string;
  phone?: string;
  name: string;
  avatar?: string;
  bio?: string;
  location?: string;
  joinedAt: Date;
  lastActive: Date;
  isVerified: boolean;
  ridScore: number;
  reputation: {
    steward: number;
    oracle: number;
    research: number;
    civic: number;
    builder: number;
  };
  badges: string[];
  skills: string[];
  certifications: string[];
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
  };
}

export interface RIDScore {
  total: number;
  components: {
    ecological: number;
    social: number;
    economic: number;
    governance: number;
  };
  history: Array<{
    date: Date;
    score: number;
    reason: string;
  }>;
}

// Identity Management Functions
export const createUserProfile = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    email: z.string().email(),
    name: z.string().min(2).max(100),
    phone: z.string().optional(),
    bio: z.string().max(500).optional(),
    location: z.string().max(100).optional(),
  }))
  .handler(async ({ data }) => {
    // In production, this would create a user in the database
    const profile: UserProfile = {
      id: `user-${Date.now()}`,
      email: data.email,
      phone: data.phone,
      name: data.name,
      bio: data.bio,
      location: data.location,
      joinedAt: new Date(),
      lastActive: new Date(),
      isVerified: false,
      ridScore: 0,
      reputation: {
        steward: 0,
        oracle: 0,
        research: 0,
        civic: 0,
        builder: 0,
      },
      badges: [],
      skills: [],
      certifications: [],
    };

    return profile;
  });

export const getUserProfile = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    userId: z.string(),
  }))
  .handler(async ({ data }) => {
    // Mock implementation - in production, fetch from database
    const mockProfile: UserProfile = {
      id: data.userId,
      email: "user@example.com",
      name: "Amina Steward",
      phone: "+254712345678",
      bio: "Environmental scientist and community organizer focused on Nairobi's urban forests.",
      location: "Nairobi, Kenya",
      joinedAt: new Date("2024-01-15"),
      lastActive: new Date(),
      isVerified: true,
      ridScore: 847,
      reputation: {
        steward: 85,
        oracle: 72,
        research: 91,
        civic: 78,
        builder: 64,
      },
      badges: ["River Guardian", "AI Apprentice", "Community Builder"],
      skills: ["Environmental Science", "GIS Mapping", "Community Engagement"],
      certifications: ["Carbon Credit Verification", "Water Quality Testing"],
      socialLinks: {
        twitter: "@amina_steward",
        linkedin: "amina-steward",
      },
    };

    return mockProfile;
  });

export const updateRIDScore = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string(),
    action: z.enum(["mission_complete", "verification_submit", "community_contribution", "governance_vote"]),
    points: z.number().min(1).max(100),
    reason: z.string().min(1).max(200),
  }))
  .handler(async ({ data }) => {
    // Mock RID score update - in production, this would update the database
    const scoreIncrease = data.points;
    const newScore = 847 + scoreIncrease; // Mock current score + increase

    const ridScore: RIDScore = {
      total: newScore,
      components: {
        ecological: Math.min(100, 78 + Math.floor(scoreIncrease * 0.4)),
        social: Math.min(100, 82 + Math.floor(scoreIncrease * 0.3)),
        economic: Math.min(100, 65 + Math.floor(scoreIncrease * 0.2)),
        governance: Math.min(100, 71 + Math.floor(scoreIncrease * 0.1)),
      },
      history: [
        {
          date: new Date(),
          score: scoreIncrease,
          reason: data.reason,
        },
      ],
    };

    return ridScore;
  });

export const verifyUserIdentity = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string(),
    verificationType: z.enum(["phone", "email", "document", "biometric"]),
    verificationData: z.any(),
  }))
  .handler(async ({ data }) => {
    // Mock verification process
    const verificationResult = {
      verified: true,
      verificationId: `ver-${Date.now()}`,
      timestamp: new Date(),
      type: data.verificationType,
      confidence: 0.95,
    };

    return verificationResult;
  });

// Oracle Verification Functions
export interface OracleVerification {
  id: string;
  assetId: string;
  userId: string;
  type: "satellite" | "sensor" | "community" | "ai_analysis";
  status: "pending" | "verified" | "rejected";
  confidence: number;
  data: any;
  createdAt: Date;
  verifiedAt?: Date;
  oracleConsensus?: {
    totalOracles: number;
    agreeingOracles: number;
    consensusScore: number;
  };
}

export const submitOracleVerification = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    assetId: z.string(),
    userId: z.string(),
    type: z.enum(["satellite", "sensor", "community", "ai_analysis"]),
    data: z.any(),
  }))
  .handler(async ({ data }) => {
    // Mock oracle verification submission
    const verification: OracleVerification = {
      id: `oracle-${Date.now()}`,
      assetId: data.assetId,
      userId: data.userId,
      type: data.type,
      status: "pending",
      confidence: 0.0,
      data: data.data,
      createdAt: new Date(),
    };

    return verification;
  });

export const getOracleConsensus = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    verificationId: z.string(),
  }))
  .handler(async ({ data }) => {
    // Mock oracle consensus calculation
    const consensus = {
      totalOracles: 5,
      agreeingOracles: 4,
      consensusScore: 0.92,
      individualScores: [
        { oracle: "satellite-1", score: 0.95, status: "verified" },
        { oracle: "sensor-network", score: 0.88, status: "verified" },
        { oracle: "community-validators", score: 0.94, status: "verified" },
        { oracle: "ai-fraud-detection", score: 0.91, status: "verified" },
        { oracle: "temporal-analysis", score: 0.89, status: "verified" },
      ],
    };

    return consensus;
  });

// Trading Engine Functions
export interface TradingOrder {
  id: string;
  userId: string;
  assetId: string;
  side: "buy" | "sell";
  type: "market" | "limit";
  quantity: number;
  price?: number;
  status: "pending" | "filled" | "cancelled";
  filledQuantity: number;
  remainingQuantity: number;
  createdAt: Date;
  updatedAt: Date;
  oracleVerificationId?: string;
}

export const createTradingOrder = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string(),
    assetId: z.string(),
    side: z.enum(["buy", "sell"]),
    type: z.enum(["market", "limit"]),
    quantity: z.number().positive(),
    price: z.number().positive().optional(),
  }))
  .handler(async ({ data }) => {
    if (!db) {
      return {
        id: `order-${Date.now()}`,
        userId: data.userId,
        assetId: data.assetId,
        side: data.side,
        type: data.type,
        quantity: data.quantity,
        price: data.price,
        status: "pending",
        filledQuantity: 0,
        remainingQuantity: data.quantity,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    const asset = await db.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      throw new Error("Asset not found");
    }

    let user = await db.user.findFirst({ where: { walletAddress: data.userId } });
    if (!user) {
      user = await db.user.create({
        data: {
          walletAddress: data.userId,
          role: "student_researcher",
          ridScore: 0,
        },
      });
    }

    const price = data.price ?? asset.currentPrice;
    const order = await db.order.create({
      data: {
        userId: user.id,
        assetId: asset.id,
        side: data.side,
        orderType: data.type,
        quantity: data.quantity,
        price,
        status: "pending",
      },
    });

    return {
      id: order.id,
      userId: user.id,
      assetId: asset.id,
      side: order.side as TradingOrder["side"],
      type: order.orderType as TradingOrder["type"],
      quantity: order.quantity,
      price: order.price ?? undefined,
      status: order.status as TradingOrder["status"],
      filledQuantity: 0,
      remainingQuantity: order.quantity,
      createdAt: order.createdAt,
      updatedAt: order.createdAt,
    };
  });

export const getOrderBook = createServerFn({ method: "GET" })
  .inputValidator(z.object({
    assetId: z.string(),
    depth: z.number().min(1).max(50).optional(),
  }))
  .handler(async ({ data }) => {
    if (!db) {
      return {
        assetId: data.assetId,
        bids: [
          { price: 25.5, quantity: 100, orders: 3 },
          { price: 25.45, quantity: 250, orders: 5 },
          { price: 25.4, quantity: 150, orders: 2 },
        ],
        asks: [
          { price: 25.6, quantity: 80, orders: 2 },
          { price: 25.65, quantity: 120, orders: 4 },
          { price: 25.7, quantity: 200, orders: 6 },
        ],
        spread: 0.1,
        lastPrice: 25.55,
        volume24h: 1250,
      };
    }

    const asset = await db.asset.findUnique({ where: { id: data.assetId } });
    if (!asset) {
      throw new Error("Asset not found");
    }

    const pendingOrders = await db.order.findMany({
      where: {
        assetId: data.assetId,
        status: "pending",
      },
      orderBy: [{ price: "desc" }, { createdAt: "asc" }],
    });

    const aggregateSide = (side: "buy" | "sell") => {
      const grouped = pendingOrders
        .filter((order) => order.side === side)
        .reduce((acc: Array<{ price: number; quantity: number; orders: number }>, order) => {
          const price = order.price ?? asset.currentPrice;
          const existing = acc.find((entry) => entry.price === price);
          if (existing) {
            existing.quantity += order.quantity;
            existing.orders += 1;
          } else {
            acc.push({ price, quantity: order.quantity, orders: 1 });
          }
          return acc;
        }, []);

      return grouped.sort((a, b) => (side === "buy" ? b.price - a.price : a.price - b.price));
    };

    const bids = aggregateSide("buy").slice(0, data.depth ?? 10);
    const asks = aggregateSide("sell").slice(0, data.depth ?? 10);
    const spread = bids.length && asks.length ? Math.max(0, asks[0].price - bids[0].price) : 0;
    const volume24h = pendingOrders.reduce((acc, order) => acc + order.quantity, 0);

    return {
      assetId: data.assetId,
      bids,
      asks,
      spread,
      lastPrice: asset.currentPrice,
      volume24h,
    };
  });

export const executeTrade = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    buyOrderId: z.string(),
    sellOrderId: z.string(),
    quantity: z.number().positive(),
    price: z.number().positive(),
  }))
  .handler(async ({ data }) => {
    // Mock trade execution
    const trade = {
      id: `trade-${Date.now()}`,
      buyOrderId: data.buyOrderId,
      sellOrderId: data.sellOrderId,
      quantity: data.quantity,
      price: data.price,
      totalValue: data.quantity * data.price,
      executedAt: new Date(),
      oracleVerificationId: `oracle-ver-${Date.now()}`,
      status: "completed",
    };

    return trade;
  });