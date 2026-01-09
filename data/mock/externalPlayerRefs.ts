import type { ExternalPlayerRef } from "../types/externalPlayerRef";
import { buildExternalIdentityKey } from "../utils/externalKey";

const now = new Date().toISOString();

const teamLabel = "Varsity";     // optional (can be "")
const seasonLabel = "2025-2026"; // optional (can be "")

export const mockExternalPlayerRefs: ExternalPlayerRef[] = [
  {
    playerId: "p_001",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Caroline Toberman",
        jerseyNumber: 12,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "caroline toberman",
        jerseyNumber: 12,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Toberman, Caroline",
    lastMatchedAt: now,
  },
  {
    playerId: "p_002",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Madison Maxwell",
        jerseyNumber: 3,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "madison maxwell",
        jerseyNumber: 3,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Maxwell, Madison",
    lastMatchedAt: now,
  },
  {
    playerId: "p_003",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Milani Lee",
        jerseyNumber: 7,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "milani lee",
        jerseyNumber: 7,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Lee, Milani",
    lastMatchedAt: now,
  },
  {
    playerId: "p_004",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Laurel Barsocchini",
        jerseyNumber: 15,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "laurel barsocchini",
        jerseyNumber: 15,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Barsocchini, Laurel",
    lastMatchedAt: now,
  },
  {
    playerId: "p_005",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Victoria Davis",
        jerseyNumber: 9,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "victoria davis",
        jerseyNumber: 9,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Davis, Victoria",
    lastMatchedAt: now,
  },
  {
    playerId: "p_006",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Bridget Conley",
        jerseyNumber: 10,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "bridget conley",
        jerseyNumber: 10,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Conley, Bridget",
    lastMatchedAt: now,
  },
  {
    playerId: "p_007",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Hannah Shaffer",
        jerseyNumber: 2,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "hannah shaffer",
        jerseyNumber: 2,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Shaffer, Hannah",
    lastMatchedAt: now,
  },
  {
    playerId: "p_008",
    source: "balltime",
    link: {
      kind: "identity",
      externalKey: buildExternalIdentityKey({
        source: "balltime",
        fullName: "Jaydin Watts",
        jerseyNumber: 18,
        teamLabel,
        seasonLabel,
      }),
      identity: {
        fullNameNormalized: "jaydin watts",
        jerseyNumber: 18,
        teamLabel,
        seasonLabel,
      },
    },
    displayNameFromSource: "Watts, Jaydin",
    lastMatchedAt: now,
  },
];
