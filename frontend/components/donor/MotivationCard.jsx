import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";

export default function MotivationCard({ onPress }) {
  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress || (() => console.log("Motivation card pressed"))}
        activeOpacity={0.8}
      >
        <View style={styles.iconCircle}>
          <Ionicons name="leaf" size={20} color="#087A3D" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            Together We Can Reduce Food Waste
          </Text>
          <Text style={styles.subtitle}>Join 1,420+ urban food heroes</Text>
        </View>

        <View style={styles.arrowIcon}>
          <Feather name="arrow-right" size={18} color="#374151" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 12,
    color: "#4B5563",
  },
  arrowIcon: {
    paddingLeft: 6,
  },
});
