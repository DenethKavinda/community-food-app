import React, { useContext, useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import DonorNotificationModal from "./DonorNotificationModal";
import {
  getDonorNotifications,
  markDonorNotificationRead,
  markAllDonorNotificationsRead,
} from "../../services/donorService";

export default function DonorHeader({ title = "Donor Dashboard", onNotificationPress, onProfilePress }) {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Donor";

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getDonorNotifications();
      if (res && res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch (err) {
      // Quietly ignore network/auth errors for background header polling
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 20000); // 20s polling
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleOpenModal = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else {
      setIsModalVisible(true);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await markDonorNotificationRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.warn("Could not mark notification as read:", err.message);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllDonorNotificationsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.warn("Could not mark all as read:", err.message);
    }
  };

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
          onPress={handleOpenModal}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={22} color="#111827" />
          {unreadCount > 0 && (
            <View style={styles.badgePill}>
              <Text style={styles.badgeText}>
                {unreadCount > 99 ? "99+" : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.profileBadge}
          onPress={onProfilePress || (() => router.push("/(donor)/profile"))}
          activeOpacity={0.7}
          accessibilityLabel={`Open ${userName}'s profile`}
        >
          <Ionicons name="person" size={16} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.userName} numberOfLines={1}>
          {userName}
        </Text>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.7}
          accessibilityLabel="Log out"
        >
          <Ionicons name="log-out-outline" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <DonorNotificationModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        notifications={notifications}
        isLoading={isLoading}
        onMarkAsRead={handleMarkAsRead}
        onMarkAllAsRead={handleMarkAllAsRead}
      />
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
    position: "relative",
  },
  badgePill: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#DC2626",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 9.5,
    fontWeight: "800",
  },
  profileBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#087A3D",
    alignItems: "center",
    justifyContent: "center",
  },
  userName: {
    maxWidth: 105,
    fontSize: 12,
    fontWeight: "700",
    color: "#374151",
  },
  logoutButton: {
    padding: 5,
  },
});
