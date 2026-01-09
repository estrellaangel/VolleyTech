export type CanonicalStatKey =
  | "playerName"
  | "jerseyNumber"
  | "matchDate"
  | "opponent"
  | "kills"
  | "errors"
  | "attempts"
  | "aces"
  | "serveErrors"
  | "serveAttempts"
  | "assists"
  | "digs"
  | "blocksSolo"
  | "blocksAssist";

export type CanonicalStat = {
  key: CanonicalStatKey;
  label: string;
  type: "string" | "int" | "float" | "pct" | "date";
  synonyms: string[];
};

export const CANONICAL_STATS: CanonicalStat[] = [
  { key: "playerName", label: "Player Name", type: "string", synonyms: ["player", "name", "athlete"] },
  { key: "jerseyNumber", label: "Jersey #", type: "int", synonyms: ["jersey", "number", "#"] },
  { key: "matchDate", label: "Match Date", type: "date", synonyms: ["date", "match date", "game date"] },
  { key: "opponent", label: "Opponent", type: "string", synonyms: ["opponent", "vs", "against"] },

  { key: "kills", label: "Kills", type: "int", synonyms: ["kills", "kill", "k"] },
  { key: "errors", label: "Errors", type: "int", synonyms: ["errors", "err", "e"] },
  { key: "attempts", label: "Attempts", type: "int", synonyms: ["attempts", "att", "swings", "attacks"] },

  { key: "aces", label: "Aces", type: "int", synonyms: ["aces", "ace", "sa"] },
  { key: "serveErrors", label: "Serve Errors", type: "int", synonyms: ["serve errors", "se", "svc err"] },
  { key: "serveAttempts", label: "Serve Attempts", type: "int", synonyms: ["serve attempts", "serves", "sa (attempts)"] },

  { key: "assists", label: "Assists", type: "int", synonyms: ["assists", "ast", "a"] },
  { key: "digs", label: "Digs", type: "int", synonyms: ["digs", "dig", "d"] },

  { key: "blocksSolo", label: "Solo Blocks", type: "int", synonyms: ["solo blocks", "block solo", "bs"] },
  { key: "blocksAssist", label: "Assisted Blocks", type: "int", synonyms: ["assisted blocks", "block assist", "ba"] },
];
