import React from "react";
import { View, Text } from "react-native";
import type { TeamEvent } from "../data/types/events";

function formatTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function EventCard({ event }: { event: TeamEvent }) {
  return (
    <View
      style={{
        borderWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 12,
        padding: 12,
        gap: 6,
      }}
    >
      <Text style={{ fontWeight: "700" }}>
        {formatTime(event.startAt)} • {event.title}
      </Text>
      <Text style={{ opacity: 0.8 }}>{event.kind}</Text>
      {event.location?.name ? <Text style={{ opacity: 0.7 }}>{event.location.name}</Text> : null}
      {event.description ? <Text style={{ opacity: 0.7 }}>{event.description}</Text> : null}
    </View>
  );
}
