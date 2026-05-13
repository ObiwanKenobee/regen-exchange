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

// Trading Engine Helpers

function isWalletAddress(value: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(value);
}

async function resolveTradingUser(userId: string) {
  if (!db) return null;

  let user = await db.user.findUnique({ where: { id: userId } });
  if (!user && isWalletAddress(userId)) {
    user = await db.user.findUnique({ where: { walletAddress: userId } });
  }

  if (!user) {
    user = await db.user.create({
      data: {
        walletAddress: isWalletAddress(userId) ? userId : undefined,
        role: "student_researcher",
        ridScore: 0,
      },
    });
  }

  return user;
}

function orderMatchingPrice(incoming: any, counter: any, assetPrice: number) {
  if (incoming.orderType === "market" && counter.orderType === "market") {
    return assetPrice;
  }
  if (incoming.orderType === "market") {
    return counter.price ?? assetPrice;
  }
  if (counter.orderType === "market") {
    return incoming.price ?? assetPrice;
  }
  return counter.price ?? incoming.price ?? assetPrice;
}

function canMatchOrders(incoming: any, counter: any, assetPrice: number) {
  const incomingPrice = incoming.orderType === "market" ? assetPrice : incoming.price ?? assetPrice;
  const counterPrice = counter.orderType === "market" ? assetPrice : counter.price ?? assetPrice;

  if (incoming.side === "buy") {
    return incoming.orderType === "market" || counter.orderType === "market" || incomingPrice >= counterPrice;
  }

  return incoming.orderType === "market" || counter.orderType === "market" || incomingPrice <= counterPrice;
}

async function getUserOwnedQuantity(userId: string, assetId: string) {
  if (!db) return 0;

  const item = await db.portfolioItem.findFirst({
    where: {
      portfolio: { userId },
      assetId,
    },
  });

  return item?.quantity ?? 0;
}

async function getAssetMarketPrice(asset: any) {
  if (!db) return asset.currentPrice;
  if (!asset.oracleId) return asset.currentPrice;

  const oracle = await db.oracle.findUnique({
    where: { id: asset.oracleId },
    include: {
      verifications: {
        where: { assetId: asset.id },
        orderBy: { createdAt: "desc" },
        take: 3,
      },
    },
  });

  const verification = oracle?.verifications?.find((v: any) => v.status === "verified") ?? oracle?.verifications?.[0];
  const oraclePrice = verification?.results?.price ?? verification?.inputs?.price;

  return typeof oraclePrice === "number" && oraclePrice > 0 ? oraclePrice : asset.currentPrice;
}

async function validateTradeOrder(
  user: any,
  asset: any,
  side: "buy" | "sell",
  orderType: string,
  quantity: number,
  price: number,
) {
  if (!asset.isActive) {
    throw new Error("Asset is not tradable at this time");
  }

  const marketPrice = await getAssetMarketPrice(asset);
  const effectivePrice = orderType === "market" ? marketPrice : price;

  if (orderType === "limit") {
    if (effectivePrice > marketPrice * 1.25 || effectivePrice < marketPrice * 0.75) {
      throw new Error("Limit orders must remain within 25% of current market price for risk controls");
    }
  }

  if (asset.verificationScore < 40) {
    throw new Error("Asset is under review and temporarily restricted from new orders");
  }

  if (side === "sell") {
    const owned = await getUserOwnedQuantity(user.id, asset.id);
    if (quantity > owned) {
      throw new Error(`Insufficient position: you own ${owned} ${asset.symbol ?? asset.id} units`);
    }
  }

  const maxNotional = Math.max(1000, (asset.marketCap ?? 10000) * 0.05);
  if (quantity * effectivePrice > maxNotional) {
    throw new Error("Order size exceeds allowed notional limit; split into smaller trades.");
  }
}

