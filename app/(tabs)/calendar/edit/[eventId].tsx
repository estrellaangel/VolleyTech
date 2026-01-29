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
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as DocumentPicker from "expo-document-picker";
import type { DocumentPickerAsset } from "expo-document-picker";

import type { Attachment, TeamEvent } from "../../../../data/types/events";
import { Screen } from "../../../../components/Screen";
import { useTeamEvents } from "../../../../data/store/teamEventsStore";
import { useMockAppSession } from "../../../../data/access/useMockAppSession";

import { labelForKind, bgForKind, textForKind, dotColorForKind } from "../../../utils/eventKind";

function kindOptions(): TeamEvent["kind"][] {
  return ["games", "practice", "tournament", "meeting", "other"];
}

function toDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

function toIsoWithSameTZ(d: Date) {
  return d.toISOString();
}

const KEYBOARD_OFFSET = Platform.OS === "ios" ? 90 : 0;

type ActivePicker = "startDate" | "startTime" | "endDate" | "endTime" | null;

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

export default function EditEventScreen() {
  const params = useLocalSearchParams<{ eventId?: string | string[]; day?: string }>();
  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
  const day = params.day;

  const { userId } = useMockAppSession();
  const { events, updateEvent } = useTeamEvents();

  const event = useMemo(
    () => (eventId ? events.find((e) => e.id === eventId) : undefined),
    [events, eventId]
  );

  const scrollRef = useRef<ScrollView>(null);
  const notesRef = useRef<TextInput>(null);
  const EXTRA_SCROLL = 220;

  function scrollNotesIntoView() {
    setTimeout(() => {
      const node = findNodeHandle(notesRef.current);
      if (!node) return;
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(node, EXTRA_SCROLL, true);
    }, 80);
  }

  const IOS_INLINE_NUDGE = 1;

  if (!eventId || !event) {
    return (
      <Screen>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={KEYBOARD_OFFSET}
        >
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ paddingTop: 12, gap: 10, paddingBottom: 24 }}
          >
            <Text style={{ fontSize: 18, fontWeight: "800" }}>Event not found.</Text>
            <Pressable onPress={() => router.back()}>
              <Text style={{ color: "#2563EB", fontWeight: "800" }}>← Back</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  // form state
  const [title, setTitle] = useState(event.title);
  const [kind, setKind] = useState<TeamEvent["kind"]>(event.kind);
  const [description, setDescription] = useState(event.description ?? "");
  const [locationName, setLocationName] = useState(event.location?.name ?? "");
  const [locationAddress, setLocationAddress] = useState(event.location?.address ?? "");

  const [startDateTime, setStartDateTime] = useState<Date>(toDate(event.startAt));
  const [endDateTime, setEndDateTime] = useState<Date | null>(event.endAt ? toDate(event.endAt) : null);

  const [attachments, setAttachments] = useState<Attachment[]>(event.attachments ?? []);

  // draft pickers
  const [draftStart, setDraftStart] = useState<Date>(toDate(event.startAt));
  const [draftEnd, setDraftEnd] = useState<Date>(event.endAt ? toDate(event.endAt) : new Date(toDate(event.startAt)));
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

  async function onAddFiles() {
    const res = await DocumentPicker.getDocumentAsync({
      multiple: true,
      copyToCacheDirectory: true,
    });

    if (res.canceled) return;

    const now = new Date().toISOString();
    const assets: DocumentPickerAsset[] = res.assets ?? [];

    const mapped: Attachment[] = assets.map((a: DocumentPickerAsset) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      return {
        id,
        type: guessAttachmentType(a.mimeType, a.name),
        url: a.uri,
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
    router.replace({
      pathname: "/calendar/[eventId]",
      params: { eventId, ...(day ? { day } : {}) },
    });
  }

  
  function onSave() {
    // Build a NEW TeamEvent object called `updated`
    // TypeScript enforces it matches `TeamEvent`
    const updated: TeamEvent = {
        ...event,               // 1) Start with ALL existing required fields from the old event
                                //    (createdBy, createdAt, alerts, visibility, etc.)

        id: event.id,           // 2) Keep the same ID (so updateEvent knows which one to replace)

        title: title.trim(),    // 3) Replace title with what user typed (string required by TeamEvent)

        kind,                   // 4) Replace kind (must be TeamEventKind)

        // 5) Optional field: if description is empty string, store it as undefined
        description: description.trim() ? description : undefined,

        // 6) Optional location field
        //    Only include location if name or address has something
        location: locationName.trim() || locationAddress.trim()
        ? {
            ...event.location,                         // keep lat/lng if you ever had them
            name: locationName.trim() ? locationName : undefined,
            address: locationAddress.trim(),           // address is optional in EventLocation but fine to set
            }
        : undefined,

        startAt: toIsoWithSameTZ(startDateTime),         // 7) Save start time as ISO string (TeamEvent requires string)

        endAt: endDateTime ? toIsoWithSameTZ(endDateTime) : undefined,  // 8) endAt optional
        
        allDay: event.allDay ?? undefined,

        tags: event.tags?? undefined,

        extra: event?.extra ?? undefined,

        updatedAt: new Date().toISOString(),             // 9) Required by TeamEvent: updatedAt must always exist
        
        updatedBy: userId,   // 10) Optional field: who updated it

        attachments,// 11) attachments?: Attachment[] (optional) — you’re replacing it

        createdBy: event?.createdBy,

        createdAt: event?.createdAt,

        // 12) alerts is REQUIRED (EventAlert[]). You must supply it.
        alerts: event.alerts ?? [],

    };

    updateEvent(updated);      // Store it in your state/store
    router.replace({
        pathname: "/calendar/[eventId]",
        params: { eventId, ...(day ? { day } : {}) },
    });;       // Navigate back to the event details screen
    }



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

            <Text style={{ fontSize: 18, fontWeight: "900" }}>Edit Event</Text>

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

          {/* Kind pills */}
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
          </View>

          {/* Start */}
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Start</Text>

            <View style={{ flexDirection: "row", gap: 10 }}>
              <Pressable
                onPress={() => openPicker("startDate")}
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
                onPress={() => openPicker("startTime")}
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
                  onPress={() => openPicker("endDate")}
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
                  onPress={() => openPicker("endTime")}
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
                minHeight: 180,
              }}
            />
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
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
