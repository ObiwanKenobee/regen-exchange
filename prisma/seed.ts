import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Seeding database...");

  // Create sample users (stewards)
  const user1 = await prisma.user.create({
    data: {
      did: "did:rve:steward-001",
      name: "Amina Hassan",
      mpesaNumber: "+254712345678",
      email: "amina@example.com",
      location: "Kibera, Nairobi",
      skills: ["waste_management", "tree_monitoring", "community_education"],
      certifications: ["Waste Management Specialist", "Tree Monitoring Expert"],
      ridScore: 78,
      reputationHistory: {
        steward: 85,
        oracle: 72,
        research: 91,
        civic: 78,
        builder: 64,
      },
    },
  });

  const user2 = await prisma.user.create({
    data: {
      did: "did:rve:steward-002",
      name: "Jomo Kenyatta",
      mpesaNumber: "+254723456789",
      email: "jomo@example.com",
      location: "Westlands, Nairobi",
      skills: ["biodiversity", "community_education", "solar_installation"],
      certifications: ["Biodiversity Expert", "Community Educator"],
      ridScore: 84,
      reputationHistory: {
        steward: 92,
        oracle: 88,
        research: 76,
        civic: 95,
        builder: 71,
      },
    },
  });

  // Create sample assets
  const asset1 = await prisma.asset.create({
    data: {
      symbol: "CARBON_KIBERA_001",
      name: "Kibera Urban Forest Carbon Credits",
      type: "carbon_credit",
      category: "environmental",
      description: "Carbon sequestration credits from urban reforestation project in Kibera slum, Nairobi.",
      totalSupply: 250,
      currentPrice: 125000,
      marketCap: 31250000,
      verificationScore: 92,
      unit: "tCO2",
      metadata: {
        location: {
          name: "Kibera Urban Forest",
          coordinates: [-1.3125, 36.7833],
          region: "Kibera",
        },
        quality: {
          grade: "A",
          score: 92,
          certifications: ["Gold Standard", "Verified Carbon Standard"],
        },
        valuation: {
          riusValue: 125000,
          usdValue: 25000,
          methodology: "Social Cost of Carbon + Local Impact Multiplier",
        },
      },
    },
  });

  const asset2 = await prisma.asset.create({
    data: {
      symbol: "WATER_NAIROBI_001",
      name: "Nairobi Water Rights",
      type: "water_right",
      category: "environmental",
      description: "Water rights from community-managed rainwater harvesting systems.",
      totalSupply: 1000,
      currentPrice: 50000,
      marketCap: 50000000,
      verificationScore: 88,
      unit: "m³",
      metadata: {
        location: {
          name: "Nairobi County",
          coordinates: [-1.2864, 36.8172],
          region: "Nairobi",
        },
        quality: {
          grade: "B",
          score: 88,
          certifications: ["ISO 14001", "Water Quality Standard"],
        },
        valuation: {
          riusValue: 50000,
          usdValue: 10000,
          methodology: "Water Scarcity Index + Community Impact",
        },
      },
    },
  });

  // Create asset ownership
  await prisma.assetOwnership.create({
    data: {
      assetId: asset1.id,
      userId: user1.id,
      percentage: 100,
      quantity: 250,
      acquiredAt: new Date("2026-01-15"),
      acquiredPrice: 100000,
      source: "mint",
    },
  });

  // Create sample listings
  await prisma.listing.create({
    data: {
      assetId: asset1.id,
      sellerId: user1.id,
      type: "sell",
      status: "active",
      quantity: 50,
      unit: "tCO2",
      price: 130000,
      usdPrice: 26000,
      conditions: {
        minQuality: "A",
        certifications: ["Gold Standard"],
        location: "Kibera",
        deliveryTerms: "Digital delivery within 30 days",
      },
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
    },
  });

  // Create sample governance proposal
  await prisma.governanceProposal.create({
    data: {
      title: "Increase Borneo Reforestation tranche by $4.2M",
      description: "Proposal to increase funding for Borneo reforestation project by $4.2 million RIUS tokens.",
      proposerId: user1.id,
      status: "passed",
      votingStartsAt: new Date("2026-04-01"),
      votingEndsAt: new Date("2026-04-15"),
      quorumRequired: 0.1,
    },
  });

  console.log("✅ Database seeded successfully!");
  console.log(`Created ${await prisma.user.count()} users`);
  console.log(`Created ${await prisma.asset.count()} assets`);
  console.log(`Created ${await prisma.listing.count()} listings`);
}

seed()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });