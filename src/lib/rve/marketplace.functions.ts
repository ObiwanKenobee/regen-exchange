import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import db from "@/lib/db";
import { requireRBAC, Permission } from "@/lib/rbac";

// Marketplace Types
export interface Listing {
  id: string;
  assetId: string;
  sellerId: string;
  type: "sell" | "buy" | "auction" | "swap";
  status: "active" | "pending" | "completed" | "cancelled";
  quantity: number;
  unit: string;
  price: {
    rius: number;
    usd?: number;
    currency: string;
  };
  conditions: {
    minQuality: string;
    certifications: string[];
    location: string;
    deliveryTerms: string;
  };
  auction?: {
    startPrice: number;
    reservePrice: number;
    endTime: Date;
    bids: Array<{
      bidderId: string;
      amount: number;
      bidTime: Date;
    }>;
  };
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

export interface Order {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  type: "market" | "limit" | "auction";
  status: "pending" | "confirmed" | "fulfilled" | "cancelled" | "disputed";
  quantity: number;
  price: {
    rius: number;
    usd?: number;
  };
  escrow: {
    amount: number;
    released: boolean;
    releasedAt?: Date;
  };
  delivery: {
    status: "pending" | "shipped" | "delivered" | "completed";
    trackingId?: string;
    deliveryDate?: Date;
  };
  createdAt: Date;
  updatedAt: Date;
}

// Listing CRUD Operations

// CREATE Listing
export const createListing = createServerFn({ method: "POST" })
  .middleware([requireRBAC([Permission.CREATE_LISTING])])
  .inputValidator(
    z.object({
      assetId: z.string(),
      type: z.enum(["sell", "buy", "auction", "swap"]),
      quantity: z.number().positive(),
      unit: z.string(),
      price: z.object({
        rius: z.number().min(0),
        usd: z.number().min(0).optional(),
        currency: z.string().default("RIUS"),
      }),
      conditions: z.object({
        minQuality: z.string().default("C"),
        certifications: z.array(z.string()).default([]),
        location: z.string().optional(),
        deliveryTerms: z.string().optional(),
      }),
      auction: z.object({
        startPrice: z.number().min(0),
        reservePrice: z.number().min(0),
        duration: z.number().min(1), // hours
      }).optional(),
      expiresIn: z.number().default(30), // days
    })
  )
  .handler(async ({ data, context }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    const sellerId = (context as any)?.rbac?.userId;
    if (!sellerId) {
      throw new Error("Authentication required");
    }
    const expiresAt = new Date(Date.now() + data.expiresIn * 24 * 60 * 60 * 1000);
    const auctionData = data.auction
      ? {
          startPrice: data.auction.startPrice,
          reservePrice: data.auction.reservePrice,
          endTime: new Date(Date.now() + data.auction.duration * 60 * 60 * 1000),
          bids: [] as Array<{ bidderId: string; amount: number; bidTime: Date }>,
        }
      : null;

    const savedListing = await db.listing.create({
      data: {
        assetId: data.assetId,
        sellerId,
        type: data.type,
        status: "active",
        quantity: data.quantity,
        unit: data.unit,
        price: data.price.rius,
        usdPrice: data.price.usd,
        conditions: data.conditions,
        auctionData: auctionData ? {
          startPrice: auctionData.startPrice,
          reservePrice: auctionData.reservePrice,
          endTime: auctionData.endTime,
          bids: auctionData.bids,
        } : null,
        expiresAt,
      },
    });

    const newListing: Listing = {
      id: savedListing.id,
      assetId: savedListing.assetId,
      sellerId: savedListing.sellerId,
      type: savedListing.type as Listing["type"],
      status: savedListing.status as Listing["status"],
      quantity: savedListing.quantity,
      unit: savedListing.unit,
      price: {
        rius: savedListing.price,
        usd: savedListing.usdPrice || undefined,
        currency: "RIUS",
      },
      conditions: (savedListing.conditions as any) || {
        minQuality: "C",
        certifications: [],
      },
      auction: savedListing.auctionData
        ? {
            startPrice: savedListing.auctionData.startPrice,
            reservePrice: savedListing.auctionData.reservePrice,
            endTime: new Date(savedListing.auctionData.endTime),
            bids: (savedListing.auctionData.bids as any) || [],
          }
        : undefined,
      createdAt: savedListing.createdAt,
      updatedAt: savedListing.updatedAt,
      expiresAt: savedListing.expiresAt,
    };

    return newListing;
  });

// READ Listing
export const getListing = createServerFn({ method: "GET" })
  .middleware([])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // Mock implementation
    const mockListing: Listing = {
      id: data.id,
      assetId: "asset-1",
      sellerId: "steward-1",
      type: "sell",
      status: "active",
      quantity: 50,
      unit: "tCO2",
      price: {
        rius: 500,
        usd: 100,
        currency: "RIUS",
      },
      conditions: {
        minQuality: "A",
        certifications: ["Gold Standard"],
        location: "Kibera",
        deliveryTerms: "Digital delivery within 7 days",
      },
      createdAt: new Date("2026-05-01"),
      updatedAt: new Date(),
      expiresAt: new Date("2026-05-31"),
    };

