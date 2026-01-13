export type UserRole = "coach" | "player" | "parent" | "director";

export type AppUser = {
  id: string;           // auth uid (or mock uid)
  email: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
};
