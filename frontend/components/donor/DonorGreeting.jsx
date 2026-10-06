import React, { useContext } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

export default function DonorGreeting({ userName: propUserName, avatarUrl: propAvatarUrl }) {
  const { user } = useContext(AuthContext);

  // Use logged-in user name (first name) or fallback
  const displayName = propUserName || (user?.name ? user.name.split(" ")[0] : "Donor");
  const avatarUri = propAvatarUrl || user?.avatar_url;

  const getGreetingTime = () => {
    const currentHour = new Date().getHours();
    if (currentHour < 12) return "Good Morning";
    if (currentHour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <View style={styles.container}>
      <View style={styles.textColumn}>
        <Text style={styles.greetingText}>{getGreetingTime()}</Text>
        <View style={styles.nameRow}>
          <Text style={styles.userName}>{displayName}</Text>
          <Ionicons name="checkmark-circle" size={19} color="#087A3D" style={styles.checkIcon} />
        </View>
        <Text style={styles.subtext}>
          Thank you for making a difference!
        </Text>
      </View>

      <View style={styles.avatarContainer}>
        {avatarUri ? (
          <Image source={{ uri: avatarUri }} style={styles.avatarImage} resizeMode="cover" />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={26} color="#087A3D" />
          </View>
        )}
        <View style={styles.onlineBadge} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
  },
  textColumn: {
    flex: 1,
    marginRight: 12,
  },
  greetingText: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
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
    color: "#4B5563",
    lineHeight: 18,
    fontWeight: "400",
  },
  avatarContainer: {
    position: "relative",
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E5E7EB",
  },
  avatarPlaceholder: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#DCFCE7",
  },
  onlineBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: "#087A3D",
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
});