async function attemptOrderMatching(order: any, asset: any) {
  if (!db || order.status === "filled" || order.remainingQuantity <= 0) {
    return order;
  }

  const assetPrice = await getAssetMarketPrice(asset);
  const oppositeSide = order.side === "buy" ? "sell" : "buy";
  const oppositeOrders = await db.order.findMany({
    where: {
      assetId: asset.id,
      side: oppositeSide,
      userId: { not: order.userId },
      status: { in: ["pending", "partially_filled"] },
      remainingQuantity: { gt: 0 },
    },
    orderBy: [
      { price: order.side === "buy" ? "asc" : "desc" },
      { createdAt: "asc" },
    ],
  });

  let remainingQuantity = order.remainingQuantity;
  let updatedOrder = order;

  for (const counter of oppositeOrders) {
    if (remainingQuantity <= 0) break;
    if (!canMatchOrders({ ...updatedOrder, orderType: order.orderType, price: updatedOrder.price }, counter, assetPrice)) {
      break;
    }

    const matchQuantity = Math.min(remainingQuantity, counter.remainingQuantity);
    const tradePrice = orderMatchingPrice({ ...updatedOrder, orderType: order.orderType, price: updatedOrder.price }, counter, assetPrice);
    const tradeTotal = matchQuantity * tradePrice;
    const buyOrderId = order.side === "buy" ? order.id : counter.id;
    const sellOrderId = order.side === "sell" ? order.id : counter.id;
    const now = new Date();

    const [counterUpdate, orderUpdate, createdTrade] = await db.$transaction([
      db.order.update({
        where: { id: counter.id },
        data: {
          filledQuantity: counter.filledQuantity + matchQuantity,
          remainingQuantity: counter.remainingQuantity - matchQuantity,
          status: counter.remainingQuantity - matchQuantity > 0 ? "partially_filled" : "filled",
          executedAt: counter.remainingQuantity - matchQuantity > 0 ? counter.executedAt : now,
        },
      }),
      db.order.update({
        where: { id: order.id },
        data: {
          filledQuantity: updatedOrder.filledQuantity + matchQuantity,
          remainingQuantity: { decrement: matchQuantity },
          status: remainingQuantity - matchQuantity > 0 ? "partially_filled" : "filled",
          executedAt: remainingQuantity - matchQuantity > 0 ? updatedOrder.executedAt : now,
        },
      }),
      db.trade.create({
        data: {
          buyOrderId,
          sellOrderId,
          assetId: asset.id,
          quantity: matchQuantity,
          price: tradePrice,
          totalValue: tradeTotal,
          status: "completed",
          executedAt: now,
        },
      }),
      db.asset.update({
        where: { id: asset.id },
        data: { currentPrice: tradePrice },
      }),
    ]);

    updatedOrder = orderUpdate;
    remainingQuantity -= matchQuantity;

    if (order.side === "buy") {
      await updatePortfolioAfterTrade(order.userId, asset, matchQuantity, tradePrice);
      await updatePortfolioAfterTrade(counter.userId, asset, -matchQuantity, tradePrice);
    } else {
      await updatePortfolioAfterTrade(counter.userId, asset, matchQuantity, tradePrice);
      await updatePortfolioAfterTrade(order.userId, asset, -matchQuantity, tradePrice);
    }

    await recordAudit("trade.execute", order.userId, "Trade", createdTrade.id, {
      buyOrderId,
      sellOrderId,
      quantity: matchQuantity,
      price: tradePrice,
    });
  }

  if (updatedOrder.status === "pending" && updatedOrder.remainingQuantity <= 0) {
    updatedOrder = await db.order.update({
      where: { id: updatedOrder.id },
      data: {
        status: "filled",
        executedAt: new Date(),
      },
    });
  }

  return updatedOrder;
}

async function updatePortfolioAfterTrade(userId: string, asset: any, quantity: number, price: number) {
  if (!db || quantity === 0) return;

  const isPurchase = quantity > 0;
  const portfolio = await db.portfolio.upsert({
    where: { userId },
    create: { userId, totalValue: quantity * price },
    update: { totalValue: { increment: quantity * price } },
  });

  const existingItem = await db.portfolioItem.findFirst({
    where: {
      portfolioId: portfolio.id,
      assetId: asset.id,
    },
  });

  if (existingItem) {
    const newQuantity = Math.max(0, existingItem.quantity + quantity);
    const avgPrice = newQuantity > 0 && isPurchase
      ? ((existingItem.avgPrice * existingItem.quantity) + price * quantity) / newQuantity
      : existingItem.avgPrice;

    await db.portfolioItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: newQuantity,
        avgPrice,
        currentValue: newQuantity * asset.currentPrice,
      },
    });
  } else if (quantity > 0) {
    await db.portfolioItem.create({
      data: {
        portfolioId: portfolio.id,
        assetId: asset.id,
        quantity,
        avgPrice: price,
        currentValue: quantity * asset.currentPrice,
      },
    });
  }

  if (quantity > 0) {
    const assetOwnershipPercentage = asset.totalSupply ? (quantity / asset.totalSupply) * 100 : 0;
    await db.assetOwnership.upsert({
      where: {
        assetId_userId: {
          assetId: asset.id,
          userId,
        },
      },
      create: {
        assetId: asset.id,
        userId,
        quantity,
        percentage: assetOwnershipPercentage,
        acquiredPrice: price,
        source: "trade",
      },
      update: {
        quantity: { increment: quantity },
        percentage: assetOwnershipPercentage,
        acquiredPrice: price,
      },
    });
  }
}

