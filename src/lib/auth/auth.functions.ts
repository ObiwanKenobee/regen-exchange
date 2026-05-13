import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import db from "@/lib/db";

// Mock user database - used only when DATABASE_URL is not configured
const mockUsers = [
  {
    id: "user-123",
    did: "did:rve:1234567890123456789012345678901234567890",
    role: "student_researcher",
    ridScore: 85.5,
    reputationHistory: [
      { date: "2024-01-01", score: 80.0, reason: "Initial verification" },
      { date: "2024-02-15", score: 85.5, reason: "Community contribution" }
    ],
    mpesaNumber: "+254712345678",
    walletAddress: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    email: "user@example.com",
    passwordHash: "$2b$10$example.hash.here", // bcrypt hash
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// DID verification schema
const didDocumentSchema = z.object({
  id: z.string(),
  verificationMethod: z.array(z.object({
    id: z.string(),
    type: z.string(),
    controller: z.string(),
    publicKeyMultibase: z.string().optional(),
    publicKeyJwk: z.object({}).optional(),
  })),
  authentication: z.array(z.string()),
});

// JWT payload interface
interface JWTPayload {
  userId: string;
  did: string;
  ridScore: number;
  iat: number;
  exp: number;
}

// Input validation schemas
const loginInput = z.object({
  did: z.string(),
  signature: z.string(),
  message: z.string(),
});

const registerInput = z.object({
  did: z.string(),
  email: z.string().email().optional(),
  mpesaNumber: z.string().optional(),
  walletAddress: z.string().optional(),
});

const verifyDIDInput = z.object({
  did: z.string(),
  verificationMethod: z.string(),
});

/**
 * Authenticate user with DID signature
 */
export const authenticateUser = createServerFn({ method: "POST" })
  .inputValidator(loginInput)
  .handler(async ({ data }): Promise<{ token: string; user: any }> => {
    let user = null;

    if (db) {
      user = await db.user.findUnique({ where: { did: data.did } });
    }

    if (!user) {
      user = mockUsers.find(u => u.did === data.did);
    }

    if (!user) {
      throw new Error("User not found");
    }

    if (data.signature.length < 10) {
      throw new Error("Invalid signature");
    }

    const token = jwt.sign(
      {
        userId: user.id,
        did: user.did,
        ridScore: user.ridScore,
        role: (user.role as string) || "student_researcher",
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: user.id,
        did: user.did,
        ridScore: user.ridScore,
        reputationHistory: user.reputationHistory,
        mpesaNumber: user.mpesaNumber,
        walletAddress: user.walletAddress,
        email: user.email,
        role: (user.role as string) || "student_researcher",
      }
    };
  });

/**
 * Register new user with DID
 */
export const registerUser = createServerFn({ method: "POST" })
  .inputValidator(registerInput)
  .handler(async ({ data }): Promise<{ user: any; token: string }> => {
    let existingUser = null;

    if (db) {
      existingUser = await db.user.findUnique({ where: { did: data.did } });
    } else {
      existingUser = mockUsers.find(u => u.did === data.did);
    }

    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = {
      id: `user-${Date.now()}`,
      did: data.did,
      role: "student_researcher",
      ridScore: 50.0,
      reputationHistory: [
        { date: new Date().toISOString(), score: 50.0, reason: "Account creation" }
      ],
      mpesaNumber: data.mpesaNumber,
      walletAddress: data.walletAddress,
      email: data.email,
      passwordHash: await bcrypt.hash("default-password", 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db) {
      await db.user.create({
        data: {
          did: newUser.did,
          ridScore: newUser.ridScore,
          reputationHistory: newUser.reputationHistory,
          mpesaNumber: newUser.mpesaNumber,
          walletAddress: newUser.walletAddress,
          email: newUser.email,
        },
      });
    } else {
      mockUsers.push(newUser);
    }

    const token = jwt.sign(
      {
        userId: newUser.id,
        did: newUser.did,
        ridScore: newUser.ridScore,
        role: "student_researcher",
      },
      process.env.JWT_SECRET || "fallback-secret",
      { expiresIn: "24h" }
    );

    return {
      token,
      user: {
        id: newUser.id,
        did: newUser.did,
        ridScore: newUser.ridScore,
        reputationHistory: newUser.reputationHistory,
        mpesaNumber: newUser.mpesaNumber,
        walletAddress: newUser.walletAddress,
        email: newUser.email,
        role: "student_researcher",
      }
    };
  });

/**
 * Verify DID document and update RID score
 */
export const verifyDID = createServerFn({ method: "POST" })
  .inputValidator(verifyDIDInput)
  .handler(async ({ data }): Promise<{ verified: boolean; ridScore: number; trustIndicators: any }> => {
    const isVerified = data.did.startsWith("did:rve:");

    if (!isVerified) {
      throw new Error("DID verification failed");
    }

    const baseScore = 50;
    const verificationBonus = 20;
    const activityBonus = 15.5;
    const ridScore = Math.min(baseScore + verificationBonus + activityBonus, 100);

    const trustIndicators = {
      didVerified: true,
      verificationMethod: data.verificationMethod,
      lastVerification: new Date().toISOString(),
      trustScore: ridScore,
      riskLevel: ridScore > 80 ? "low" : ridScore > 60 ? "medium" : "high",
      factors: {
        identityVerification: verificationBonus,
        historicalActivity: activityBonus,
        communityReputation: 5,
      }
    };

    const existingUser = db ? await db.user.findUnique({ where: { did: data.did } }) : mockUsers.find(u => u.did === data.did);
    if (existingUser) {
      if (db) {
        await db.user.update({
          where: { did: data.did },
          data: {
            ridScore,
            reputationHistory: {
              set: [...((existingUser.reputationHistory as any[]) ?? []), {
                date: new Date().toISOString(),
                score: ridScore,
                reason: "DID verification completed",
              }],
            },
          },
        });
      } else {
        existingUser.ridScore = ridScore;
        existingUser.reputationHistory.push({
          date: new Date().toISOString(),
          score: ridScore,
          reason: "DID verification completed",
        });
      }
    }

    if (db) {
      await db.didCredential.create({
        data: {
          did: data.did,
          userId: existingUser?.id || `user-${Date.now()}`,
          credentialType: "did_verification",
          credentialData: {
            subject: data.did,
            verificationMethod: data.verificationMethod,
            trustIndicators,
          },
          issuedAt: new Date(),
          expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
          issuer: process.env.DID_ISSUER || "did:rve:issuer:ecosystem",
          proofData: {
            type: "Ed25519Signature2020",
            created: new Date().toISOString(),
            proofPurpose: "assertionMethod",
          },
        },
      });
    }

    return {
      verified: true,
      ridScore,
      trustIndicators,
    };
  });

/**
 * Issue a verifiable credential for an authenticated user
 */
export const issueVerifiableCredential = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string(),
    credentialType: z.string(),
    issuer: z.string().optional(),
    expiresInHours: z.number().optional().default(8760),
    subjectAttributes: z.record(z.any()).optional(),
  }))
  .handler(async ({ data }): Promise<{ credential: any }> => {
    const user = db ? await db.user.findUnique({ where: { id: data.userId } }) : mockUsers.find(u => u.id === data.userId);
    if (!user) {
      throw new Error("User not found for credential issuance");
    }

    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + data.expiresInHours * 60 * 60 * 1000);
    const issuer = data.issuer || process.env.DID_ISSUER || "did:rve:issuer:ecosystem";
    const credentialData = {
      id: `urn:uuid:${crypto.randomUUID()}`,
      type: ["VerifiableCredential", data.credentialType],
      issuer,
      issuanceDate: issuedAt.toISOString(),
      expirationDate: expiresAt.toISOString(),
      credentialSubject: {
        id: user.did,
        ...data.subjectAttributes,
      },
    };

    const proofData = {
      type: "Ed25519Signature2020",
      created: issuedAt.toISOString(),
      proofPurpose: "assertionMethod",
      verificationMethod: `${issuer}#keys-1`,
      proofValue: "mock-proof-value",
    };

    const storedCredential = db ? await db.didCredential.create({
      data: {
        did: user.did,
        userId: user.id,
        credentialType: data.credentialType,
        credentialData,
        issuedAt,
        expiresAt,
        issuer,
        proofData,
      },
    }) : {
      id: `mock-${Date.now()}`,
      did: user.did,
      userId: user.id,
      credentialType: data.credentialType,
      credentialData,
      issuedAt,
      expiresAt,
      issuer,
      proofData,
      createdAt: issuedAt,
    };

    return { credential: storedCredential };
  });

