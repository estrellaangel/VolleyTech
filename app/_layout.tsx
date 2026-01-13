import { Stack } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { TeamEventsProvider } from "../data/store/teamEventsStore";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <TeamEventsProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
        </Stack>
      </TeamEventsProvider>
    </SafeAreaProvider>
  );
}