async function recordAudit(action: string, userId: string, resourceType: string, resourceId?: string, details?: any) {
  if (!db) return;
  await db.auditLog.create({
    data: {
      userId,
      userRole: "participant",
      action,
      resourceType,
      resourceId,
      result: "success",
      details,
    },
  });
}

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
    mpesaReference: z.string().min(1).max(100).optional(),
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

    const user = await resolveTradingUser(data.userId);
    if (!user) {
      throw new Error("Failed to resolve trading user");
    }

    if (data.type === "limit" && data.price === undefined) {
      throw new Error("Limit orders require a target price");
    }

    const price = data.price ?? asset.currentPrice;
    let order = await db.order.create({
      data: {
        userId: user.id,
        assetId: asset.id,
        side: data.side,
        orderType: data.type,
        quantity: data.quantity,
        filledQuantity: 0,
        remainingQuantity: data.quantity,
        price,
        status: "pending",
        mpesaReference: data.mpesaReference,
      },
    });

    await recordAudit("trade.create", user.id, "Order", order.id, {
      side: order.side,
      orderType: order.orderType,
      quantity: order.quantity,
      price: order.price,
    });

    const oppositeSide = data.side === "buy" ? "sell" : "buy";
    const oppositeOrders = await db.order.findMany({
      where: {
        assetId: asset.id,
        side: oppositeSide,
        userId: { not: user.id },
        status: { in: ["pending", "partially_filled"] },
        remainingQuantity: { gt: 0 },
      },
      orderBy: [
        { price: data.side === "buy" ? "asc" : "desc" },
        { createdAt: "asc" },
      ],
    });

    let remainingQuantity = order.quantity;
    let executedAt: Date | undefined;

    for (const counter of oppositeOrders) {
      if (remainingQuantity <= 0) break;
      if (!canMatchOrders({ ...order, orderType: data.type, price }, counter, asset.currentPrice)) {
        break;
      }

      const matchQuantity = Math.min(remainingQuantity, counter.remainingQuantity);
      const tradePrice = orderMatchingPrice({ ...order, orderType: data.type, price }, counter, asset.currentPrice);
      const tradeTotal = matchQuantity * tradePrice;

      const buyOrderId = order.side === "buy" ? order.id : counter.id;
      const sellOrderId = order.side === "sell" ? order.id : counter.id;
      const now = new Date();

      const [updatedCounter, updatedOrder, createdTrade] = await db.$transaction([
        db.order.update({
          where: { id: counter.id },
          data: {
            filledQuantity: counter.filledQuantity + matchQuantity,
            remainingQuantity: counter.remainingQuantity - matchQuantity,
            status: counter.remainingQuantity - matchQuantity > 0 ? "partially_filled" : "filled",
            executedAt: counter.remainingQuantity - matchQuantity > 0 ? counter.executedAt : now,
          },
        }),
        db.order.update({
          where: { id: order.id },
          data: {
            filledQuantity: order.filledQuantity + matchQuantity,
            remainingQuantity: { decrement: matchQuantity },
            status: remainingQuantity - matchQuantity > 0 ? "partially_filled" : "filled",
            executedAt: remainingQuantity - matchQuantity > 0 ? order.executedAt : now,
          },
        }),
        db.trade.create({
          data: {
            buyOrderId,
            sellOrderId,
            assetId: asset.id,
            quantity: matchQuantity,
            price: tradePrice,
            totalValue: tradeTotal,
            status: "completed",
            executedAt: now,
          },
        }),
        db.asset.update({
          where: { id: asset.id },
          data: { currentPrice: tradePrice },
        }),
      ]);

      trades.push(createdTrade);
      remainingQuantity -= matchQuantity;
      executedAt = now;
      order = updatedOrder;

      if (data.side === "buy") {
        await updatePortfolioAfterTrade(user.id, asset, matchQuantity, tradePrice);
        await updatePortfolioAfterTrade(updatedCounter.userId, asset, -matchQuantity, tradePrice);
      } else {
        await updatePortfolioAfterTrade(updatedCounter.userId, asset, matchQuantity, tradePrice);
        await updatePortfolioAfterTrade(user.id, asset, -matchQuantity, tradePrice);
      }

      await recordAudit("trade.execute", user.id, "Trade", createdTrade.id, {
        buyOrderId,
        sellOrderId,
        quantity: matchQuantity,
        price: tradePrice,
      });
    }

    if (order.status === "pending" && order.remainingQuantity === 0) {
      order = await db.order.update({
        where: { id: order.id },
        data: {
          status: "filled",
          executedAt: executedAt ?? new Date(),
        },
      });
    }

    return {
      id: order.id,
      userId: user.id,
      assetId: asset.id,
      side: order.side as TradingOrder["side"],
      type: order.orderType as TradingOrder["type"],
      quantity: order.quantity,
      price: order.price ?? undefined,
      status: order.status as TradingOrder["status"],
      filledQuantity: order.filledQuantity,
      remainingQuantity: order.remainingQuantity,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
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
        status: { in: ["pending", "partially_filled"] },
        remainingQuantity: { gt: 0 },
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
            existing.quantity += order.remainingQuantity;
            existing.orders += 1;
          } else {
            acc.push({ price, quantity: order.remainingQuantity, orders: 1 });
          }
          return acc;
        }, []);

      return grouped.sort((a, b) => (side === "buy" ? b.price - a.price : a.price - b.price));
    };

    const bids = aggregateSide("buy").slice(0, data.depth ?? 10);
    const asks = aggregateSide("sell").slice(0, data.depth ?? 10);
    const spread = bids.length && asks.length ? Math.max(0, asks[0].price - bids[0].price) : 0;
    const volume24h = await db.order.aggregate({
      _sum: { quantity: true },
      where: {
        assetId: data.assetId,
        status: { in: ["filled", "partially_filled"] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }).then((result) => result._sum.quantity ?? 0);

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
    if (!db) {
      return {
        id: `trade-${Date.now()}`,
        buyOrderId: data.buyOrderId,
        sellOrderId: data.sellOrderId,
        quantity: data.quantity,
        price: data.price,
        totalValue: data.quantity * data.price,
        executedAt: new Date(),
        status: "completed",
      };
    }

    const buyOrder = await db.order.findUnique({ where: { id: data.buyOrderId } });
    const sellOrder = await db.order.findUnique({ where: { id: data.sellOrderId } });
    if (!buyOrder || !sellOrder) {
      throw new Error("Both buy and sell orders must exist to execute a trade");
    }

    const asset = await db.asset.findUnique({ where: { id: buyOrder.assetId } });
    if (!asset) {
      throw new Error("Asset not found");
    }

    const now = new Date();
    const trade = await db.trade.create({
      data: {
        buyOrderId: buyOrder.id,
        sellOrderId: sellOrder.id,
        assetId: asset.id,
        quantity: data.quantity,
        price: data.price,
        totalValue: data.quantity * data.price,
        status: "completed",
        executedAt: now,
      },
    });

    await db.asset.update({ where: { id: asset.id }, data: { currentPrice: data.price } });

    if (buyOrder.remainingQuantity >= data.quantity) {
      await db.order.update({
        where: { id: buyOrder.id },
        data: {
          filledQuantity: buyOrder.filledQuantity + data.quantity,
          remainingQuantity: buyOrder.remainingQuantity - data.quantity,
          status: buyOrder.remainingQuantity - data.quantity > 0 ? "partially_filled" : "filled",
          executedAt: buyOrder.remainingQuantity - data.quantity > 0 ? buyOrder.executedAt : now,
        },
      });
    }

    if (sellOrder.remainingQuantity >= data.quantity) {
      await db.order.update({
        where: { id: sellOrder.id },
        data: {
          filledQuantity: sellOrder.filledQuantity + data.quantity,
          remainingQuantity: sellOrder.remainingQuantity - data.quantity,
          status: sellOrder.remainingQuantity - data.quantity > 0 ? "partially_filled" : "filled",
          executedAt: sellOrder.remainingQuantity - data.quantity > 0 ? sellOrder.executedAt : now,
        },
      });
    }

    return trade;
  });