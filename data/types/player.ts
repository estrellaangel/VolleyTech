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
  firstName: string;
  lastName: string;

  position: PlayerPosition;
  jerseyNumber: number;
  captain: boolean;

  email: string;

  // optional but very useful
  phone?: string;
  graduationYear?: number;    // helpful for coaches
  heightInInches?: number;    // optional
  notes?: string;             // coach notes
  isActive: boolean;

  createdAt: string;          // ISO string
  updatedAt: string;          // ISO string
};
