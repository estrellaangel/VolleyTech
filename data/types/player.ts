export type PlayerPosition =
  | "Setter"
  | "Outside Hitter"
  | "Middle Blocker"
  | "Opposite"
  | "Libero"
  | "Defensive Specialist"
  | "Unknown";

export type PlayerProfile = {
  id: string;                 // internal stable id (use for linking stats later)

  teamId: string;         // ✅ add this
  userId?: string;        // ✅ if this player has a login account

  firstName: string;
  lastName: string;

  position: PlayerPosition;
  jerseyNumber: number;
  captain: boolean;

  email: string; // required to log in 

  // optional but very useful
  phone?: string;
  graduationYear?: number;    // helpful for coaches
  heightInInches?: number;    // optional
  notes?: string;             // coach notes
  isActive: boolean;

  createdAt: string;          // ISO string
  updatedAt: string;          // ISO string
};