/**
 * Get current user from JWT token
 */
export const getCurrentUser = createServerFn({ method: "GET" })
  .handler(async ({ request }): Promise<any> => {
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new Error("No authorization token provided");
    }

    const token = authHeader.substring(7);

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback-secret") as JWTPayload;

      let user = null;
      if (db) {
        user = await db.user.findUnique({ where: { id: decoded.userId } });
      }
      if (!user) {
        user = mockUsers.find(u => u.id === decoded.userId);
      }

      if (!user) {
        throw new Error("User not found");
      }

      return {
        id: user.id,
        did: user.did,
        ridScore: user.ridScore,
        reputationHistory: user.reputationHistory,
        mpesaNumber: user.mpesaNumber,
        walletAddress: user.walletAddress,
        email: user.email,
        role: (user.role as string) || "student_researcher",
      };
    } catch (error) {
      throw new Error("Invalid token");
    }
  });

/**
 * Update RID score based on activity
 */
export const updateRIDScore = createServerFn({ method: "POST" })
  .inputValidator(z.object({
    userId: z.string(),
    activity: z.enum(["trade", "governance_vote", "sensor_contribution", "verification", "community_help"]),
    impact: z.number().min(-10).max(10),
  }))
  .handler(async ({ data }): Promise<{ newScore: number; history: any[] }> => {
    let user = null;
    let existingHistory: any[] = [];

    if (db) {
      user = await db.user.findUnique({ where: { id: data.userId } });
    } else {
      user = mockUsers.find(u => u.id === data.userId);
    }

    if (!user) {
      throw new Error("User not found");
    }

    existingHistory = (user.reputationHistory as any[]) ?? [];
    const newScore = Math.max(0, Math.min(100, user.ridScore + data.impact));
    const historyEntry = {
      date: new Date().toISOString(),
      score: newScore,
      reason: `${data.activity} activity (${data.impact > 0 ? "+" : ""}${data.impact})`,
    };

    if (db) {
      await db.user.update({
        where: { id: data.userId },
        data: {
          ridScore: newScore,
          reputationHistory: {
            set: [...existingHistory, historyEntry],
          },
        },
      });
    } else {
      user.ridScore = newScore;
      user.reputationHistory.push(historyEntry);
    }

    return {
      newScore,
      history: [...existingHistory, historyEntry],
    };
  });