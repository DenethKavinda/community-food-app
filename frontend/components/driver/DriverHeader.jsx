import React, { useContext } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

export default function DriverHeader({
  title = "Driver Dashboard",
  onMenuPress,
  onProfilePress,
}) {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const userName = user?.name || "Driver";

  const handleProfilePress = () => {
    if (onProfilePress) {
      onProfilePress();
      return;
    }

    router.push("/(driver)/profile");
  };

  return (
    <View style={styles.container}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={onMenuPress}
          activeOpacity={0.7}
        >
          <Ionicons
            name="menu-outline"
            size={27}
            color="#111827"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          {title}
        </Text>
      </View>

      <View style={styles.rightSection}>

        {/* PROFILE */}

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={handleProfilePress}
          activeOpacity={0.7}
          accessibilityLabel="Open driver profile"
        >
          <Ionicons
            name="person"
            size={17}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        {/* LOGOUT */}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
          accessibilityLabel="Log out"
        >
          <Ionicons
            name="log-out-outline"
            size={21}
            color="#6B7280"
          />
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

  iconButton: {
    padding: 5,
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

  profileBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#087A3D",
    alignItems: "center",
    justifyContent: "center",
  },

  logoutButton: {
    padding: 5,
  },
});