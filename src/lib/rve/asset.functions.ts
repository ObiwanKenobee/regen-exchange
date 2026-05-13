import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import db from "@/lib/db";

// Asset Types
export interface Asset {
  id: string;
  name: string;
  type: "carbon_credit" | "biodiversity_unit" | "water_right" | "land_right" | "renewable_energy";
  category: "environmental" | "social" | "economic";
  description: string;
  location: {
    name: string;
    coordinates: [number, number];
    region: string;
  };
  quantity: number;
  unit: string; // "tCO2", "hectares", "m³", etc.
  quality: {
    grade: "A" | "B" | "C" | "D";
    score: number; // 0-100
    certifications: string[];
  };
  ownership: {
    stewardId: string;
    percentage: number;
    acquiredAt: Date;
  }[];
  valuation: {
    riusValue: number;
    usdValue: number;
    lastUpdated: Date;
    methodology: string;
  };
  verification: {
    oracleId: string;
    status: "pending" | "verified" | "failed";
    confidence: number;
    lastVerified: Date;
  };
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

// Asset CRUD Operations

// CREATE Asset
export const createAsset = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator(
    z.object({
      name: z.string().min(1),
      type: z.enum(["carbon_credit", "biodiversity_unit", "water_right", "land_right", "renewable_energy"]),
      category: z.enum(["environmental", "social", "economic"]),
      description: z.string().min(10),
      location: z.object({
        name: z.string(),
        coordinates: z.tuple([z.number(), z.number()]),
        region: z.string(),
      }),
      quantity: z.number().positive(),
      unit: z.string().min(1),
      quality: z.object({
        grade: z.enum(["A", "B", "C", "D"]),
        score: z.number().min(0).max(100),
        certifications: z.array(z.string()).default([]),
      }),
      valuation: z.object({
        riusValue: z.number().min(0),
        usdValue: z.number().min(0),
        methodology: z.string(),
      }),
      metadata: z.record(z.any()).default({}),
    })
  )
  .handler(async ({ data }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    // Map the input data to Prisma Asset model
    const assetData = {
      symbol: `${data.type.toUpperCase()}_${Date.now()}`, // Generate a unique symbol
      name: data.name,
      type: data.type,
      category: data.category,
      description: data.description,
      totalSupply: data.quantity,
      currentPrice: data.valuation.riusValue,
      marketCap: data.valuation.usdValue * data.quantity,
      verificationScore: data.quality.score,
      unit: data.unit,
      metadata: {
        location: data.location,
        quality: data.quality,
        valuation: data.valuation,
        ...data.metadata,
      },
    };

    const asset = await db.asset.create({
      data: assetData,
    });

    // Map back to Asset interface
    const newAsset: Asset = {
      id: asset.id,
      name: asset.name,
      type: asset.type as Asset['type'],
      category: data.category,
      description: asset.description || "",
      location: data.location,
      quantity: asset.totalSupply || 0,
      unit: data.unit,
      quality: data.quality,
      ownership: [], // TODO: Implement ownership tracking
      valuation: {
        riusValue: asset.currentPrice,
        usdValue: data.valuation.usdValue,
        lastUpdated: asset.updatedAt,
        methodology: data.valuation.methodology,
      },
      verification: {
        oracleId: asset.oracleId || "",
        status: "pending",
        confidence: asset.verificationScore,
        lastVerified: asset.updatedAt,
      },
      metadata: asset.metadata as Record<string, any>,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      isActive: true, // TODO: Add active status to Asset model
    };

    return newAsset;
  });

// READ Asset
export const getAsset = createServerFn({ method: "GET" })
  .middleware([])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    const asset = await db.asset.findUnique({
      where: { id: data.id },
      include: {
        orders: true,
        portfolioItems: true,
      },
    });

    if (!asset) {
      throw new Error("Asset not found");
    }

    // Extract metadata fields
    const metadata = (asset.metadata as any) || {};

    // Map Prisma Asset to Asset interface
    const assetData: Asset = {
      id: asset.id,
      name: asset.name,
      type: asset.type as Asset['type'],
      category: asset.category as Asset['category'] || "environmental",
      description: asset.description || "",
      location: metadata.location || {
        name: "Unknown",
        coordinates: [0, 0],
        region: "Unknown",
      },
      quantity: asset.totalSupply || 0,
      unit: asset.unit || "units",
      quality: metadata.quality || {
        grade: "C",
        score: asset.verificationScore,
        certifications: [],
      },
      ownership: [], // TODO: Implement ownership tracking from asset.ownerships
      valuation: {
        riusValue: asset.currentPrice,
        usdValue: metadata.valuation?.usdValue || 0,
        lastUpdated: asset.updatedAt,
        methodology: metadata.valuation?.methodology || "Standard valuation",
      },
      verification: {
        oracleId: asset.oracleId || "",
        status: "verified", // TODO: Add verification status to Asset model
        confidence: asset.verificationScore,
        lastVerified: asset.updatedAt,
      },
      metadata: asset.metadata as Record<string, any>,
      createdAt: asset.createdAt,
      updatedAt: asset.updatedAt,
      isActive: asset.isActive,
    };

    return assetData;
  });

