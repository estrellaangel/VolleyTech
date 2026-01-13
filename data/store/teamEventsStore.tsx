import React, { createContext, useContext, useMemo, useState } from "react";
import type { TeamEvent } from "../types/events";
import { mockTeamEvents as initialMock } from "../mock/teamEvents";

type TeamEventsContextValue = {
  events: TeamEvent[];
  updateEvent: (updated: TeamEvent) => void;
  addEvent: (ev: TeamEvent) => void;
};

const TeamEventsContext = createContext<TeamEventsContextValue | null>(null);

export function TeamEventsProvider({ children }: { children: React.ReactNode }) {
  const [events, setEvents] = useState<TeamEvent[]>(initialMock);

  const value = useMemo<TeamEventsContextValue>(() => {
    return {
      events,
      updateEvent: (updated) => {
        setEvents((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      },
      addEvent: (ev) => {
        setEvents((prev) => [ev, ...prev]);
      },
    };
  }, [events]);

  return <TeamEventsContext.Provider value={value}>{children}</TeamEventsContext.Provider>;
}

export function useTeamEvents() {
  const ctx = useContext(TeamEventsContext);
  if (!ctx) throw new Error("useTeamEvents must be used inside TeamEventsProvider");
  return ctx;
}
