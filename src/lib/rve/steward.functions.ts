import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import db from "@/lib/db";

// Steward Management Types
export interface Steward {
  id: string;
  name: string;
  phone: string;
  email?: string;
  location: string;
  skills: string[];
  reputation: {
    steward: number;
    oracle: number;
    research: number;
    civic: number;
    builder: number;
  };
  ridScore: number;
  riusEarned: number;
  missionsCompleted: number;
  certifications: string[];
  joinedAt: Date;
  lastActive: Date;
  isActive: boolean;
  avatar?: string;
  bio?: string;
}

// Steward CRUD Operations

// CREATE Steward
export const createSteward = createServerFn({ method: "POST" })
  .middleware([])
  .validator(
    z.object({
      name: z.string().min(1),
      phone: z.string().min(10),
      email: z.string().email().optional(),
      location: z.string().min(1),
      skills: z.array(z.string()).default([]),
    })
  )
  .handler(async ({ data }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    // Create user in database
    const user = await db.user.create({
      data: {
        did: `did:rve:${Date.now()}`, // Generate a DID for the steward
        ridScore: 0,
        mpesaNumber: data.phone,
        email: data.email,
        reputationHistory: {
          steward: 0,
          oracle: 0,
          research: 0,
          civic: 0,
          builder: 0,
        },
      },
    });

    // Return steward object mapped from user
    const newSteward: Steward = {
      id: user.id,
      name: data.name,
      phone: data.phone,
      email: data.email,
      location: data.location,
      skills: data.skills,
      reputation: {
        steward: 0,
        oracle: 0,
        research: 0,
        civic: 0,
        builder: 0,
      },
      ridScore: user.ridScore,
      riusEarned: 0,
      missionsCompleted: 0,
      certifications: [],
      joinedAt: user.createdAt,
      lastActive: user.updatedAt,
      isActive: true,
    };

    return newSteward;
  });

// READ Steward
export const getSteward = createServerFn({ method: "GET" })
  .middleware([])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    const user = await db.user.findUnique({
      where: { id: data.id },
      include: {
        orders: true,
        portfolio: true,
        riuStakes: true,
        governanceVotes: true,
      },
    });

    if (!user) {
      throw new Error("Steward not found");
    }

    // Map user to steward interface
    const steward: Steward = {
      id: user.id,
      name: user.did || "Unknown Steward", // For now, using DID as name placeholder
      phone: user.mpesaNumber || "",
      email: user.email,
      location: "Unknown", // Location not stored in User model yet
      skills: [], // Skills not stored in User model yet
      reputation: (user.reputationHistory as any) || {
        steward: 0,
        oracle: 0,
        research: 0,
        civic: 0,
        builder: 0,
      },
      ridScore: user.ridScore,
      riusEarned: user.riuStakes.reduce((sum, stake) => sum + stake.amount, 0),
      missionsCompleted: 0, // TODO: Calculate from mission participations
      certifications: [], // TODO: Add certification system
      joinedAt: user.createdAt,
      lastActive: user.updatedAt,
      isActive: true, // TODO: Add active status logic
    };

    return steward;
  });

// READ All Stewards
export const getStewards = createServerFn({ method: "GET" })
  .middleware([])
  .validator(
    z.object({
      location: z.string().optional(),
      skills: z.array(z.string()).optional(),
      minRidScore: z.number().optional(),
      limit: z.number().default(50),
      offset: z.number().default(0),
    })
  )
  .handler(async ({ data }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    // Build where clause for filtering
    const where: any = {};
    if (data.minRidScore) {
      where.ridScore = { gte: data.minRidScore };
    }

    const users = await db.user.findMany({
      where,
      include: {
        orders: true,
        portfolio: true,
        riuStakes: true,
        governanceVotes: true,
      },
      take: data.limit,
      skip: data.offset,
      orderBy: { createdAt: 'desc' },
    });

    // Map users to stewards
    const stewards: Steward[] = users.map(user => ({
      id: user.id,
      name: user.did || "Unknown Steward",
      phone: user.mpesaNumber || "",
      email: user.email,
      location: "Unknown", // TODO: Add location field to User model
      skills: [], // TODO: Add skills field to User model
      reputation: (user.reputationHistory as any) || {
        steward: 0,
        oracle: 0,
        research: 0,
        civic: 0,
        builder: 0,
      },
      ridScore: user.ridScore,
      riusEarned: user.riuStakes.reduce((sum, stake) => sum + stake.amount, 0),
      missionsCompleted: 0, // TODO: Calculate from mission participations
      certifications: [], // TODO: Add certification system
      joinedAt: user.createdAt,
      lastActive: user.updatedAt,
      isActive: true, // TODO: Add active status logic
    }));

    return stewards;
  });

// UPDATE Steward
export const updateSteward = createServerFn({ method: "PATCH" })
  .middleware([])
  .validator(
    z.object({
      id: z.string(),
      name: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().email().optional(),
      location: z.string().optional(),
      skills: z.array(z.string()).optional(),
      bio: z.string().optional(),
      avatar: z.string().optional(),
    })
  )
  .handler(async ({ data }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    const { id, ...updates } = data;

    // Prepare update data for User model
    const updateData: any = {
      updatedAt: new Date(),
    };

    if (updates.email) updateData.email = updates.email;
    if (updates.phone) updateData.mpesaNumber = updates.phone;
    // TODO: Add fields for name, location, skills, bio, avatar to User model

    const user = await db.user.update({
      where: { id },
      data: updateData,
      include: {
        orders: true,
        portfolio: true,
        riuStakes: true,
        governanceVotes: true,
      },
    });

    // Map updated user back to steward
    const updatedSteward: Partial<Steward> = {
      id: user.id,
      name: updates.name || user.did || "Unknown Steward",
      phone: updates.phone || user.mpesaNumber || "",
      email: updates.email || user.email,
      location: updates.location, // TODO: Store in user metadata
      skills: updates.skills, // TODO: Store in user metadata
      bio: updates.bio, // TODO: Store in user metadata
      avatar: updates.avatar, // TODO: Store in user metadata
      lastActive: user.updatedAt,
    };

    return updatedSteward;
  });

// DELETE Steward (Soft Delete)
export const deleteSteward = createServerFn({ method: "DELETE" })
  .middleware([])
  .validator(z.object({ id: z.string() }))
  .handler(async ({ data }) => {
    if (!db) {
      throw new Error("Database not configured");
    }

    // For now, we'll just update the user to mark as inactive
    // TODO: Add isActive field to User model for proper soft deletes
    await db.user.update({
      where: { id: data.id },
      data: { updatedAt: new Date() },
    });

    return { id: data.id, deleted: true, deletedAt: new Date() };
  });

// Update Steward Reputation
export const updateStewardReputation = createServerFn({ method: "POST" })
  .middleware([])
  .validator(
    z.object({
      stewardId: z.string(),
      domain: z.enum(["steward", "oracle", "research", "civic", "builder"]),
      score: z.number().min(0).max(100),
      reason: z.string(),
    })
  )
  .handler(async ({ data }) => {
    // Mock implementation
    const result = {
      stewardId: data.stewardId,
      domain: data.domain,
      previousScore: 75,
      newScore: data.score,
      reason: data.reason,
      updatedAt: new Date(),
    };

    // TODO: Update reputation in database
    // await db.stewardReputation.upsert({
    //   where: { stewardId_domain: { stewardId: data.stewardId, domain: data.domain } },
    //   update: { score: data.score, updatedAt: new Date() },
    //   create: { stewardId: data.stewardId, domain: data.domain, score: data.score },
    // });

    return result;
  });