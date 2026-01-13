export type GuardianLink = {
  id: string;              // `${parentUserId}:${playerId}`
  parentUserId: string;
  playerId: string;        // links to PlayerProfile.id
  relationship?: "mom" | "dad" | "guardian" | "other";
  createdAt: string;
};
