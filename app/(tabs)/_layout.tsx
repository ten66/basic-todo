import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";

import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
import TabBarBackground from "@/components/ui/TabBarBackground";
import { useThemeContext } from "@/hooks/useThemeContext";

export default function TabLayout() {
  const { effectiveTheme } = useThemeContext();

  const tabBarActiveTintColor = effectiveTheme === "dark" ? "#4A90E2" : "#0a7ea4";
  const tabBarInactiveTintColor = effectiveTheme === "dark" ? "#8E8E93" : "#687076";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: tabBarActiveTintColor,
        tabBarInactiveTintColor: tabBarInactiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: "absolute",
          },
          default: {
            backgroundColor: effectiveTheme === "dark" ? "#1C1C1E" : "#F8F9FA",
            borderTopColor: effectiveTheme === "dark" ? "#3A3A3C" : "#E0E0E0",
          },
        }),
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "タスク",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: "設定",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gear" color={color} />,
        }}
      />
    </Tabs>
  );
}
