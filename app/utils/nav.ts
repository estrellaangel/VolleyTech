import { router } from "expo-router";

export function goToCalendar(day?: string) {
  router.push({
    pathname: "/(tabs)/calendar",
    params: day ? { day } : {},
  });
}
