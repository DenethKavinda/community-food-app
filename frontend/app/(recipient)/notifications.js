import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import {
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  fetchDonationById,
} from "../../services/recipientService";

const GREEN = "#2e7d32";
const GREEN_LIGHT = "#e8f5e9";
const BORDER = "#e8e8e8";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#777";

const BackIcon = () => <Text style={styles.headerIcon}>⬅</Text>;

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = () => {
    setLoading(true);
    fetchNotifications()
      .then((data) => {
        setNotifications(data.notifications || []);
      })
      .catch((err) => console.error("Failed to fetch notifications:", err))
      .finally(() => setLoading(false));
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, is_read: 1 }))
      );
    } catch (err) {
      console.error("Mark all as read failed", err);
    }
  };

  const handleNotificationPress = async (item) => {
    try {
      // Mark as read in background if unread
      if (!item.is_read) {
        markNotificationAsRead(item.id).catch(console.error);
        setNotifications((prev) =>
          prev.map((n) => (n.id === item.id ? { ...n, is_read: 1 } : n))
        );
      }

      // Fetch the full donation info
      const data = await fetchDonationById(item.donation_id);
      if (data && data.success && data.donation) {
        router.push({
          pathname: "/(recipient)/confirm-request",
          params: {
            itemData: JSON.stringify(data.donation),
          },
        });
      } else {
        Alert.alert("Error", "Could not load the related donation details.");
      }
    } catch (err) {
      console.error("Failed handling notification click", err);
      Alert.alert("Error", "Could not open this donation.");
    }
  };

  const hasUnread = notifications.some((n) => !n.is_read);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerIconBtn} onPress={() => router.back()}>
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        {hasUnread ? (
          <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.headerRightBtn}>
            <Text style={styles.headerRightText}>Mark All Read</Text>
          </TouchableOpacity>
        ) : (
          <View style={{ width: 80 }} /> // Spacer to balance header
        )}
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading && notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>Loading notifications...</Text>
          </View>
        ) : notifications.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No notifications yet.</Text>
          </View>
        ) : (
          notifications.map((item) => {
            const isUnread = !item.is_read;
            // Format timestamp slightly (e.g. "2026-10-07T11:25:58.000Z" -> "2026-10-07")
            const dateStr = item.created_at
              ? new Date(item.created_at).toLocaleDateString() +
                " " +
                new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : "";

            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.notificationCard,
                  isUnread && styles.notificationCardUnread,
                ]}
                onPress={() => handleNotificationPress(item)}
                activeOpacity={0.7}
              >
                <View style={styles.cardHeader}>
                  <Text style={[styles.cardTitle, isUnread && styles.cardTitleUnread]}>
                    {item.title}
                  </Text>
                  {isUnread && <View style={styles.unreadDot} />}
                </View>
                <Text style={styles.cardMessage}>{item.message}</Text>
                <Text style={styles.cardTime}>{dateStr}</Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f7f7f7",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerIconBtn: {
    padding: 4,
    width: 40,
  },
  headerIcon: {
    fontSize: 22,
    color: TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerRightBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: GREEN_LIGHT,
    borderRadius: 8,
  },
  headerRightText: {
    fontSize: 12,
    fontWeight: "700",
    color: GREEN,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 24,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 60,
  },
  emptyStateText: {
    fontSize: 15,
    color: TEXT_SECONDARY,
  },
  notificationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  notificationCardUnread: {
    backgroundColor: GREEN_LIGHT,
    borderColor: "#c8e6c9",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  cardTitleUnread: {
    color: GREEN,
    fontWeight: "700",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  cardMessage: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    lineHeight: 20,
    marginBottom: 8,
  },
  cardTime: {
    fontSize: 12,
    color: "#aaa",
  },
});
