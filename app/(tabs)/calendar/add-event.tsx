import React from "react";
import { View, Text, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen } from "../../../components/Screen";

export default function AddEventScreen() {
  const { day } = useLocalSearchParams<{ day?: string }>();

  function onBack() {
    router.push({
      pathname: "/(tabs)/calendar",
      params: day ? { day } : {},
    });
  }

  return (
    <Screen>
      <View style={{ paddingTop: 8, gap: 12 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Pressable onPress={onBack} style={{ paddingVertical: 6, paddingRight: 10 }}>
            <Text style={{ fontSize: 16, fontWeight: "800" }}>← Back</Text>
          </Pressable>
        </View>

        <Text style={{ fontSize: 22, fontWeight: "900" }}>Add Event</Text>
        <Text style={{ opacity: 0.7 }}>Form goes here.</Text>
      </View>
    </Screen>
  );
}
