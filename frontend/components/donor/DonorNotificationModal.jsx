import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// Helper for formatting relative time
function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// Get icon component for notification type
function getNotificationIcon(title) {
  const t = (title || "").toLowerCase();
  if (t.includes("claimed") && !t.includes("cancelled")) {
    return {
      bg: "#DCFCE7",
      color: "#087A3D",
      icon: <MaterialCommunityIcons name="hand-heart" size={18} color="#087A3D" />,
    };
  }
  if (t.includes("expired")) {
    return {
      bg: "#FEE2E2",
      color: "#DC2626",
      icon: <Ionicons name="timer-outline" size={18} color="#DC2626" />,
    };
  }
  if (t.includes("cancelled")) {
    return {
      bg: "#FEF3C7",
      color: "#D97706",
      icon: <Ionicons name="close-circle-outline" size={18} color="#D97706" />,
    };
  }

  return {
    bg: "#F3F4F6",
    color: "#4B5563",
    icon: <Ionicons name="notifications-outline" size={18} color="#4B5563" />,
  };
}

export default function DonorNotificationModal({
  visible,
  onClose,
  notifications = [],
  isLoading = false,
  onMarkAsRead,
  onMarkAllAsRead,
}) {
  const router = useRouter();

  const handleNotificationPress = async (item) => {
    if (!item.is_read && onMarkAsRead) {
      await onMarkAsRead(item.id);
    }
    onClose();
    router.push("/(donor)/history");
  };

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.cardContainer}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Ionicons name="notifications" size={20} color="#087A3D" />
              <Text style={styles.headerTitle}>Notifications</Text>
              {unreadCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{unreadCount}</Text>
                </View>
              )}
            </View>

            <View style={styles.headerRight}>
              {unreadCount > 0 && (
                <TouchableOpacity
                  onPress={onMarkAllAsRead}
                  style={styles.markAllBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.markAllText}>Mark all as read</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7}>
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>
          </View>

          {/* List Content */}
          {isLoading && notifications.length === 0 ? (
            <View style={styles.stateContainer}>
              <ActivityIndicator size="small" color="#087A3D" />
              <Text style={styles.stateText}>Loading notifications...</Text>
            </View>
          ) : notifications.length === 0 ? (
            <View style={styles.stateContainer}>
              <Ionicons name="notifications-off-outline" size={40} color="#9CA3AF" />
              <Text style={styles.emptyTitle}>No notifications yet</Text>
              <Text style={styles.emptySubtext}>
                Updates about claimed, expired, or cancelled food donations will appear here.
              </Text>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <View style={styles.listContainer}>
                {notifications.map((item) => {
                  const iconStyle = getNotificationIcon(item.title);
                  const isUnread = !item.is_read;

                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[styles.itemCard, isUnread && styles.itemCardUnread]}
                      onPress={() => handleNotificationPress(item)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.iconCircle, { backgroundColor: iconStyle.bg }]}>
                        {iconStyle.icon}
                      </View>

                      <View style={styles.textContainer}>
                        <View style={styles.itemTitleRow}>
                          <Text style={[styles.itemTitle, isUnread && styles.itemTitleUnread]}>
                            {item.title}
                          </Text>
                          <Text style={styles.itemTime}>{formatRelativeTime(item.created_at)}</Text>
                        </View>

                        <Text style={styles.itemMessage} numberOfLines={2}>
                          {item.message}
                        </Text>
                      </View>

                      {isUnread && <View style={styles.unreadDot} />}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 56,
    paddingRight: 16,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  cardContainer: {
    width: 360,
    maxWidth: "92%",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingVertical: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  countBadge: {
    backgroundColor: "#DC2626",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  countBadgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "700",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  markAllBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  markAllText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#087A3D",
  },
  closeBtn: {
    padding: 2,
  },
  stateContainer: {
    paddingVertical: 32,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  stateText: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#374151",
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 12,
    paddingTop: 8,
    gap: 6,
  },
  itemCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  itemCardUnread: {
    backgroundColor: "#F0FDF4",
    borderColor: "#DCFCE7",
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  itemTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#374151",
  },
  itemTitleUnread: {
    fontWeight: "700",
    color: "#111827",
  },
  itemTime: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  itemMessage: {
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 16,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#087A3D",
    marginLeft: 6,
    marginTop: 6,
  },
});
