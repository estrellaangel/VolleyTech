import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
  Linking,
  Alert,
  findNodeHandle,
  Switch,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import type { DocumentPickerAsset } from "expo-document-picker";

import type { Attachment, TeamEvent, EventAlert } from "../../../data/types/events";
import { Screen } from "../../../components/Screen";
import { useTeamEvents } from "../../../data/store/teamEventsStore";
import { useMockAppSession } from "../../../data/access/useMockAppSession";
import { canEditTeamEvents } from "../../../data/access/permissions";

import { labelForKind, bgForKind, textForKind, dotColorForKind } from "../../utils/eventKind";

function kindOptions(): TeamEvent["kind"][] {
  return ["games", "practice", "tournament", "meeting", "other"];
}

type ActivePicker = "startDate" | "startTime" | "endDate" | "endTime" | null;

function toIso(d: Date) {
  return d.toISOString();
}

function dayKeyToLocalDate(dayKey: string) {
  const [y, m, d] = dayKey.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function guessAttachmentType(mimeType?: string, fileName?: string): Attachment["type"] {
  const mime = (mimeType ?? "").toLowerCase();
  const name = (fileName ?? "").toLowerCase();

  const isImage =
    mime.startsWith("image/") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp") ||
    name.endsWith(".heic");

  const isPdf = mime === "application/pdf" || name.endsWith(".pdf");

  if (isImage) return "image";
  if (isPdf) return "pdf";
  return "doc";
}

async function openUrl(url: string) {
  const can = await Linking.canOpenURL(url);
  if (!can) return;
  await Linking.openURL(url);
}

function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export default function AddEventScreen() {
  const params = useLocalSearchParams<{ day?: string }>();
  const { role, activeTeam, userId } = useMockAppSession();
  const canEdit = canEditTeamEvents(role);

  const { addEvent } = useTeamEvents();

  if (!canEdit) {
    return (
      <Screen>
        <View style={{ paddingTop: 12, gap: 10 }}>
          <Text style={{ fontSize: 18, fontWeight: "800" }}>Not allowed.</Text>
          <Text style={{ opacity: 0.7 }}>Only coaches can add events.</Text>
          <Pressable onPress={() => router.back()}>
            <Text style={{ color: "#2563EB", fontWeight: "800" }}>← Back</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const todayKey = useMemo(() => new Date().toISOString().split("T")[0], []);
  const selectedDayKey = params.day ?? todayKey;

  const defaultStart = useMemo(() => {
    const base = dayKeyToLocalDate(selectedDayKey);
    base.setHours(17, 0, 0, 0);
    return base;
  }, [selectedDayKey]);

  const IOS_INLINE_NUDGE = 1;
  const KEYBOARD_OFFSET = Platform.OS === "ios" ? 90 : 0;
  const EXTRA_SCROLL = 200;

  const scrollRef = useRef<ScrollView>(null);
  const notesRef = useRef<TextInput>(null);

  function scrollNotesIntoView() {
    setTimeout(() => {
      const node = findNodeHandle(notesRef.current);
      if (!node) return;
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(node, EXTRA_SCROLL, true);
    }, 80);
  }

  // ---------- Form state ----------
  const [title, setTitle] = useState("");
  const [kind, setKind] = useState<TeamEvent["kind"]>("practice");

  const [allDay, setAllDay] = useState<boolean>(false);

  const [description, setDescription] = useState("");
  const [locationName, setLocationName] = useState("");
  const [locationAddress, setLocationAddress] = useState("");

  const [timezone, setTimezone] = useState<string>(""); // optional; blank means undefined
  const [tagsText, setTagsText] = useState<string>(""); // comma-separated

  const [startDateTime, setStartDateTime] = useState<Date>(defaultStart);
  const [endDateTime, setEndDateTime] = useState<Date | null>(null);

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [alerts, setAlerts] = useState<EventAlert[]>([]);

  // Draft pickers (commit on Save button inside picker)
  const [draftStart, setDraftStart] = useState<Date>(new Date(defaultStart));
  const [draftEnd, setDraftEnd] = useState<Date>(new Date(defaultStart));
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  function closeAllPickers() {
    setActivePicker(null);
  }

  function openPicker(which: Exclude<ActivePicker, null>) {
    if (which === "startDate" || which === "startTime") {
      setDraftStart(new Date(startDateTime));
    } else {
      const base = endDateTime ?? new Date(startDateTime);
      setDraftEnd(new Date(base));
    }
    setActivePicker(which);
  }

  function cancelPicker() {
    closeAllPickers();
  }

  function savePicker() {
    if (activePicker === "startDate" || activePicker === "startTime") {
      setStartDateTime(new Date(draftStart));
      if (endDateTime && endDateTime < draftStart) setEndDateTime(new Date(draftStart));
    } else if (activePicker === "endDate" || activePicker === "endTime") {
      const next = new Date(draftEnd);
      if (next < startDateTime) {
        Alert.alert("End time must be after start time.");
        return;
      }
      setEndDateTime(next);
    }
    closeAllPickers();
  }

  const pickerMode: "date" | "time" | null =
    activePicker === "startDate" || activePicker === "endDate"
      ? "date"
      : activePicker === "startTime" || activePicker === "endTime"
      ? "time"
      : null;

  const pickerValue: Date | null =
    activePicker === "startDate" || activePicker === "startTime"
      ? draftStart
      : activePicker === "endDate" || activePicker === "endTime"
      ? draftEnd
      : null;

  const pickerWrapStyle = {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 8,
    overflow: "hidden",
    ...(Platform.OS === "ios" ? { marginLeft: -6, marginRight: -6 } : {}),
  } as const;

  const pickerHeaderStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 6,
  } as const;

  // ---------- Alerts helpers ----------
  function addAlert(minutesBefore = 30) {
    setAlerts((prev) => [
      ...prev,
      { id: makeId("alert"), minutesBefore, enabled: true },
    ]);
  }

  function updateAlert(id: string, patch: Partial<EventAlert>) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }

  function removeAlert(id: string) {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
  }

  function parseMinutes(text: string) {
    const n = Number(text);
    if (!Number.isFinite(n)) return 0;
    return Math.max(0, Math.floor(n));
  }

  // ---------- Files ----------
  async function onAddFiles() {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
      // You can also set type: ["image/*", "application/pdf"] if you want to restrict
    });

    if (res.canceled) return;

    const now = new Date().toISOString();
    const assets: DocumentPickerAsset[] = res.assets ?? [];

    const mapped: Attachment[] = assets.map((a: DocumentPickerAsset) => {
      const id = makeId("att");
      return {
        id,
        type: guessAttachmentType(a.mimeType, a.name),
        url: a.uri, // NOTE: local URI for now; later you’ll upload and replace with https URL
        fileName: a.name,
        mimeType: a.mimeType ?? undefined,
        uploadedBy: userId,
        createdAt: now,
        sizeBytes: a.size ?? undefined,
      };
    });

    setAttachments((prev) => [...prev, ...mapped]);
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }

  function onCancel() {
    router.replace({ pathname: "/(tabs)/calendar", params: { day: selectedDayKey } });
  }

  function onSave() {
    const trimmed = title.trim();
    if (!trimmed) {
      Alert.alert("Missing title", "Please enter an event title.");
      return;
    }

    // If all-day, normalize times (optional choice)
    // You can remove this if you want to keep chosen times even for all-day.
    let start = new Date(startDateTime);
    let end = endDateTime ? new Date(endDateTime) : null;
    if (allDay) {
      start.setHours(0, 0, 0, 0);
      if (end) end.setHours(23, 59, 0, 0);
    }

    const tags = tagsText
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const nowIso = new Date().toISOString();

    const newEvent: TeamEvent = {
      id: makeId("event"),
      title: trimmed,
      kind,
      description: description.trim() ? description : undefined,

      location:
        locationName.trim() || locationAddress.trim()
          ? {
              name: locationName.trim() ? locationName.trim() : undefined,
              address: locationAddress.trim() ? locationAddress.trim() : undefined,
            }
          : undefined,

      startAt: toIso(start),
      endAt: end ? toIso(end) : undefined,
      allDay: allDay ? true : undefined,

      tags: tags.length ? tags : undefined,
      timezone: timezone.trim() ? timezone.trim() : undefined,

      attachments: attachments.length ? attachments : undefined,

      // ✅ coach controls alerts
      alerts: alerts.map((a) => ({
        id: a.id,
        minutesBefore: Math.max(0, Math.floor(a.minutesBefore)),
        enabled: !!a.enabled,
      })),

      createdAt: nowIso,
      createdBy: userId,
      updatedAt: nowIso,
      updatedBy: userId,
      visibility: { scope: "team", teamId: activeTeam.id },
    };

    addEvent(newEvent);
    router.replace({ pathname: "/(tabs)/calendar", params: { day: selectedDayKey } });
  }

  const kindBg = bgForKind(kind);
  const kindText = textForKind(kind);
  const kindAccent = dotColorForKind(kind);

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={KEYBOARD_OFFSET}
      >
        <ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingTop: 8, gap: 14, paddingBottom: 340 }}
        >
          {/* Top bar */}
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Pressable onPress={onCancel} style={{ paddingVertical: 6, paddingRight: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "800" }}>← Cancel</Text>
            </Pressable>

            <Text style={{ fontSize: 18, fontWeight: "900" }}>Add Event</Text>

            <Pressable
              onPress={onSave}
              style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, backgroundColor: "#111827" }}
            >
              <Text style={{ color: "white", fontWeight: "800" }}>Save</Text>
            </Pressable>
          </View>

          {/* Title */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Title</Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder="Event title"
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                padding: 12,
                fontWeight: "700",
              }}
            />
          </View>

          {/* Type */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Type</Text>

            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {kindOptions().map((k) => {
                const selected = k === kind;
                const bg = bgForKind(k);
                const txt = textForKind(k);
                const accent = dotColorForKind(k);

                return (
                  <Pressable
                    key={k}
                    onPress={() => setKind(k)}
                    style={{
                      paddingHorizontal: 10,
                      paddingVertical: 6,
                      borderRadius: 999,
                      borderWidth: 2,
                      borderColor: selected ? accent : "#E5E7EB",
                      backgroundColor: selected ? bg : "white",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: selected ? txt : "#111827", fontSize: 12 }}>
                      {labelForKind(k)}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <View
              style={{
                alignSelf: "flex-start",
                backgroundColor: kindBg,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 2,
                borderColor: kindAccent,
              }}
            >
              <Text style={{ color: kindText, fontWeight: "900", fontSize: 12 }}>
                Selected: {labelForKind(kind)}
              </Text>
            </View>
          </View>

          {/* All day */}
          <View
            style={{
              backgroundColor: "white",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 12,
              padding: 12,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <View style={{ gap: 2 }}>
              <Text style={{ fontWeight: "900", opacity: 0.85 }}>All-day event</Text>
              <Text style={{ opacity: 0.6 }}>If enabled, times will be treated as all-day.</Text>
            </View>
            <Switch value={allDay} onValueChange={setAllDay} />
          </View>

          {/* Start */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Start</Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => {
                  closeAllPickers();
                  openPicker("startDate");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ fontWeight: "800" }}>{startDateTime.toDateString()}</Text>
              </Pressable>

              <Pressable
                onPress={() => {
                  closeAllPickers();
                  openPicker("startTime");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                <Text style={{ fontWeight: "800" }}>
                  {startDateTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                </Text>
              </Pressable>
            </View>
          </View>

          {/* End */}
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontWeight: "900", opacity: 0.85 }}>End (optional)</Text>

              <Pressable
                onPress={() => {
                  if (endDateTime) {
                    closeAllPickers();
                    setEndDateTime(null);
                    return;
                  }
                  setEndDateTime(new Date(startDateTime));
                }}
              >
                <Text style={{ fontWeight: "900", color: "#2563EB" }}>{endDateTime ? "Remove" : "Add"}</Text>
              </Pressable>
            </View>

            {endDateTime ? (
              <View style={{ flexDirection: "row", gap: 10 }}>
                <Pressable
                  onPress={() => {
                    closeAllPickers();
                    openPicker("endDate");
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>{endDateTime.toDateString()}</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    closeAllPickers();
                    openPicker("endTime");
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: "white",
                    borderWidth: 1,
                    borderColor: "#E5E7EB",
                    borderRadius: 12,
                    padding: 12,
                  }}
                >
                  <Text style={{ fontWeight: "800" }}>
                    {endDateTime.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Picker */}
          {activePicker && pickerMode && pickerValue ? (
            <View style={pickerWrapStyle}>
              <View style={pickerHeaderStyle}>
                <Pressable onPress={cancelPicker} style={{ paddingVertical: 6, paddingHorizontal: 6 }}>
                  <Text style={{ fontWeight: "900", color: "#2563EB" }}>Cancel</Text>
                </Pressable>

                <Text style={{ fontWeight: "900", opacity: 0.7 }}>
                  {activePicker === "startDate"
                    ? "Start Date"
                    : activePicker === "startTime"
                    ? "Start Time"
                    : activePicker === "endDate"
                    ? "End Date"
                    : "End Time"}
                </Text>

                <Pressable onPress={savePicker} style={{ paddingVertical: 6, paddingHorizontal: 6 }}>
                  <Text style={{ fontWeight: "900", color: "#111827" }}>Save</Text>
                </Pressable>
              </View>

              <DateTimePicker
                value={pickerValue}
                mode={pickerMode}
                display={Platform.OS === "ios" ? (pickerMode === "date" ? "inline" : "spinner") : "default"}
                onChange={(evt, picked) => {
                  if (Platform.OS !== "ios" && (evt as any)?.type === "dismissed") return;
                  if (!picked) return;

                  if (activePicker === "startDate") {
                    const next = new Date(draftStart);
                    next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
                    setDraftStart(next);
                  } else if (activePicker === "startTime") {
                    const next = new Date(draftStart);
                    next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
                    setDraftStart(next);
                  } else if (activePicker === "endDate") {
                    const next = new Date(draftEnd);
                    next.setFullYear(picked.getFullYear(), picked.getMonth(), picked.getDate());
                    setDraftEnd(next);
                  } else if (activePicker === "endTime") {
                    const next = new Date(draftEnd);
                    next.setHours(picked.getHours(), picked.getMinutes(), 0, 0);
                    setDraftEnd(next);
                  }
                }}
                style={
                  Platform.OS === "ios" && pickerMode === "date"
                    ? { width: "100%", alignSelf: "center", transform: [{ translateX: IOS_INLINE_NUDGE }] }
                    : Platform.OS === "ios"
                    ? { width: "100%", alignSelf: "center" }
                    : undefined
                }
              />
            </View>
          ) : null}

          {/* Timezone */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Timezone (optional)</Text>
            <TextInput
              value={timezone}
              onChangeText={setTimezone}
              placeholder='Example: "America/Phoenix"'
              autoCapitalize="none"
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                padding: 12,
              }}
            />
            <Text style={{ opacity: 0.6 }}>
              Leave blank to use device/default timezone.
            </Text>
          </View>

          {/* Tags */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Tags (optional)</Text>
            <TextInput
              value={tagsText}
              onChangeText={setTagsText}
              placeholder="Example: varsity, home, scrimmage"
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                padding: 12,
              }}
            />
            <Text style={{ opacity: 0.6 }}>Comma-separated.</Text>
          </View>

          {/* Location */}
          <View style={{ gap: 10 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Location name</Text>
            <TextInput
              value={locationName}
              onChangeText={setLocationName}
              placeholder="Ex: Westwood Gym"
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                padding: 12,
              }}
            />

            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Location address</Text>
            <TextInput
              value={locationAddress}
              onChangeText={setLocationAddress}
              placeholder="Street, City, State"
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                padding: 12,
              }}
            />
          </View>

          {/* Alerts */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "900", opacity: 0.85 }}>Alerts</Text>

              <Pressable onPress={() => addAlert(30)}>
                <Text style={{ fontWeight: "900", color: "#2563EB" }}>+ Add alert</Text>
              </Pressable>
            </View>

            {alerts.length ? (
              <View style={{ gap: 8 }}>
                {alerts.map((a) => (
                  <View
                    key={a.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      padding: 12,
                      gap: 10,
                      backgroundColor: "white",
                    }}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontWeight: "900", opacity: 0.85 }}>Alert</Text>
                      <Pressable onPress={() => removeAlert(a.id)}>
                        <Text style={{ fontWeight: "900", color: "#DC2626" }}>Remove</Text>
                      </Pressable>
                    </View>

                    <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                      <Text style={{ fontWeight: "700" }}>Enabled</Text>
                      <Switch
                        value={!!a.enabled}
                        onValueChange={(v) => updateAlert(a.id, { enabled: v })}
                      />
                    </View>

                    <View style={{ gap: 6 }}>
                      <Text style={{ fontWeight: "700" }}>Minutes before</Text>
                      <TextInput
                        value={String(a.minutesBefore)}
                        onChangeText={(t) => updateAlert(a.id, { minutesBefore: parseMinutes(t) })}
                        keyboardType="number-pad"
                        placeholder="30"
                        style={{
                          backgroundColor: "white",
                          borderWidth: 1,
                          borderColor: "#E5E7EB",
                          borderRadius: 12,
                          padding: 12,
                        }}
                      />
                      <Text style={{ opacity: 0.6 }}>Example: 10, 30, 60</Text>
                    </View>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ opacity: 0.65 }}>No alerts. Tap “Add alert” to create one.</Text>
            )}
          </View>

          {/* Files */}
          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ fontWeight: "900", opacity: 0.85 }}>Files</Text>

              <Pressable onPress={onAddFiles}>
                <Text style={{ fontWeight: "900", color: "#2563EB" }}>+ Add file</Text>
              </Pressable>
            </View>

            {attachments.length ? (
              <View style={{ gap: 8 }}>
                {attachments.map((att) => (
                  <View
                    key={att.id}
                    style={{
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      borderRadius: 12,
                      padding: 12,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      backgroundColor: "white",
                    }}
                  >
                    <Pressable onPress={() => openUrl(att.url)} style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "800" }} numberOfLines={1}>
                        {att.fileName ?? "Attachment"}
                      </Text>
                      <Text style={{ opacity: 0.65 }} numberOfLines={1}>
                        Tap to open
                      </Text>
                    </Pressable>

                    <Pressable onPress={() => removeAttachment(att.id)}>
                      <Text style={{ fontWeight: "900", color: "#DC2626" }}>Remove</Text>
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={{ opacity: 0.65 }}>No files attached.</Text>
            )}
          </View>

          {/* Notes */}
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Coach Notes</Text>
            <TextInput
              ref={notesRef}
              value={description}
              onChangeText={setDescription}
              placeholder="Add notes..."
              multiline
              scrollEnabled
              textAlignVertical="top"
              onFocus={scrollNotesIntoView}
              style={{
                backgroundColor: "white",
                borderWidth: 1,
                borderColor: "#E5E7EB",
                borderRadius: 12,
                padding: 12,
                minHeight: 160,
              }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
