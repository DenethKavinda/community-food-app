import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DonorGreeting({
  userName = "Nawaz",
  avatarUrl = "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
}) {
  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.greetingText}>Good Morning,</Text>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{userName}</Text>
          <Ionicons name="checkmark-circle" size={18} color="#087A3D" style={styles.checkIcon} />
        </View>
        <Text style={styles.subtext}>
          Thank you{"\n"}for making a{"\n"}difference!
        </Text>
      </View>

      <View style={styles.avatarContainer}>
        <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
        <View style={styles.onlineBadge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  textColumn: {
    flex: 1,
  },
  greetingText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 2,
    fontWeight: "400",
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
  },
  checkIcon: {
    marginLeft: 6,
  },
  subtext: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 17,
  },
  avatarContainer: {
    position: "relative",
    marginTop: 4,
  },
  avatarImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E5E7EB",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#087A3D",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
