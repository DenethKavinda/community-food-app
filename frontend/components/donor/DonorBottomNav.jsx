import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";

const tabs = [
  { id: "Home", label: "Home", iconType: "ionicons", iconName: "home", activeIconName: "home" },
  { id: "Donate", label: "Donate", iconType: "community", iconName: "hand-heart-outline", activeIconName: "hand-heart" },
  { id: "History", label: "History", iconType: "ionicons", iconName: "time-outline", activeIconName: "time" },
  { id: "Profile", label: "Profile", iconType: "ionicons", iconName: "person-outline", activeIconName: "person" },
];

export default function DonorBottomNav({ initialTab = "Home", onTabChange }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const router = useRouter();

  const handleTabPress = (tabId) => {
    setActiveTab(tabId);
    if (onTabChange) {
      onTabChange(tabId);
    } else {
      if (tabId === "Home") {
        router.push("/(donor)");
      } else if (tabId === "Donate") {
        router.push("/(donor)/donate");
      } else {
        console.log(`Tab pressed: ${tabId}`);
      }
    }
  };

  const renderIcon = (tab, isActive) => {
    const color = isActive ? "#087A3D" : "#6B7280";
    const name = isActive ? tab.activeIconName : tab.iconName;

    if (tab.iconType === "community") {
      return <MaterialCommunityIcons name={name} size={22} color={color} />;
    }
    return <Ionicons name={name} size={22} color={color} />;
  };

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            style={styles.tabButton}
            onPress={() => handleTabPress(tab.id)}
            activeOpacity={0.7}
          >
            {renderIcon(tab, isActive)}
            <Text style={[styles.tabLabel, isActive ? styles.activeLabel : styles.inactiveLabel]}>
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
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: "space-around",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 8,
  },
  tabButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    minWidth: 64,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 3,
    fontWeight: "500",
  },
  activeLabel: {
    color: "#087A3D",
    fontWeight: "700",
  },
  inactiveLabel: {
    color: "#6B7280",
  },
});
