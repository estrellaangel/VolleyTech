function normalizeName(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")  // keep letters/spaces/'/-
    .replace(/\s+/g, " ");
}

export function buildExternalIdentityKey(args: {
  source: "balltime" | "hudl";
  fullName: string;
  jerseyNumber?: number | null;
  teamLabel?: string | null;
  seasonLabel?: string | null;
}) {
  const name = normalizeName(args.fullName);
  const jersey = args.jerseyNumber != null ? String(args.jerseyNumber) : "";
  const team = (args.teamLabel ?? "").trim().toLowerCase();
  const season = (args.seasonLabel ?? "").trim().toLowerCase();

  // Keep it simple + consistent.
  // If jersey/team/season aren’t available, they just become empty segments.
  return [
    args.source,
    season,
    team,
    name,
    jersey,
  ].join("|");
}
