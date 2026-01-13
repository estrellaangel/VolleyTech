import { mockUsers } from "../mock/users";
import { mockMemberships } from "../mock/memberships";
import { mockTeams } from "../mock/teams";
import { mockSession } from "../mock/mockSession";
import { getRoleForTeam } from "./accessLayer";

export function useMockAppSession() {
  const currentUser = mockUsers.find(u => u.id === mockSession.currentUserId)!;
  const activeTeam = mockTeams.find(t => t.id === mockSession.activeTeamId)!;

  const role = getRoleForTeam({
    user: currentUser,
    teamId: activeTeam.id,
    memberships: mockMemberships,
  });

  return { currentUser, activeTeam, role };
}
