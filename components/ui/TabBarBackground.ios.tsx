import { useThemeContext } from "@/hooks/useThemeContext";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import { StyleSheet, View } from "react-native";

export default function BlurTabBarBackground() {
  const { effectiveTheme } = useThemeContext();

  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        // Use different tint based on theme
        tint={effectiveTheme === "dark" ? "dark" : "light"}
        intensity={effectiveTheme === "dark" ? 80 : 100}
        style={StyleSheet.absoluteFill}
      />
      {/* Add a subtle overlay for better theming */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor:
              effectiveTheme === "dark" ? "rgba(28, 28, 30, 0.8)" : "rgba(248, 249, 250, 0.8)",
          },
        ]}
      />
    </View>
  );
}

export function useBottomTabOverflow() {
  return useBottomTabBarHeight();
}
