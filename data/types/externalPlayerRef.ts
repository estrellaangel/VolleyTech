export type StatSource = "balltime" | "hudl";

/**
 * When the CSV has a real player id -> use { kind: "id" }.
 * When it doesn't -> use { kind: "identity" } with a stable "externalKey"
 * derived from name (+ jersey/team/season when available).
 */
export type ExternalLink =
  | {
      kind: "id";
      externalPlayerId: string; // from vendor if provided
    }
  | {
      kind: "identity";
      externalKey: string; // your computed stable key for that vendor export format
      identity: {
        fullNameNormalized: string; // e.g. "caroline toberman"
        jerseyNumber?: number;      // if present in CSV, huge help
        teamLabel?: string;         // optional
        seasonLabel?: string;       // optional
      };
    };

export type ExternalPlayerRef = {
  playerId: string;      // internal id
  source: StatSource;

  link: ExternalLink;

  displayNameFromSource?: string;
  lastMatchedAt?: string; // ISO
  notes?: string;
};
