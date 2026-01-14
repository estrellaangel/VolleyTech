import React, { useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Pressable,
  TextInput,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import DateTimePicker from "@react-native-community/datetimepicker";

import type { TeamEvent } from "../../../../data/types/events";
import { Screen } from "../../../../components/Screen";
import { useTeamEvents } from "../../../../data/store/teamEventsStore";

// use your shared helpers ✅
import { labelForKind, bgForKind, textForKind, dotColorForKind } from "../../../utils/eventKind";

function kindOptions(): TeamEvent["kind"][] {
  return ["games", "practice", "tournament", "meeting", "other"];
}

function toDate(iso: string) {
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date() : d;
}

function toIsoWithSameTZ(d: Date) {
  // For now: keep it simple (UTC ISO). Later you can preserve offset if you want.
  return d.toISOString();
}


const KEYBOARD_OFFSET = Platform.OS === "ios" ? 90 : 0;

type ActivePicker = "startDate" | "startTime" | "endDate" | "endTime" | null;

export default function EditEventScreen() {
  const params = useLocalSearchParams<{ eventId?: string | string[]; day?: string }>();

  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
  const day = params.day;

  const { events, updateEvent } = useTeamEvents();

  const event = useMemo(
    () => (eventId ? events.find((e) => e.id === eventId) : undefined),
    [events, eventId]
  );

  const scrollRef = useRef<ScrollView>(null);
  const notesYRef = useRef(0);

  function scrollNotesIntoView() {
   // slight delay so keyboard has time to appear
   setTimeout(() => {
    scrollRef.current?.scrollTo({
    y: Math.max(0, notesYRef.current - 16),
    animated: true,
    });
  }, 50);
  }



  const IOS_INLINE_NUDGE = 1; // tweak: 6–14 usually (you can adjust)

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

  // ✅ Draft values that only commit when user hits Save
  const [draftStart, setDraftStart] = useState<Date>(toDate(event.startAt));
  const [draftEnd, setDraftEnd] = useState<Date>(event.endAt ? toDate(event.endAt) : new Date(toDate(event.startAt)));

  // ✅ which picker is open right now
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  function closeAllPickers() {
    setActivePicker(null);
  }

  function openPicker(which: Exclude<ActivePicker, null>) {
    // sync drafts to current values at time of opening
    if (which === "startDate" || which === "startTime") {
      setDraftStart(new Date(startDateTime));
    } else {
      const base = endDateTime ?? new Date(startDateTime);
      setDraftEnd(new Date(base));
    }
    setActivePicker(which);
  }

  function cancelPicker() {
    // just close; drafts are discarded because we re-sync drafts on open
    closeAllPickers();
  }

  function savePicker() {
    if (activePicker === "startDate" || activePicker === "startTime") {
      setStartDateTime(new Date(draftStart));
    }
    if (activePicker === "endDate" || activePicker === "endTime") {
      setEndDateTime(new Date(draftEnd));
    }
    closeAllPickers();
  }

  function onCancel() {
    router.replace({
      pathname: "/calendar/[eventId]",
      params: { eventId, ...(day ? { day } : {}) },
    });
  }

  function onSave() {
    if (!eventId || !event) return;

    const updated: TeamEvent = {
      ...event,
      id: event.id, // keep required id as string
      title: title.trim(),
      kind,
      description: description.trim() ? description : undefined,
      location: {
        ...event.location,
        name: locationName.trim() ? locationName : undefined,
        address: locationAddress,
      },
      startAt: toIsoWithSameTZ(startDateTime),
      endAt: endDateTime ? toIsoWithSameTZ(endDateTime) : undefined,
      updatedAt: new Date().toISOString(),
      updatedBy: event.updatedBy ?? event.createdBy,
    };

    updateEvent(updated);

    router.replace({
      pathname: "/calendar/[eventId]",
      params: { eventId, ...(day ? { day } : {}) },
    });
  }

  const kindBg = bgForKind(kind);
  const kindText = textForKind(kind);
  const kindAccent = dotColorForKind(kind);

  const pickerWrapStyle = {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    padding: 8,
    overflow: "hidden",
    ...(Platform.OS === "ios"
      ? {
          marginLeft: -6,
          marginRight: -6,
        }
      : {}),
  } as const;

  const pickerHeaderStyle = {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    paddingBottom: 6,
  } as const;

  // what value/mode to show based on active picker
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

  return (
    <Screen>
      <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={KEYBOARD_OFFSET}>
      <ScrollView 
      ref={scrollRef}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ paddingTop: 8, gap: 14, paddingBottom: 24 }}
      >
        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={onCancel} style={{ paddingVertical: 6, paddingRight: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>← Cancel</Text>
          </Pressable>

          <Text style={{ fontSize: 18, fontWeight: "900" }}>Edit Event</Text>

          <Pressable
            onPress={onSave}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: "#111827",
            }}
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

        {/* Kind pills (colored) */}
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

        {/* Start date/time */}
        <View style={{ gap: 8 }}>
          <Text style={{ fontWeight: "900", opacity: 0.85 }}>Start</Text>

          <View style={{ flexDirection: "row", gap: 10 }}>
            {/* Date */}
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

            {/* Time */}
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

        {/* End date/time (optional) */}
        <View style={{ gap: 8 }}>
          <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>End (optional)</Text>

            <Pressable
              onPress={() => {
                // if removing, close picker
                if (endDateTime) {
                  closeAllPickers();
                  setEndDateTime(null);
                  return;
                }
                setEndDateTime(new Date(startDateTime));
              }}
            >
              <Text style={{ fontWeight: "900", color: "#2563EB" }}>
                {endDateTime ? "Remove" : "Add"}
              </Text>
            </Pressable>
          </View>

          {endDateTime ? (
            <View style={{ flexDirection: "row", gap: 10 }}>
              {/* Date */}
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

              {/* Time */}
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

        {/* ✅ Single Picker Renderer (with Cancel/Save) */}
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
              display={
                Platform.OS === "ios"
                  ? pickerMode === "date"
                    ? "inline"
                    : "spinner"
                  : "default"
              }
              onChange={(evt, picked) => {
                // Android sends dismissed/set. If dismissed, don't touch draft.
                if (Platform.OS !== "ios" && (evt as any)?.type === "dismissed") {
                  return;
                }
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
                  ? {
                      width: "100%",
                      alignSelf: "center",
                      transform: [{ translateX: IOS_INLINE_NUDGE }],
                    }
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

        {/* Notes (typing at top ✅) */}
        <View
        style={{ gap: 6 }}
        onLayout={(e) => {
            notesYRef.current = e.nativeEvent.layout.y;
        }}
        >
        <Text style={{ fontWeight: "900", opacity: 0.85 }}>Coach Notes</Text>

        <TextInput
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
