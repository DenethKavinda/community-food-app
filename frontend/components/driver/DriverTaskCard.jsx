import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DriverTaskCard({
  image,
  title,
  portions,
  location,
  time,
  status,
  onPress,
}) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <View style={styles.imagePlaceholder}>
        <Ionicons name="fast-food-outline" size={24} color="#16A34A" />
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.portions}>{portions} portions</Text>

        <View style={styles.infoRow}>
          <Ionicons
            name="location-outline"
            size={13}
            color="#6B7280"
          />
          <Text style={styles.infoText}>{location}</Text>

          <Ionicons
            name="time-outline"
            size={13}
            color="#6B7280"
            style={styles.timeIcon}
          />
          <Text style={styles.infoText}>{time}</Text>
        </View>
      </View>

      <Ionicons
        name="chevron-forward"
        size={20}
        color="#9CA3AF"
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },

  imagePlaceholder: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 11,
  },

  content: {
    flex: 1,
  },

  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 3,
  },

  title: {
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginRight: 8,
  },

  statusBadge: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },

  statusText: {
    fontSize: 9,
    fontWeight: "700",
    color: "#16A34A",
  },

  portions: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 5,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  infoText: {
    fontSize: 10,
    color: "#6B7280",
    marginLeft: 3,
  },

  timeIcon: {
    marginLeft: 10,
  },
});