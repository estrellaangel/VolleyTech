import type { Membership } from "../types/membership";

const now = new Date().toISOString();

export const mockMemberships: Membership[] = [
  {
    id: "team_001:user_coach_001",
    teamId: "team_001",
    userId: "user_coach_001",
    role: "coach",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  // optional: coach has a second team
  {
    id: "team_002:user_coach_001",
    teamId: "team_002",
    userId: "user_coach_001",
    role: "coach",
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];
