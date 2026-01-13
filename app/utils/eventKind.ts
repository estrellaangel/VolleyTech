import type { TeamEvent } from "../../data/types/events";

export function labelForKind(kind: TeamEvent["kind"]): string {
  switch (kind) {
    case "games":
      return "Game";
    case "practice":
      return "Practice";
    case "tournament":
      return "Tournament";
    default:
      return "Other";
  }
}

export function bgForKind(kind: TeamEvent["kind"]): string {
  switch (kind) {
    case "games":
      return "#DBEAFE";
    case "practice":
      return "#DCFCE7";
    case "tournament":
      return "#FEF3C7";
    default:
      return "#F3F4F6";
  }
}

export function textForKind(kind: TeamEvent["kind"]): string {
  switch (kind) {
    case "games":
      return "#1D4ED8";
    case "practice":
      return "#15803D";
    case "tournament":
      return "#B45309";
    default:
      return "#374151";
  }
}

export function dotColorForKind(kind: TeamEvent["kind"]): string {
  switch (kind) {
    case "games":
      return "#2563EB";
    case "practice":
      return "#16A34A";
    case "tournament":
      return "#F59E0B";
    default:
      return "#6B7280";
  }
}
