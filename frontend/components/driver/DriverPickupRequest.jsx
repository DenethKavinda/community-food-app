import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DriverPickupRequest({ onAccept }) {
  return (
    <View style={styles.card}>
      <View style={styles.badge}>
        <View style={styles.dot} />
        <Text style={styles.badgeText}>NEW DISPATCH</Text>
      </View>

      <Text style={styles.title}>New Pickup Request!!</Text>

      <Text style={styles.subtitle}>
        A food donation is ready for pickup.
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={onAccept}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Accept Pickup</Text>

        <Ionicons
          name="arrow-forward"
          size={20}
          color="#FFFFFF"
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#16A34A",
    alignItems: "center",
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginBottom: 12,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16A34A",
    marginRight: 6,
  },

  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#087A3D",
    letterSpacing: 0.5,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    textAlign: "center",
  },

  button: {
    width: "100%",
    minHeight: 48,
    borderRadius: 10,
    backgroundColor: "#16A34A",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFFFFF",
  },
});