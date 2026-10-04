import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, Feather } from "@expo/vector-icons";

export default function DonationPromoCard({ onPress }) {
  return (
    <View style={styles.outerContainer}>
      <TouchableOpacity
        style={styles.card}
        onPress={onPress || (() => console.log("Donate to Food Humanity promo pressed"))}
        activeOpacity={0.8}
      >
        <View style={styles.iconBox}>
          <MaterialCommunityIcons name="hand-heart" size={24} color="#087A3D" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>Donate to Food Humanity</Text>
          <Text style={styles.subtitle}>
            Share food. Reduce waste.{"\n"}Help communities.
          </Text>
        </View>

        <View style={styles.arrowButton}>
          <Feather name="chevron-right" size={20} color="#6B7280" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    paddingHorizontal: 16,
    marginVertical: 6,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  arrowButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
