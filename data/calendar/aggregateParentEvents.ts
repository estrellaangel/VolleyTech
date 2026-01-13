import type { TeamEvent } from "../types/events";
import type { PlayerProfile } from "../types/player";

export type DecoratedTeamEvent = {
  event: TeamEvent;
  playerId: string;   // which kid this is for (used for colors/tabs)
  teamId: string;
};

export function aggregateParentTeamEvents(params: {
  teamEvents: TeamEvent[];
  kids: PlayerProfile[];
}): DecoratedTeamEvent[] {
  const { teamEvents, kids } = params;

  const kidsByTeam = new Map<string, PlayerProfile[]>();
  for (const kid of kids) {
    kidsByTeam.set(kid.teamId, [...(kidsByTeam.get(kid.teamId) ?? []), kid]);
  }

  const decorated: DecoratedTeamEvent[] = [];
  for (const ev of teamEvents) {
    if (ev.visibility.scope !== "team") continue;

    const kidsOnThatTeam = kidsByTeam.get(ev.visibility.teamId) ?? [];
    for (const kid of kidsOnThatTeam) {
      // Duplicate the event per kid for clean “color per kid” UI
      decorated.push({
        event: ev,
        playerId: kid.id,
        teamId: kid.teamId,
      });
    }
  }

  // optional: sort by start time
  decorated.sort((a, b) => a.event.startAt.localeCompare(b.event.startAt));
  return decorated;
}
