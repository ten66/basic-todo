import { useThemeContext } from "@/hooks/useThemeContext";
import React from "react";
import { StyleSheet, View } from "react-native";

// This is a shim for web and Android where the tab bar is generally opaque.
export default function TabBarBackground() {
  const { effectiveTheme } = useThemeContext();

  return (
    <View
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: effectiveTheme === "dark" ? "#1C1C1E" : "#F8F9FA",
          borderTopWidth: StyleSheet.hairlineWidth,
          borderTopColor: effectiveTheme === "dark" ? "#3A3A3C" : "#E0E0E0",
        },
      ]}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