// READ Assets (with filters)
export const getAssets = createServerFn({ method: "GET" })
  .middleware([])
  .inputValidator(
    z.object({
      type: z.enum(["carbon_credit", "biodiversity_unit", "water_right", "land_right", "renewable_energy"]).optional(),
      category: z.enum(["environmental", "social", "economic"]).optional(),
      region: z.string().optional(),
      minQuality: z.number().optional(),
      minValue: z.number().optional(),
      stewardId: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const mockAssets: Asset[] = [
      {
        id: "asset-1",
        name: "Kibera Urban Forest Carbon Credits",
        type: "carbon_credit",
        category: "environmental",
        description: "Carbon credits from urban reforestation",
        location: { name: "Kibera", coordinates: [-1.3125, 36.7833], region: "Kibera" },
        quantity: 250,
        unit: "tCO2",
        quality: { grade: "A", score: 92, certifications: ["Gold Standard"] },
        ownership: [{ stewardId: "steward-1", percentage: 100, acquiredAt: new Date() }],
        valuation: { riusValue: 125000, usdValue: 25000, lastUpdated: new Date(), methodology: "SCC" },
        verification: { oracleId: "oracle-1", status: "verified", confidence: 96.5, lastVerified: new Date() },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
      {
        id: "asset-2",
        name: "Westlands Biodiversity Units",
        type: "biodiversity_unit",
        category: "environmental",
        description: "Biodiversity conservation credits",
        location: { name: "Westlands", coordinates: [-1.2630, 36.8065], region: "Westlands" },
        quantity: 50,
        unit: "hectares",
        quality: { grade: "B", score: 85, certifications: ["Biodiversity Standard"] },
        ownership: [{ stewardId: "steward-2", percentage: 100, acquiredAt: new Date() }],
        valuation: { riusValue: 75000, usdValue: 15000, lastUpdated: new Date(), methodology: "Biodiversity Valuation" },
        verification: { oracleId: "oracle-2", status: "verified", confidence: 89.2, lastVerified: new Date() },
        metadata: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      },
    ];

    // TODO: Query from database with filters
    // const assets = await db.asset.findMany({
    //   where: { ...filters },
    //   include: { ownership: true },
    //   take: data.limit,
    //   skip: data.offset,
    // });

    return mockAssets;
  });

// UPDATE Asset
export const updateAsset = createServerFn({ method: "PATCH" })
  .middleware([])
  .inputValidator(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
      quantity: z.number().positive().optional(),
      quality: z.object({
        grade: z.enum(["A", "B", "C", "D"]).optional(),
        score: z.number().min(0).max(100).optional(),
        certifications: z.array(z.string()).optional(),
      }).optional(),
      valuation: z.object({
        riusValue: z.number().min(0).optional(),
        usdValue: z.number().min(0).optional(),
        methodology: z.string().optional(),
      }).optional(),
      metadata: z.record(z.any()).optional(),
    })
  )
  .handler(async ({ data }) => {
    const { id, ...updates } = data;

    // Mock implementation
    const updatedAsset = {
      id,
      ...updates,
      updatedAt: new Date(),
    };

    // TODO: Update in database
    // const asset = await db.asset.update({
    //   where: { id },
    //   data: { ...updates, updatedAt: new Date() },
    // });

    return updatedAsset;
  });

// DELETE Asset
export const deleteAsset = createServerFn({ method: "DELETE" })
  .middleware([])
  .inputValidator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    // Mock implementation
    const result = { id: data.id, deleted: true, deletedAt: new Date() };

    // TODO: Soft delete or hard delete based on business rules
    // await db.asset.update({
    //   where: { id: data.id },
    //   data: { isActive: false, deletedAt: new Date() },
    // });

    return result;
  });

// Transfer Asset Ownership
export const transferAssetOwnership = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator(
    z.object({
      assetId: z.string(),
      fromStewardId: z.string(),
      toStewardId: z.string(),
      percentage: z.number().min(0).max(100),
      transferReason: z.string(),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const result = {
      assetId: data.assetId,
      fromStewardId: data.fromStewardId,
      toStewardId: data.toStewardId,
      percentage: data.percentage,
      transferReason: data.transferReason,
      transferredAt: new Date(),
      transactionId: `transfer-${Date.now()}`,
    };

    // TODO: Handle asset ownership transfer
    // - Update ownership records
    // - Create transfer transaction
    // - Update asset valuation if needed
    // - Trigger verification if required

    return result;
  });

// Update Asset Valuation
export const updateAssetValuation = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator(
    z.object({
      assetId: z.string(),
      riusValue: z.number().min(0),
      usdValue: z.number().min(0),
      methodology: z.string(),
      reason: z.string(),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const result = {
      assetId: data.assetId,
      previousValue: { riusValue: 100000, usdValue: 20000 },
      newValue: { riusValue: data.riusValue, usdValue: data.usdValue },
      methodology: data.methodology,
      reason: data.reason,
      updatedAt: new Date(),
    };

    // TODO: Update asset valuation in database
    // await db.asset.update({
    //   where: { id: data.assetId },
    //   data: {
    //     valuation: {
    //       riusValue: data.riusValue,
    //       usdValue: data.usdValue,
    //       methodology: data.methodology,
    //       lastUpdated: new Date(),
    //     },
    //   },
    // });

    return result;
  });

// Verify Asset
export const verifyAsset = createServerFn({ method: "POST" })
  .middleware([])
  .inputValidator(
    z.object({
      assetId: z.string(),
      oracleId: z.string(),
      verificationData: z.record(z.any()),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const result = {
      assetId: data.assetId,
      oracleId: data.oracleId,
      status: "verified",
      confidence: 94.2,
      verifiedAt: new Date(),
      verificationId: `verification-${Date.now()}`,
    };

    // TODO: Trigger oracle verification process
    // - Send data to oracle
    // - Update verification status
    // - Store verification results

    return result;
  });