    // TODO: Query from database
    // const listing = await db.listing.findUnique({ where: { id: data.id } });

    return mockListing;
  });

// READ Listings (with filters)
export const getListings = createServerFn({ method: "GET" })
  .middleware([])
  .inputValidator(
    z.object({
      type: z.enum(["sell", "buy", "auction", "swap"]).optional(),
      status: z.enum(["active", "pending", "completed", "cancelled"]).optional(),
      assetType: z.string().optional(),
      minPrice: z.number().optional(),
      maxPrice: z.number().optional(),
      location: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const mockListings: Listing[] = [
      {
        id: "listing-1",
        assetId: "asset-1",
        sellerId: "steward-1",
        type: "sell",
        status: "active",
        quantity: 50,
        unit: "tCO2",
        price: { rius: 500, usd: 100, currency: "RIUS" },
        conditions: { minQuality: "A", certifications: ["Gold Standard"], location: "Kibera", deliveryTerms: "Digital" },
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        id: "listing-2",
        assetId: "asset-2",
        sellerId: "steward-2",
        type: "auction",
        status: "active",
        quantity: 25,
        unit: "hectares",
        price: { rius: 750, usd: 150, currency: "RIUS" },
        conditions: { minQuality: "B", certifications: ["Biodiversity Standard"], location: "Westlands", deliveryTerms: "Physical" },
        auction: {
          startPrice: 750,
          reservePrice: 1000,
          endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          bids: [
            { bidderId: "steward-3", amount: 800, bidTime: new Date() },
            { bidderId: "steward-4", amount: 850, bidTime: new Date() },
          ],
        },
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ];

    // TODO: Query from database with filters
    // const listings = await db.listing.findMany({
    //   where: { ...filters },
    //   take: data.limit,
    //   skip: data.offset,
    // });

    return mockListings;
  });

// UPDATE Listing
export const updateListing = createServerFn({ method: "PATCH" })
  .middleware([])
  .inputValidator(
    z.object({
      id: z.string(),
      quantity: z.number().positive().optional(),
      price: z.object({
        rius: z.number().min(0).optional(),
        usd: z.number().min(0).optional(),
      }).optional(),
      conditions: z.object({
        minQuality: z.string().optional(),
        certifications: z.array(z.string()).optional(),
        location: z.string().optional(),
        deliveryTerms: z.string().optional(),
      }).optional(),
      status: z.enum(["active", "pending", "completed", "cancelled"]).optional(),
    })
  )
  .handler(async ({ data }) => {
    const { id, ...updates } = data;

    // Mock implementation
    const updatedListing = {
      id,
      ...updates,
      updatedAt: new Date(),
    };

    // TODO: Update in database
    // const listing = await db.listing.update({
    //   where: { id },
    //   data: { ...updates, updatedAt: new Date() },
    // });

    return updatedListing;
  });

// DELETE Listing
export const deleteListing = createServerFn({ method: "DELETE" })
  .middleware([])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // Mock implementation
    const result = { id: data.id, deleted: true, deletedAt: new Date() };

    // TODO: Delete listing (only if no active orders)
    // await db.listing.delete({ where: { id: data.id } });

    return result;
  });

