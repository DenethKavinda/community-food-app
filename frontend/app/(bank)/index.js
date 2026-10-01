import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

export default function BankDashboard() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);

  const handleNavigate = (path) => {
    Keyboard.dismiss();
    if (Platform.OS === "web" && typeof document !== "undefined") {
      if (
        document.activeElement &&
        typeof document.activeElement.blur === "function"
      ) {
        document.activeElement.blur();
      }
    }
    router.push(path);
  };

  const donations = [
    {
      id: "1",
      title: "Rice & Curry",
      portions: "18 portions",
      location: "Colombo 03",
      time: "Today, 11:30 AM",
    },
    {
      id: "2",
      title: "Sandwiches",
      portions: "25 portions",
      location: "Wellawatte",
      time: "Today, 01:00 PM",
    },
    {
      id: "3",
      title: "Fruits (Mixed)",
      portions: "15 portions",
      location: "Nugegoda",
      time: "Today, 02:30 PM",
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="menu-outline" size={26} color="#333" />
          </TouchableOpacity>

          <View style={styles.titleContainer}>
            <View style={styles.logoBadge}>
              <Ionicons name="leaf" size={16} color="#10b981" />
            </View>
            <Text style={styles.headerTitle}>Food Bank</Text>
          </View>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="notifications-outline" size={24} color="#333" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.logoutButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#10b981" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.bannerHeader}>
              <View style={styles.liveBadge}>
                <View style={styles.greenDot} />
                <Text style={styles.liveText}>Live Updates</Text>
              </View>
              <View style={styles.newspaperIconContainer}>
                <Ionicons name="newspaper-outline" size={20} color="#10b981" />
              </View>
            </View>

            <Text style={styles.bannerTitle}>New Donations Available</Text>
            <Text style={styles.bannerSubtitle}>
              Check and claim new food donations from donors.
            </Text>

            {/* Pagination Dots */}
            <View style={styles.pagination}>
              <View style={[styles.dot, styles.activeDot]} />
              <View style={styles.dot} />
              <View style={styles.dot} />
            </View>
          </View>

          {/* Section Header */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Available Donations</Text>
            <TouchableOpacity>
              <Text style={styles.seeAll}>See All</Text>
            </TouchableOpacity>
          </View>

          {/* Donations List */}
          {donations.map((item) => (
            <View key={item.id} style={styles.donationCard}>
              <View style={styles.imagePlaceholder} />

              <View style={styles.cardDetails}>
                <Text style={styles.itemTitle}>{item.title}</Text>
                <View style={styles.portionsBadge}>
                  <Text style={styles.portionsText}>{item.portions}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color="#888" />
                  <Text style={styles.metaText}>{item.location}</Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color="#888" />
                  <Text style={styles.metaText}>{item.time}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.claimButton}
                onPress={() => handleNavigate("./(bank)/drivers")}
              >
                <Text style={styles.claimButtonText}>Claim</Text>
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="home" size={24} color="#10b981" />
            <Text style={[styles.navLabel, styles.activeNavLabel]}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavigate("/(bank)/drivers")}
          >
            <MaterialCommunityIcons
              name="truck-outline"
              size={24}
              color="#888"
            />
            <Text style={styles.navLabel}>Drivers</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <Ionicons name="archive-outline" size={24} color="#888" />
            <Text style={styles.navLabel}>Inventory</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#ffffff" },
  container: { flex: 1, backgroundColor: "#f9fafb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#ffffff",
  },
  titleContainer: { flexDirection: "row", alignItems: "center" },
  logoBadge: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  headerTitle: { fontSize: 20, fontWeight: "bold", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  iconButton: { padding: 4 },
  logoutButton: {
    marginLeft: 12,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 20 },
  bannerCard: {
    backgroundColor: "#e6f7ef",
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    marginBottom: 24,
  },
  bannerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginRight: 6,
  },
  liveText: { fontSize: 12, color: "#065f46", fontWeight: "600" },
  newspaperIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    justifyContent: "center",
    alignItems: "center",
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#064e3b",
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 13,
    color: "#047857",
    lineHeight: 18,
    marginBottom: 16,
  },
  pagination: { flexDirection: "row", alignItems: "center" },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#a7f3d0",
    marginRight: 6,
  },
  activeDot: { width: 20, backgroundColor: "#10b981" },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  seeAll: { fontSize: 14, color: "#10b981", fontWeight: "600" },
  donationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    marginRight: 14,
  },
  cardDetails: { flex: 1 },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 4,
  },
  portionsBadge: {
    backgroundColor: "#d1fae5",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 6,
  },
  portionsText: { fontSize: 11, color: "#047857", fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 2 },
  metaText: { fontSize: 12, color: "#6b7280", marginLeft: 4 },
  claimButton: {
    backgroundColor: "#10b981",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  claimButtonText: { color: "#ffffff", fontSize: 13, fontWeight: "600" },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  navItem: { alignItems: "center" },
  navLabel: { fontSize: 11, color: "#888888", marginTop: 4 },
  activeNavLabel: { color: "#10b981", fontWeight: "600" },
});
