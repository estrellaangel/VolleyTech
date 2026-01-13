import type { UserRole } from "../types/user";

export function canEditTeamEvents(role: UserRole | null) {
  return role === "coach" || role === "director";
}

export function canEditRoster(role: UserRole | null) {
  return role === "coach" || role === "director";
}

export function canCreateInvites(role: UserRole | null) {
  return role === "coach" || role === "director";
}
