import AsyncStorage from "@react-native-async-storage/async-storage";
import type { SavedMappingProfile } from "../types/mapping";

function keyFor(source: SavedMappingProfile["source"], teamId: string) {
  return `mappingProfile:${source}:${teamId}`;
}

export async function loadMappingProfile(
  source: SavedMappingProfile["source"],
  teamId: string
): Promise<SavedMappingProfile | null> {
  const raw = await AsyncStorage.getItem(keyFor(source, teamId));
  return raw ? (JSON.parse(raw) as SavedMappingProfile) : null;
}

export async function saveMappingProfile(profile: SavedMappingProfile): Promise<void> {
  await AsyncStorage.setItem(keyFor(profile.source, profile.teamId), JSON.stringify(profile));
}

export async function getOrCreateMappingProfile(
  source: SavedMappingProfile["source"],
  teamId: string
): Promise<SavedMappingProfile> {
  const existing = await loadMappingProfile(source, teamId);
  if (existing) return existing;

  const now = new Date().toISOString();
  const created: SavedMappingProfile = {
    mappingProfileId: `${source}-${teamId}-${Date.now()}`,
    source,
    teamId,
    createdAt: now,
    updatedAt: now,
    map: {},
  };

  await saveMappingProfile(created);
  return created;
}
