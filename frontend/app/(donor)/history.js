import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";

const mockHistoryData = [
  {
    id: "1",
    title: "Rice & Curry",
    quantity: "10 portions",
    location: "Colombo 03",
    date: "2026-09-14",
    status: "Active",
    image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "2",
    title: "Sandwiches",
    quantity: "20 portions",
    location: "Wellawatte",
    date: "2026-09-13",
    status: "Picked Up",
    image: "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "3",
    title: "Fruits (Mixed)",
    quantity: "15 portions",
    location: "Nugegoda",
    date: "2026-09-10",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=300&q=80",
  },
  {
    id: "4",
    title: "Bread Packs",
    quantity: "12 portions",
    location: "Dehiwala",
    date: "2026-09-08",
    status: "Completed",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=300&q=80",
  },
];

export default function DonationHistoryScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Recent Posts");

  const avatarUrl =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";

  // Filter items based on active tab if needed
  const displayedItems =
    activeTab === "Recent Posts"
      ? mockHistoryData
      : mockHistoryData.filter((item) => item.status === "Completed");

  // Render status badge with exact screenshot styling & icons
  const renderStatusBadge = (status) => {
    switch (status) {
      case "Active":
        return (
          <View style={[styles.badgeBase, styles.badgeActive]}>
            <View style={styles.activeDot} />
            <Text style={styles.textActive}>Active</Text>
          </View>
        );
      case "Picked Up":
        return (
          <View style={[styles.badgeBase, styles.badgePickedUp]}>
            <MaterialCommunityIcons name="truck-delivery-outline" size={13} color="#4B5563" style={{ marginRight: 3 }} />
            <Text style={styles.textPickedUp}>Picked Up</Text>
          </View>
        );
      case "Completed":
        return (
          <View style={[styles.badgeBase, styles.badgeCompleted]}>
            <Ionicons name="checkmark-circle-outline" size={13} color="#087A3D" style={{ marginRight: 3 }} />
            <Text style={styles.textCompleted}>Completed</Text>
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="My Donations" />

      {/* Sub Header Title Bar */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/(donor)")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.subHeaderTitle}>My Donations</Text>

        <Image source={{ uri: avatarUrl }} style={styles.avatar} resizeMode="cover" />
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Segmented Control Tabs */}
          <View style={styles.segmentedContainer}>
            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "Recent Posts" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("Recent Posts")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "Recent Posts" && styles.tabTextActive,
                ]}
              >
                Recent Posts
              </Text>
              {activeTab === "Recent Posts" && <View style={styles.activeIndicator} />}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tabBtn,
                activeTab === "History" && styles.tabBtnActive,
              ]}
              onPress={() => setActiveTab("History")}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === "History" && styles.tabTextActive,
                ]}
              >
                History
              </Text>
              {activeTab === "History" && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          </View>

          {/* Stats Summary Row */}
          <View style={styles.statsRow}>
            <View style={styles.statsLeft}>
              <View style={styles.recordedDot} />
              <Text style={styles.recordedText}>4 listings recorded</Text>
            </View>

            <View style={styles.rescuedPill}>
              <Text style={styles.rescuedPillText}>🌱 57 Portions Rescued</Text>
            </View>
          </View>

          {/* History Cards List */}
          <View style={styles.cardsList}>
            {displayedItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.card}
                activeOpacity={0.8}
                onPress={() => console.log(`Item ${item.title} pressed`)}
              >
                <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />

                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <View style={styles.metaRow}>
                    <Text
                      style={[
                        styles.quantityText,
                        item.status === "Active" && styles.quantityTextActive,
                      ]}
                    >
                      {item.quantity}
                    </Text>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.locationText}>{item.location}</Text>
                  </View>

                  <View style={styles.dateRow}>
                    <Ionicons name="calendar-outline" size={13} color="#6B7280" style={{ marginRight: 4 }} />
                    <Text style={styles.dateText}>{item.date}</Text>
                  </View>
                </View>

                <View style={styles.rightActionColumn}>
                  {renderStatusBadge(item.status)}
                  <Feather name="chevron-right" size={16} color="#9CA3AF" style={styles.chevron} />
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Community Champion Badge Card */}
          <View style={styles.championCard}>
            <View style={styles.championIconBox}>
              <Ionicons name="ribbon-outline" size={22} color="#FFFFFF" />
            </View>

            <View style={styles.championTextContainer}>
              <View style={styles.championHeaderRow}>
                <Text style={styles.championTitle}>Community Champion</Text>
                <View style={styles.tierBadge}>
                  <Text style={styles.tierBadgeText}>Tier 2</Text>
                </View>
              </View>

              <Text style={styles.championSubtext}>
                3 more meals rescued to unlock the Zero Waste Hero badge!
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Fixed Bottom Navigation Bar with "History" active */}
        <DonorBottomNav initialTab="History" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  subHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#FFFFFF",
  },
  backBtn: {
    padding: 6,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  subHeaderTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#E5E7EB",
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 24,
  },
  segmentedContainer: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    padding: 4,
    marginBottom: 14,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    borderRadius: 10,
    position: "relative",
  },
  tabBtnActive: {
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#087A3D",
    fontWeight: "700",
  },
  activeIndicator: {
    position: "absolute",
    bottom: 4,
    width: 24,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: "#087A3D",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statsLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  recordedDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#087A3D",
  },
  recordedText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  rescuedPill: {
    backgroundColor: "#DCFCE7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  rescuedPillText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#087A3D",
  },
  cardsList: {
    gap: 10,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  cardImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 3,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  quantityText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
  },
  quantityTextActive: {
    color: "#087A3D",
  },
  bulletDot: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 5,
  },
  locationText: {
    fontSize: 12.5,
    color: "#6B7280",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  dateText: {
    fontSize: 12,
    color: "#6B7280",
  },
  rightActionColumn: {
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: 54,
    paddingVertical: 2,
  },
  badgeBase: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: "#DCFCE7",
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#087A3D",
    marginRight: 4,
  },
  textActive: {
    fontSize: 11.5,
    fontWeight: "700",
    color: "#087A3D",
  },
  badgePickedUp: {
    backgroundColor: "#F3F4F6",
  },
  textPickedUp: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#4B5563",
  },
  badgeCompleted: {
    backgroundColor: "#E8F8EE",
  },
  textCompleted: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#087A3D",
  },
  chevron: {
    marginTop: 6,
  },
  championCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    borderRadius: 16,
    padding: 14,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  championIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#087A3D",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  championTextContainer: {
    flex: 1,
  },
  championHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 3,
  },
  championTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },
  tierBadge: {
    backgroundColor: "#BBF7D0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  tierBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#087A3D",
  },
  championSubtext: {
    fontSize: 12,
    color: "#4B5563",
    lineHeight: 16,
  },
});
