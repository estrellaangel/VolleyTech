import React, { useEffect, useMemo, useState } from "react";
import { View, Text, Pressable, FlatList } from "react-native";
import { Calendar } from "react-native-calendars";
import { router, useLocalSearchParams } from "expo-router";

import type { TeamEvent } from "../../../data/types/events";
import { mockTeamEvents } from "../../../data/mock/teamEvents";
import { useMockAppSession } from "../../../data/access/useMockAppSession";
import { canEditTeamEvents } from "../../../data/access/permissions";
import { Screen } from "../../../components/Screen";
import { labelForKind, bgForKind, textForKind, dotColorForKind } from "../../utils/eventKind";
import { useTeamEvents } from "../../../data/store/teamEventsStore";


function isoToDayKey(iso: string): string {
  return iso.split("T")[0];
}

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatMonthAbbrevDay(dayKey: string): string {
  const [y, m, d] = dayKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }); // "Jan 24"
}

type Dot = { key: string; color: string };


export default function CalendarScreen() {
  const { role, activeTeam } = useMockAppSession();
  const canEdit = canEditTeamEvents(role);

  const todayKey = useMemo(() => isoToDayKey(new Date().toISOString()), []);
  const [selectedDayKey, setSelectedDayKey] = useState(todayKey);

  const { day } = useLocalSearchParams<{ day?: string }>();

  const { events } = useTeamEvents();

  useEffect(() => {
    if (day) setSelectedDayKey(day);
  }, [day]);

  const teamEvents = useMemo(() => {
    return events.filter((ev) => ev.visibility.scope === "team" && ev.visibility.teamId === activeTeam.id);
  }, [events, activeTeam.id]);

  const markedDates = useMemo(() => {
    const byDayColors: Record<string, Set<string>> = {};

    for (const ev of teamEvents) {
      const dayKey = isoToDayKey(ev.startAt);
      const color = dotColorForKind(ev.kind);

      byDayColors[dayKey] ??= new Set();
      byDayColors[dayKey].add(color);
    }

    const marks: Record<string, any> = {};

    for (const [dayKey, colorSet] of Object.entries(byDayColors)) {
      const colors = Array.from(colorSet).slice(0, 3);
      marks[dayKey] = {
        marked: colors.length > 0,
        dots: colors.map((c, i) => ({ key: `${dayKey}-${i}`, color: c })),
      };
    }

    marks[selectedDayKey] = {
      ...(marks[selectedDayKey] ?? {}),
      selected: true,
      selectedColor: "#111827",
    };

    return marks;
  }, [teamEvents, selectedDayKey]);

  const eventsForSelectedDay = useMemo(() => {
    const list = teamEvents.filter((ev) => isoToDayKey(ev.startAt) === selectedDayKey);
    return list.sort((a, b) => a.startAt.localeCompare(b.startAt));
  }, [teamEvents, selectedDayKey]);

  function onAddEvent() {
    router.push({
      pathname: "/calendar/add-event",
      params: { day: selectedDayKey },
    });
  }

  return (
    <Screen>
      <View style={{ flex: 1, paddingTop: 8, gap: 12 }}>
        {/* Header */}
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: "700" }}>Calendar</Text>
            <Text style={{ opacity: 0.7 }}>{activeTeam.name}</Text>
          </View>

          {canEdit ? (
            <Pressable
              onPress={onAddEvent}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 10,
                borderRadius: 10,
                backgroundColor: "#5bba6f",
              }}
            >
              <Text style={{ color: "white", fontWeight: "600" }}>Add Event</Text>
            </Pressable>
          ) : null}
        </View>

        <Calendar
          onDayPress={(d) => setSelectedDayKey(d.dateString)}
          markedDates={markedDates}
          markingType="multi-dot"
          theme={{
            textDayFontWeight: "600",
            textMonthFontWeight: "700",
            textDayHeaderFontWeight: "600",
            arrowColor: "#5bba6f",
            dotStyle: { width: 6, height: 6, borderRadius: 3, marginTop: 1 },
          }}
        />

        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Text style={{ fontSize: 16, fontWeight: "700" }}>
            {formatMonthAbbrevDay(selectedDayKey)}
          </Text>

          <Text style={{ fontSize: 16, fontWeight: "700", opacity: 0.7 }}>
            {eventsForSelectedDay.length} event{eventsForSelectedDay.length === 1 ? "" : "s"}
          </Text>
        </View>

        <FlatList
          data={eventsForSelectedDay}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
          renderItem={({ item }) => {

            
            const accent = dotColorForKind(item.kind);

            const tagLabel = labelForKind(item.kind);
            const tagBg = bgForKind(item.kind);
            const tagText = textForKind(item.kind);

            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/calendar/[eventId]",
                    params: { eventId: item.id, day: selectedDayKey },
                  })
                }
              ><View
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E7EB",
                  borderLeftWidth: 6,
                  borderLeftColor: accent,
                  borderRadius: 12,
                  padding: 12,
                }}
              >
                {/* Row: left content + right action */}
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* LEFT column */}
                  <View style={{ flex: 1, gap: 6 }}>
                    <Text style={{ fontWeight: "700", fontSize: 20 }}>{item.title}</Text>

                    <Text style={{ fontWeight: "500", fontSize: 15, opacity: 0.8 }}>
                      {formatTime(item.startAt)}
                      {item.endAt ? ` – ${formatTime(item.endAt)}` : ""}
                    </Text>

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
                      <Text style={{ color: tagText, fontWeight: "900", fontSize: 12 }}>
                        {tagLabel}
                      </Text>
                    </View>

                    {item.location?.name ? <Text style={{ opacity: 0.7 }}>{item.location.name}</Text> : null}

                    {item.attachments?.length ? (
                      <Text style={{ fontWeight: "800", opacity: 0.7 }}>See attachments</Text>
                    ) : null}
                  </View>

                  {/* RIGHT action (always aligned right) */}
                  <View style={{ paddingLeft: 12 }}>
                    <Text style={{ fontWeight: "800", color: tagText }}>
                      See info →
                    </Text>
                  </View>
                </View>
              </View>
              </Pressable>
            );
          }}
          ListEmptyComponent={<Text style={{ opacity: 0.6 }}>No events for this day.</Text>}
        />
      </View>
    </Screen>
  );
}