// Order Operations

// CREATE Order
export const createOrder = createServerFn({ method: "POST" })
  .middleware([requireRBAC([Permission.EXECUTE_TRADE])])
  .inputValidator(
    z.object({
      listingId: z.string(),
      quantity: z.number().positive(),
      type: z.enum(["market", "limit", "auction"]).default("market"),
      bidAmount: z.number().min(0).optional(), // For auctions
    })
  )
  .handler(async ({ data, context }) => {
    const buyerId = (context as any)?.rbac?.userId;
    if (!buyerId) {
      throw new Error("Authentication required");
    }

    if (db) {
      const listing = await db.listing.findUnique({ where: { id: data.listingId } });
      if (!listing) {
        throw new Error("Listing not found");
      }

      const order = await db.order.create({
        data: {
          userId: buyerId,
          assetId: listing.assetId,
          side: "buy",
          orderType: data.type,
          quantity: data.quantity,
          price: listing.price,
          status: "pending",
        },
      });

      return {
        id: order.id,
        listingId: order.assetId ? data.listingId : data.listingId,
        buyerId,
        sellerId: listing.sellerId,
        type: order.orderType as Order["type"],
        status: order.status as Order["status"],
        quantity: order.quantity,
        price: { rius: order.price ?? 0, usd: undefined },
        escrow: {
          amount: order.quantity * (order.price ?? 0),
          released: false,
        },
        delivery: {
          status: "pending",
        },
        createdAt: order.createdAt,
        updatedAt: order.createdAt,
      };
    }

    const mockListing = {
      sellerId: "steward-1",
      price: { rius: 500, usd: 100 },
    };

    const newOrder: Order = {
      id: `order-${Date.now()}`,
      listingId: data.listingId,
      buyerId,
      sellerId: mockListing.sellerId,
      type: data.type,
      status: "pending",
      quantity: data.quantity,
      price: mockListing.price,
      escrow: {
        amount: data.quantity * mockListing.price.rius,
        released: false,
      },
      delivery: {
        status: "pending",
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return newOrder;
  });

// READ Order
export const getOrder = createServerFn({ method: "GET" })
  .middleware([])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // Mock implementation
    const mockOrder: Order = {
      id: data.id,
      listingId: "listing-1",
      buyerId: "steward-3",
      sellerId: "steward-1",
      type: "market",
      status: "confirmed",
      quantity: 10,
      price: { rius: 500, usd: 100 },
      escrow: {
        amount: 5000,
        released: false,
      },
      delivery: {
        status: "shipped",
        trackingId: "TRACK123456",
      },
      createdAt: new Date("2026-05-10"),
      updatedAt: new Date(),
    };

    // TODO: Query from database
    // const order = await db.order.findUnique({ where: { id: data.id } });

    return mockOrder;
  });

