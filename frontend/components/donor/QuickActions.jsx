import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

export default function QuickActions({
  onDonateFoodPress,
  onViewHistoryPress,
  onManageFoodPress,
}) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.gridRow}>
        {/* 1. Donate Food Action Card */}
        <TouchableOpacity
          style={styles.primaryCard}
          onPress={onDonateFoodPress || (() => console.log("Donate Food pressed"))}
          activeOpacity={0.85}
        >
          <View style={styles.primaryIconBox}>
            <MaterialCommunityIcons name="hand-heart" size={22} color="#FFFFFF" />
          </View>
          <Text style={styles.primaryCardText}>Donate Food</Text>
        </TouchableOpacity>

        {/* 2. My Food Items Action Card */}
        <TouchableOpacity
          style={styles.secondaryCard}
          onPress={onManageFoodPress || (() => console.log("Manage Food Items pressed"))}
          activeOpacity={0.85}
        >
          <View style={styles.secondaryIconBox}>
            <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#087A3D" />
          </View>
          <Text style={styles.secondaryCardText}>My Food Items</Text>
        </TouchableOpacity>

        {/* 3. History Action Card */}
        <TouchableOpacity
          style={styles.outlineCard}
          onPress={onViewHistoryPress || (() => console.log("View History pressed"))}
          activeOpacity={0.85}
        >
          <View style={styles.outlineIconBox}>
            <Ionicons name="time-outline" size={20} color="#374151" />
          </View>
          <Text style={styles.outlineCardText}>History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  gridRow: {
    flexDirection: "row",
    gap: 10,
  },
  primaryCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#087A3D",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  primaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  primaryCardText: {
    color: "#FFFFFF",
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center",
  },
  secondaryCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1.5,
    borderColor: "#DCFCE7",
    shadowColor: "#087A3D",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  secondaryIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F0FDF4",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  secondaryCardText: {
    color: "#087A3D",
    fontSize: 12.5,
    fontWeight: "700",
    textAlign: "center",
  },
  outlineCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  outlineIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  outlineCardText: {
    color: "#374151",
    fontSize: 12.5,
    fontWeight: "600",
    textAlign: "center",
  },
});
