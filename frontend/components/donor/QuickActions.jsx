import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function QuickActions({ onDonateFoodPress, onViewHistoryPress, onManageFoodPress }) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.donateButton}
          onPress={onDonateFoodPress || (() => console.log("Donate Food pressed"))}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={18} color="#FFFFFF" style={styles.buttonIcon} />
          <Text style={styles.donateText}>Donate Food</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.foodItemButton}
          onPress={onManageFoodPress || (() => console.log("Manage Food Items pressed"))}
          activeOpacity={0.85}
        >
          <MaterialCommunityIcons name="silverware-fork-knife" size={16} color="#087A3D" style={styles.buttonIcon} />
          <Text style={styles.foodItemText}>My Food Items</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.historyButton}
          onPress={onViewHistoryPress || (() => console.log("View History pressed"))}
          activeOpacity={0.85}
        >
          <Ionicons name="time-outline" size={16} color="#111827" style={styles.buttonIcon} />
          <Text style={styles.historyText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
  },
  donateButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 2,
  },
  donateText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },
  foodItemButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#DCFCE7",
  },
  foodItemText: {
    color: "#087A3D",
    fontSize: 13,
    fontWeight: "700",
  },
  historyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  historyText: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "600",
  },
  buttonIcon: {
    marginRight: 4,
  },
});
