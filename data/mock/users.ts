import type { AppUser } from "../types/user";

const now = new Date().toISOString();

export const mockUsers: AppUser[] = [
  {
    id: "user_coach_001",
    email: "coach@example.com",
    displayName: "Coach Taylor",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "user_parent_001",
    email: "parent@example.com",
    displayName: "Parent Morgan",
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "user_player_001",
    email: "player@example.com",
    displayName: "Caroline T.",
    createdAt: now,
    updatedAt: now,
  },
];
