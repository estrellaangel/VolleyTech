import type { AppUser, UserRole } from "../types/user";
import type { Membership } from "../types/membership";
import type { GuardianLink } from "../types/guardianLink";
import type { PlayerProfile } from "../types/player";

/**
 * 1) Which teamIds can this user see?
 * - Direct memberships (coach/player/parent/director)
 * - PLUS teams of linked kids (for parents)
 */
export function getVisibleTeamIdsForUser(params: {
  user: AppUser;
  memberships: Membership[];
  guardianLinks: GuardianLink[];
  players: PlayerProfile[];
}): string[] {
  const { user, memberships, guardianLinks, players } = params;

  const directTeamIds = memberships
    .filter(m => m.userId === user.id && m.isActive)
    .map(m => m.teamId);

  const linkedPlayerIds = guardianLinks
    .filter(gl => gl.parentUserId === user.id)
    .map(gl => gl.playerId);

  const linkedTeamIds = players
    .filter(p => linkedPlayerIds.includes(p.id))
    .map(p => p.teamId);

  return Array.from(new Set([...directTeamIds, ...linkedTeamIds]));
}

/**
 * 2) For parents: which kid player profiles are linked to this user?
 */
export function getLinkedKidsForUser(params: {
  user: AppUser;
  guardianLinks: GuardianLink[];
  players: PlayerProfile[];
}): PlayerProfile[] {
  const { user, guardianLinks, players } = params;

  const linkedPlayerIds = guardianLinks
    .filter(gl => gl.parentUserId === user.id)
    .map(gl => gl.playerId);

  return players.filter(p => linkedPlayerIds.includes(p.id));
}

/**
 * 3) What is the user's role for a specific team?
 * If multiple memberships exist (rare), return "highest privilege".
 */
const ROLE_PRIORITY: Record<UserRole, number> = {
  director: 4,
  coach: 3,
  parent: 2,
  player: 1,
};

export function getRoleForTeam(params: {
  user: AppUser;
  teamId: string;
  memberships: Membership[];
}): UserRole | null {
  const { user, teamId, memberships } = params;

  const roles = memberships
    .filter(m => m.userId === user.id && m.teamId === teamId && m.isActive)
    .map(m => m.role);

  if (roles.length === 0) return null;

  return roles.sort((a, b) => ROLE_PRIORITY[b] - ROLE_PRIORITY[a])[0];
}
