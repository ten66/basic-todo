import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";
import { useThemeContext } from "@/hooks/useThemeContext";

// 仮のURL定義
const PRIVACY_POLICY_URL = "https://sites.google.com/view/basictodo-privacy";
const TERMS_OF_SERVICE_URL = "https://sites.google.com/view/basictodo-terms";
const CONTACT_URL = "https://forms.gle/7y6EYMK6XKm2yZfYA";

export default function SettingsScreen() {
  const { themeMode, setThemeMode, effectiveTheme } = useThemeContext();
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const tintColor = useThemeColor({}, "tint");

  const clearAllTodos = async () => {
    Alert.alert(
      "すべてのタスクを削除",
      "本当にすべてのタスクを削除しますか？この操作は取り消せません。",
      [
        { text: "キャンセル", style: "cancel" },
        {
          text: "削除",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("todos");
              Alert.alert("完了", "すべてのタスクが削除されました");
            } catch (error) {
              Alert.alert("エラー", "タスクの削除に失敗しました");
            }
          },
        },
      ],
    );
  };

  const openURL = async (url: string, title: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert("エラー", `${title}を開くことができませんでした`);
      }
    } catch (error) {
      Alert.alert("エラー", `${title}を開くことができませんでした`);
    }
  };

  const getThemeModeLabel = (mode: "light" | "dark" | "system") => {
    switch (mode) {
      case "light":
        return "ライト";
      case "dark":
        return "ダーク";
      case "system":
        return "システム設定に従う";
    }
  };

  const ThemeOption = ({
    mode,
    icon,
    isLast,
  }: {
    mode: "light" | "dark" | "system";
    icon: string;
    isLast?: boolean;
  }) => (
    <TouchableOpacity
      style={[
        {
          padding: 16,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: effectiveTheme === "dark" ? "#444" : "#E0E0E0",
        },
        { backgroundColor: backgroundColor === "#151718" ? "#2A2A2A" : "white" },
      ]}
      onPress={() => setThemeMode(mode)}>
      <View style={styles.optionLeft}>
        <Ionicons name={icon as any} size={24} color={themeMode === mode ? tintColor : textColor} />
        <Text
          style={[
            styles.themeOptionText,
            {
              color: themeMode === mode ? tintColor : textColor,
              fontWeight: themeMode === mode ? "600" : "normal",
            },
          ]}>
          {getThemeModeLabel(mode)}
        </Text>
      </View>
      {themeMode === mode && <Ionicons name="checkmark" size={20} color={tintColor} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <StatusBar barStyle={effectiveTheme === "dark" ? "light-content" : "dark-content"} />

      <View style={styles.header}>
        <Text style={[styles.title, { color: textColor }]}>設定</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>外観</Text>

          <View
            style={[
              styles.themeSection,
              {
                backgroundColor: backgroundColor === "#151718" ? "#2A2A2A" : "white",
                borderColor: effectiveTheme === "dark" ? "#444" : "#E0E0E0",
              },
            ]}>
            <ThemeOption mode="system" icon="phone-portrait-outline" />
            <ThemeOption mode="light" icon="sunny-outline" />
            <ThemeOption mode="dark" icon="moon-outline" isLast />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>サポート</Text>

          <View
            style={[
              styles.supportSection,
              {
                backgroundColor: backgroundColor === "#151718" ? "#2A2A2A" : "white",
                borderColor: effectiveTheme === "dark" ? "#444" : "#E0E0E0",
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.supportOption,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: effectiveTheme === "dark" ? "#444" : "#E0E0E0",
                },
              ]}
              onPress={() => openURL(PRIVACY_POLICY_URL, "プライバシーポリシー")}>
              <View style={styles.optionLeft}>
                <Ionicons name="shield-outline" size={24} color={textColor} />
                <Text style={[styles.optionText, { color: textColor }]}>プライバシーポリシー</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.supportOption,
                {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: effectiveTheme === "dark" ? "#444" : "#E0E0E0",
                },
              ]}
              onPress={() => openURL(TERMS_OF_SERVICE_URL, "利用規約")}>
              <View style={styles.optionLeft}>
                <Ionicons name="document-text-outline" size={24} color={textColor} />
                <Text style={[styles.optionText, { color: textColor }]}>利用規約</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.supportOption}
              onPress={() => openURL(CONTACT_URL, "お問い合わせ")}>
              <View style={styles.optionLeft}>
                <Ionicons name="mail-outline" size={24} color={textColor} />
                <Text style={[styles.optionText, { color: textColor }]}>お問い合わせ</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#CCC" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginLeft: 4,
  },
  themeSection: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E0E0E0",
  },
  themeOptionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  option: {
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E0E0E0",
  },
  supportSection: {
    backgroundColor: "white",
    borderRadius: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#E0E0E0",
  },
  supportOption: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionText: {
    fontSize: 16,
    marginLeft: 12,
  },
  infoContainer: {
    borderRadius: 12,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  infoText: {
    fontSize: 14,
    lineHeight: 20,
  },
});