// READ Orders for User
export const getUserOrders = createServerFn({ method: "GET" })
  .middleware([])
  .inputValidator(
    z.object({
      userId: z.string().optional(), // Defaults to current user
      status: z.enum(["pending", "confirmed", "fulfilled", "cancelled", "disputed"]).optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const mockOrders: Order[] = [
      {
        id: "order-1",
        listingId: "listing-1",
        buyerId: "current-user",
        sellerId: "steward-1",
        type: "market",
        status: "confirmed",
        quantity: 10,
        price: { rius: 500 },
        escrow: { amount: 5000, released: false },
        delivery: { status: "pending" },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    // TODO: Query orders for user
    // const orders = await db.order.findMany({
    //   where: {
    //     OR: [
    //       { buyerId: userId },
    //       { sellerId: userId },
    //     ],
    //     status: data.status,
    //   },
    //   take: data.limit,
    //   skip: data.offset,
    // });

    return mockOrders;
  });

// Place Bid (for auctions)
export const placeBid = createServerFn({ method: "POST" })
  .middleware([requireRBAC([Permission.EXECUTE_TRADE])])
  .inputValidator(
    z.object({
      listingId: z.string(),
      amount: z.number().positive(),
    })
  )
  .handler(async ({ data, context }) => {
    const bidderId = (context as any)?.rbac?.userId;
    if (!bidderId) {
      throw new Error("Authentication required");
    }

    if (db) {
      const listing = await db.listing.findUnique({ where: { id: data.listingId } });
      if (!listing) {
        throw new Error("Listing not found");
      }
      if (listing.type !== "auction" || !listing.auctionData) {
        throw new Error("Listing is not an auction");
      }

      const auctionData = listing.auctionData as any;
      const bids = Array.isArray(auctionData.bids) ? auctionData.bids : [];
      const highestBid = bids.reduce((max: number, bid: any) => Math.max(max, bid.amount ?? 0), 0);
      if (data.amount <= highestBid) {
        throw new Error("Bid amount must exceed current highest bid");
      }

      const newBid = {
        bidId: `bid-${Date.now()}`,
        bidderId,
        amount: data.amount,
        bidTime: new Date(),
      };
      bids.push(newBid);

      await db.listing.update({
        where: { id: data.listingId },
        data: {
          auctionData: {
            ...auctionData,
            bids,
          },
        },
      });

      return {
        listingId: data.listingId,
        bidderId,
        amount: data.amount,
        bidTime: newBid.bidTime,
        bidId: newBid.bidId,
        isHighest: true,
      };
    }

    return {
      listingId: data.listingId,
      bidderId,
      amount: data.amount,
      bidTime: new Date(),
      bidId: `bid-${Date.now()}`,
      isHighest: true,
    };
  });

// Confirm Order
export const confirmOrder = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator(z.object({ orderId: z.string() }))
  .handler(async ({ data }) => {
    // Mock implementation
    const result = {
      orderId: data.orderId,
      status: "confirmed",
      confirmedAt: new Date(),
      escrowHeld: true,
    };

    // TODO: Confirm order and hold escrow
    // await db.order.update({
    //   where: { id: data.orderId },
    //   data: { status: "confirmed" },
    // });

    return result;
  });

// Complete Delivery
export const completeDelivery = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator(
    z.object({
      orderId: z.string(),
      trackingId: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const result = {
      orderId: data.orderId,
      deliveryStatus: "delivered",
      deliveredAt: new Date(),
      trackingId: data.trackingId,
    };

    // TODO: Mark delivery as complete
    // await db.order.update({
    //   where: { id: data.orderId },
    //   data: {
    //     delivery: {
    //       status: "delivered",
    //       deliveryDate: new Date(),
    //       trackingId: data.trackingId,
    //     },
    //   },
    // });

    return result;
  });

// Release Escrow
export const releaseEscrow = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator(z.object({ orderId: z.string() }))
  .handler(async ({ data }) => {
    // Mock implementation
    const result = {
      orderId: data.orderId,
      escrowReleased: true,
      releasedAt: new Date(),
      amount: 5000,
      toUserId: "steward-1",
    };

    // TODO: Release escrow to seller
    // await db.order.update({
    //   where: { id: data.orderId },
    //   data: {
    //     escrow: { released: true, releasedAt: new Date() },
    //     status: "fulfilled",
    //   },
    // });

    return result;
  });