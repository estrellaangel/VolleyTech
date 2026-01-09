import type { SavedMappingProfile } from "../types/mapping";

export function applyMappingToRow(
  rawRow: Record<string, any>,
  profile: SavedMappingProfile
): Record<string, any> {
  const out: Record<string, any> = {};

  for (const [sourceCol, value] of Object.entries(rawRow)) {
    const key = profile.map[sourceCol];
    if (!key) continue; // unmapped column -> ignore

    out[key] = value;
  }

  return out;
}
