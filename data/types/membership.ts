import type { UserRole } from "./user";

export type Membership = {
  id: string;          // `${teamId}:${userId}` is a good stable id
  teamId: string;
  userId: string;
  role: UserRole;

  // optional: useful later
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};
