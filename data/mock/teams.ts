import type { Team } from "../types/teams";

const now = new Date().toISOString();

export const mockTeams: Team[] = [
  { id: "team_001", name: "16U National", seasonLabel: "2025–2026", createdAt: now, updatedAt: now },
  { id: "team_002", name: "15U Regional", seasonLabel: "2025–2026", createdAt: now, updatedAt: now },
];
