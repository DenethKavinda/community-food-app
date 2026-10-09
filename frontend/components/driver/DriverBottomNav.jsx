import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

export default function DriverBottomNav({
  activeTab = "Home",
  onTabPress,
}) {
  const router = useRouter();

  const tabs = [
    {
      label: "Home",
      icon: "home-outline",
      activeIcon: "home",
      route: "/(driver)",
    },
    {
      label: "Map",
      icon: "map-outline",
      activeIcon: "map",
      route: "/(driver)/map",
    },
    {
      label: "History",
      icon: "time-outline",
      activeIcon: "time",
      route: "/(driver)/history",
    },
  ];

  const handleTabPress = (tab) => {
    // If parent provides custom handling, keep using it.
    if (onTabPress) {
      onTabPress(tab.label);
      return;
    }

    // Otherwise navigate directly.
    router.push(tab.route);
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.label;

        return (
          <TouchableOpacity
            key={tab.label}
            style={styles.tab}
            onPress={() => handleTabPress(tab)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={isActive ? tab.activeIcon : tab.icon}
              size={22}
              color={isActive ? "#087A3D" : "#9CA3AF"}
            />

            <Text
              style={[
                styles.label,
                isActive && styles.activeLabel,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 68,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    paddingBottom: 4,
  },

  tab: {
    alignItems: "center",
    justifyContent: "center",
    minWidth: 70,
    paddingVertical: 6,
  },

  label: {
    marginTop: 3,
    fontSize: 10,
    fontWeight: "600",
    color: "#9CA3AF",
  },

  activeLabel: {
    color: "#087A3D",
  },
});