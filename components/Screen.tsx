import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  padding?: number;
};

export function Screen({ children, padding = 16 }: Props) {
  return (
    <SafeAreaView
      // ✅ ignore top safe area so you don't get extra gap under the header
      edges={["left", "right", "bottom"]}
      style={{
        flex: 1,
        paddingLeft: padding,
        paddingRight: padding,
        paddingBottom: padding,
      }}
    >
      {children}
    </SafeAreaView>
  );
}
