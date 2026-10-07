import React, { useContext, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";
import {
  fetchAvailableFoods,
  fetchNotifications,
  markNotificationAsRead,
} from "../../services/recipientService";
import { getImageUrl } from "../../services/api";

export default function BankDashboard() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Food Bank User";
  const [donations, setDonations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = React.useCallback(async () => {
    setLoading(true);
    try {
      const [donationData, notificationData] = await Promise.all([
        fetchAvailableFoods(),
        fetchNotifications(),
      ]);
      setDonations(donationData?.donations || []);
      setNotifications((notificationData?.notifications || []).filter((notification) => !notification.is_read));
    } catch (error) {
      console.error("Failed to load food bank dashboard:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboard();
    }, [loadDashboard])
  );

  const openNotification = async (notification) => {
    if (!notification.is_read) {
      try {
        await markNotificationAsRead(notification.id);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
    setNotifications((current) => current.filter((item) => item.id !== notification.id));
    router.push("/(recipient)/notifications");
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.menuButton}
          accessibilityLabel="Open menu"
        >
          <Ionicons name="menu-outline" size={27} color="#334155" />
        </TouchableOpacity>
        <View style={styles.brand}>
          <View style={styles.brandMark}>
            <Ionicons name="leaf" size={16} color="#16a34a" />
          </View>
          <Text style={styles.brandText}>Food Bank</Text>
        </View>
        <View style={styles.headerActions}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <TouchableOpacity
            style={styles.logoutButton}
            accessibilityLabel="Log out"
            onPress={logout}
          >
            <Ionicons name="log-out-outline" size={20} color="#16a34a" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.livePill}>
          <View style={styles.liveDot} />
          <Text style={styles.liveText}>Live Updates</Text>
        </View>
        <Text style={styles.heroTitle}>New Donations Available</Text>
        <Text style={styles.heroDescription}>
          Check and claim new food donations from donors.
        </Text>
        <View style={styles.heroProgress}>
          <View style={styles.progressActive} />
          <View style={styles.progressDot} />
          <View style={styles.progressDot} />
        </View>
        <View style={styles.heroIcon}>
          <Ionicons name="newspaper-outline" size={24} color="#16a34a" />
        </View>
      </View>

      <View style={styles.notificationHeader}>
        <Text style={styles.sectionTitle}>Upcoming Notifications</Text>
        <TouchableOpacity onPress={() => router.push("/(recipient)/notifications")}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      </View>
      {notifications.length === 0 ? (
        <Text style={styles.emptyText}>No new donation notifications.</Text>
      ) : (
        notifications.slice(0, 3).map((notification) => (
          <TouchableOpacity key={notification.id} style={[styles.notificationCard, !notification.is_read && styles.unreadNotification]} onPress={() => openNotification(notification)}>
            <Ionicons name="notifications-outline" size={19} color="#16a34a" />
            <View style={styles.notificationCopy}>
              <Text style={styles.notificationTitle}>{notification.title}</Text>
              <Text style={styles.notificationMessage}>{notification.message}</Text>
            </View>
            {!notification.is_read && <View style={styles.unreadDot} />}
          </TouchableOpacity>
        ))
      )}

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Available Donations</Text>
        <View style={styles.sectionActions}>
          <TouchableOpacity onPress={() => router.push("/(bank)/history")}>
            <Text style={styles.seeAll}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => router.replace("/(bank)/inventory")}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <Text style={styles.emptyText}>Loading available donations...</Text>
      ) : donations.length === 0 ? (
        <Text style={styles.emptyText}>No donations are available right now.</Text>
      ) : donations.slice(0, 10).map((donation) => (
        <View key={donation.id} style={styles.donationCard}>
          <View style={styles.imagePlaceholder}>
            {donation.image_url ? (
              <Image source={{ uri: getImageUrl(donation.image_url) }} style={styles.donationImage} />
            ) : (
              <Ionicons name="restaurant-outline" size={25} color="#cbd5e1" />
            )}
          </View>
          <View style={styles.donationInfo}>
            <Text style={styles.donationName}>
              {donation.display_meal_name || donation.meal_name}
            </Text>
            <Text style={styles.portions}>
              {donation.available_portions ?? donation.quantity} available
            </Text>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#94a3b8" />
              <Text style={styles.metaText}>{donation.location}</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color="#94a3b8" />
              <Text style={styles.metaText}>{donation.expiry_window}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.claimButton}
            accessibilityLabel={`Claim ${donation.display_meal_name || donation.meal_name}`}
            onPress={() =>
              router.push({
                pathname: "/(bank)/drivers",
                params: { itemData: JSON.stringify(donation) },
              })
            }
          >
            <Text style={styles.claimText}>Claim</Text>
          </TouchableOpacity>
        </View>
      ))}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 28 },
  header: {
    height: 58,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  menuButton: { padding: 3 },
  brand: { flexDirection: "row", alignItems: "center", gap: 9 },
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 9,
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: { fontSize: 20, fontWeight: "800", color: "#172033" },
  sectionActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },
  userName: { maxWidth: 110, fontSize: 12, fontWeight: "700", color: "#334155" },
  iconButton: { position: "relative", padding: 4 },
  notificationDot: {
    position: "absolute",
    top: 2,
    right: 1,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#16a34a",
  },
  notificationBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ef4444",
  },
  notificationBadgeText: { color: "#ffffff", fontSize: 9, fontWeight: "800" },
  logoutButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: "#86efac",
    alignItems: "center",
    justifyContent: "center",
  },
  heroCard: {
    minHeight: 157,
    marginTop: 12,
    padding: 20,
    borderRadius: 18,
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    position: "relative",
  },
  livePill: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: "#d1fae5",
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: "#16a34a" },
  liveText: { color: "#16a34a", fontSize: 12, fontWeight: "700" },
  heroTitle: {
    marginTop: 10,
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
  },
  heroDescription: {
    maxWidth: 240,
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: "#64748b",
  },
  heroProgress: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 14,
  },
  progressActive: {
    width: 20,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#16a34a",
  },
  progressDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#a7f3d0",
  },
  heroIcon: {
    position: "absolute",
    top: 22,
    right: 18,
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 28,
    marginBottom: 14,
  },
  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#172033" },
  seeAll: { fontSize: 14, fontWeight: "700", color: "#16a34a" },
  donationCard: {
    minHeight: 118,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    padding: 14,
    borderRadius: 17,
    backgroundColor: "#ffffff",
    boxShadow: "0px 2px 12px rgba(15, 23, 42, 0.06)",
    elevation: 2,
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 13,
    backgroundColor: "#f1f5f9",
    alignItems: "center",
    justifyContent: "center",
  },
  donationImage: { width: 80, height: 80, borderRadius: 13 },
  donationInfo: { flex: 1, marginLeft: 14 },
  donationName: { fontSize: 15, fontWeight: "800", color: "#172033" },
  portions: {
    alignSelf: "flex-start",
    marginTop: 7,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 7,
    backgroundColor: "#dcfce7",
    color: "#16a34a",
    fontSize: 11,
    fontWeight: "700",
  },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 5 },
  metaText: { fontSize: 12, color: "#64748b" },
  claimButton: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 13,
    backgroundColor: "#16a34a",
  },
  claimText: { color: "#ffffff", fontSize: 13, fontWeight: "800" },
  emptyText: { marginVertical: 18, color: "#64748b", fontSize: 13, textAlign: "center" },
  notificationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 18,
    marginBottom: 12,
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    padding: 13,
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  unreadNotification: {
    backgroundColor: "#ecfdf5",
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  notificationCopy: { flex: 1, marginLeft: 10 },
  notificationTitle: { fontSize: 13, fontWeight: "800", color: "#172033" },
  notificationMessage: { marginTop: 3, fontSize: 11, color: "#64748b" },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#16a34a" },
});
