import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function DonorHeader({ title = "Donor Dashboard", onNotificationPress, onProfilePress }) {
  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <View style={styles.logoBadge}>
          <MaterialCommunityIcons name="hand-heart" size={18} color="#087A3D" />
        </View>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onNotificationPress || (() => console.log("Notifications pressed"))}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#111827" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={onProfilePress || (() => console.log("Profile icon pressed"))}
          activeOpacity={0.7}
        >
          <Ionicons name="person" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  leftSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.2,
  },
  rightSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconButton: {
    padding: 6,
  },
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#087A3D",
    alignItems: "center",
    justifyContent: "center",
  },
});
