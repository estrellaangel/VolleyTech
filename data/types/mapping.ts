import type { CanonicalStatKey } from "./statsCatalog.ts";

export type SavedMappingProfile = {
  mappingProfileId: string;
  source: "balltime" | "hudl";
  teamId: string;
  createdAt: string;
  updatedAt: string;
  map: Record<string, CanonicalStatKey>; // sourceColumnName -> canonicalKey
};
