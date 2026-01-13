import React, { useMemo } from "react";
import { View, Text, Pressable, Linking, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";

import { mockTeamEvents } from "../../../data/mock/teamEvents";
import { Screen } from "../../../components/Screen";
import type { Attachment, TeamEvent } from "../../../data/types/events";
import { mockUsers } from "../../../data/mock/users";
import { labelForKind, bgForKind, textForKind, dotColorForKind } from "../../utils/eventKind";
import { useTeamEvents } from "../../../data/store/teamEventsStore";


// ---------- Date/time formatting helpers ----------
function formatMonthDayYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatMonthDay(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
  });
}

function formatDowMonAbbrevDayYear(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTimeOnly(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function displayNameForUserId(userId: string): string {
  const u = mockUsers.find((x) => x.id === userId);
  return u?.displayName ?? "Unknown";
}


async function openUrl(url: string) {
  const can = await Linking.canOpenURL(url);
  if (!can) {
    console.warn("Cannot open URL:", url);
    return;
  }
  await Linking.openURL(url);
}

function openInMaps(query: string) {
  const encoded = encodeURIComponent(query);
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${encoded}`
      : `geo:0,0?q=${encoded}`;

  openUrl(url);
}

// ---------- Attachment helpers ----------
function labelForAttachment(att: Attachment): string {
  // Prefer fileName, fallback to type
  return att.fileName || att.type.toUpperCase();
}

function iconForAttachment(att: Attachment): string {
  const name = (att.fileName ?? "").toLowerCase();
  const mime = (att.mimeType ?? "").toLowerCase();

  const isImage =
    att.type === "image" ||
    mime.startsWith("image/") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp") ||
    name.endsWith(".heic");

  const isPdf =
    att.type === "pdf" || mime === "application/pdf" || name.endsWith(".pdf");

  if (isImage) return "🖼️";
  if (isPdf) return "📄";
  if (att.type === "doc") return "📝";
  return "📎";
}

function openAttachment(att: Attachment) {
  // For now: open the URL (browser / native viewer). User can download/share from there.
  openUrl(att.url);
}

export default function EventDetailsScreen() {
  const { eventId, day } = useLocalSearchParams<{ eventId: string; day?: string }>();

  const { events } = useTeamEvents();
  const event = useMemo(() => events.find((e) => e.id === eventId), [events, eventId]);
  
  function onBack() {
    // Go back to calendar tab, preserve selected day if provided
    router.push({
      pathname: "/(tabs)/calendar",
      params: day ? { day } : {},
    });
  }

  function onEdit() {
    router.push({
      pathname: "/calendar/edit/[eventId]",
      params: { eventId, day },
    });
  }


  if (!event) {
    return (
      <Screen>
        <View style={{ paddingTop: 8, gap: 12 }}>
          <Text style={{ fontSize: 18, fontWeight: "800" }}>Event not found.</Text>
          <Pressable onPress={onBack}>
            <Text style={{ color: "#2563EB", fontWeight: "800" }}>← Back to Calendar</Text>
          </Pressable>
        </View>
      </Screen>
    );
  }

  const tagLabel = labelForKind(event.kind);
  const tagBg = bgForKind(event.kind);
  const tagText = textForKind(event.kind);

  const attachments = event.attachments ?? [];
  const hasAttachments = attachments.length > 0;

  return (
    <Screen>
      <View style={{ paddingTop: 8, gap: 14 }}>
        {/* Top bar */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Pressable onPress={onBack} style={{ paddingVertical: 6, paddingRight: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>← Back</Text>
          </Pressable>

          <Text style={{ fontSize: 18, fontWeight: "900" }}>
            {formatMonthDay(event.startAt)}
          </Text>

          <Pressable
            onPress={onEdit}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 10,
              backgroundColor: "#111827",
            }}
          >
            <Text style={{ color: "white", fontWeight: "800" }}>Edit</Text>
          </Pressable>
        </View>

        {/* Title + Tag */}
        <View style={{ gap: 10 }}>
          <Text style={{ fontSize: 24, fontWeight: "900" }}>{event.title}</Text>

          <View
            style={{
              alignSelf: "flex-start",
              backgroundColor: tagBg,
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 999,
              borderWidth: 2,
              borderColor: tagText,
            }}
          >
            <Text style={{ color: tagText, fontWeight: "900", fontSize: 12 }}>{tagLabel}</Text>
          </View>
        </View>

        {/* Date line + Time line */}
        <View style={{ gap: 4 }}>
          <Text style={{ fontWeight: "800", opacity: 0.85 }}>
            {formatDowMonAbbrevDayYear(event.startAt)}
          </Text>

          <Text style={{ fontWeight: "800", opacity: 0.85 }}>
            {formatTimeOnly(event.startAt)}
            {event.endAt ? ` – ${formatTimeOnly(event.endAt)}` : ""}
          </Text>
        </View>

        {/* Location */}
        {event.location?.address ? (
          <View style={{ gap: 4 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Location:</Text>

            <Pressable onPress={() => openInMaps(event.location!.address!)}>
              {event.location?.name ? (
                <Text style={{ fontWeight: "800", color: "#2563EB" }}>
                  {event.location.name}
                </Text>
              ) : null}

              <Text style={{ fontWeight: "800", color: "#2563EB" }}>
                {event.location.address}
              </Text>
            </Pressable>
          </View>
        ) : null}

        {/* Notes */}
        {event.description ? (
          <View style={{ gap: 6 }}>
            <Text style={{ fontWeight: "900" }}>Coach Notes:</Text>

            <View
              style={{
                backgroundColor: "white",
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "flex-start", // ✅ not "left"
                width: "100%",
              }}
            >
              <Text style={{ opacity: 0.85, textAlign: "left" }}>
                {event.description}
              </Text>
            </View>
          </View>
        ) : null}



        {/* Attachments */}
        {hasAttachments ? (
          <View style={{ gap: 8 }}>
            <Text style={{ fontWeight: "900", opacity: 0.85 }}>Attachments</Text>

            {attachments.map((att) => (
              <Pressable
                key={att.id}
                onPress={() => openAttachment(att)}
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
                <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 1 }}>
                  <Text style={{ fontSize: 18 }}>{iconForAttachment(att)}</Text>

                  <View style={{ flexShrink: 1 }}>
                    <Text style={{ fontWeight: "800" }} numberOfLines={1}>
                      {labelForAttachment(att)}
                    </Text>
                    <Text style={{ opacity: 0.7 }} numberOfLines={1}>
                      Tap to open
                    </Text>
                  </View>
                </View>

                <Text style={{ fontWeight: "900", opacity: 0.6 }}>›</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

        {/* Footer */}
        <View style={{ gap: 2, paddingTop: 8 }}>
          <Text style={{ opacity: 0.5, fontWeight: "700" }}>
            Created by {displayNameForUserId(event.createdBy)} on{" "}
            {formatMonthDayYear(event.createdAt)}
          </Text>
        </View>

      </View>
    </Screen>
  );
}
