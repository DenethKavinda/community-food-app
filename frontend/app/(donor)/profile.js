import React, { useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";
import { AuthContext } from "../../context/AuthContext";

export default function DonorProfileScreen() {
  const router = useRouter();
  const authContext = useContext(AuthContext);

  const avatarUrl =
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80";

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          if (authContext && authContext.logout) {
            authContext.logout();
          } else {
            router.push("/(auth)/login");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      <StatusBar style="dark" />
      <DonorHeader title="My Profile" />

      {/* Sub Header Navigation Row */}
      <View style={styles.subHeader}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.push("/(donor)")}
          activeOpacity={0.7}
        >
          <Ionicons name="chevron-back" size={22} color="#111827" />
        </TouchableOpacity>

        <Text style={styles.subHeaderTitle}>My Profile</Text>

        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => Alert.alert("Settings", "Settings options coming soon.")}
          activeOpacity={0.7}
        >
          <Ionicons name="settings-outline" size={22} color="#111827" />
        </TouchableOpacity>
      </View>

      <View style={styles.mainContainer}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Main Profile Header Card */}
          <View style={styles.profileCard}>
            {/* Avatar Container with Badges */}
            <View style={styles.avatarWrapper}>
              <Image source={{ uri: avatarUrl }} style={styles.avatarImage} resizeMode="cover" />
              
              {/* Camera Icon Overlay Top Right */}
              <TouchableOpacity
                style={styles.cameraBadge}
                onPress={() => Alert.alert("Profile Photo", "Change photo options.")}
                activeOpacity={0.8}
              >
                <Ionicons name="camera-outline" size={13} color="#374151" />
              </TouchableOpacity>

              {/* Verified Checkmark Bottom Right */}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#087A3D" />
              </View>
            </View>

            {/* Name & Rating */}
            <View style={styles.nameRow}>
              <Text style={styles.userName}>Nawaz M.</Text>
              <Ionicons name="star" size={18} color="#F59E0B" style={{ marginLeft: 4 }} />
            </View>

            {/* Contributor Status & Location */}
            <View style={styles.metaRow}>
              <View style={styles.activeDotRow}>
                <View style={styles.greenDot} />
                <Text style={styles.activeContributorText}>Active Food Contributor</Text>
              </View>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color="#6B7280" style={{ marginRight: 2 }} />
                <Text style={styles.metaText}>Colombo 03, LK</Text>
              </View>
            </View>

            {/* Email & Phone Row */}
            <View style={styles.contactRow}>
              <Text style={styles.contactText}>✉️ nawaz@example.com</Text>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.contactText}>📱 +94 77 123 4567</Text>
            </View>

            {/* Edit Profile Button */}
            <TouchableOpacity
              style={styles.editProfileBtn}
              onPress={() => router.push("/(donor)/edit-profile")}
              activeOpacity={0.8}
            >
              <Feather name="edit-2" size={14} color="#111827" style={{ marginRight: 6 }} />
              <Text style={styles.editProfileText}>Edit Profile</Text>
            </TouchableOpacity>
          </View>

          {/* Stats / Impact 3-Card Row */}
          <View style={styles.statsRow}>
            {/* Card 1: Donations */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons name="hand-heart" size={20} color="#087A3D" />
              </View>
              <Text style={styles.statNumber}>24</Text>
              <Text style={styles.statLabel}>Donations</Text>
            </View>

            {/* Card 2: Portions Given */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Ionicons name="restaurant-outline" size={19} color="#087A3D" />
              </View>
              <Text style={styles.statNumber}>120</Text>
              <Text style={styles.statLabel}>Portions Given</Text>
            </View>

            {/* Card 3: Pickups Done */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#087A3D" />
              </View>
              <Text style={styles.statNumber}>15</Text>
              <Text style={styles.statLabel}>Pickups Done</Text>
            </View>
          </View>

          {/* Impact Banner Card */}
          <View style={styles.impactCard}>
            <View style={styles.impactIconCircle}>
              <Ionicons name="leaf" size={20} color="#087A3D" />
            </View>
            <View style={styles.impactTextContainer}>
              <Text style={styles.impactTitle}>Community Champion Level 2</Text>
              <Text style={styles.impactSubtext}>Saved ~48kg CO₂ surplus this month!</Text>
            </View>
          </View>

          {/* Account & Preferences Section */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionHeaderTitle}>ACCOUNT & PREFERENCES</Text>

            {/* Menu Item 1: My Donations & History */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(donor)/history")}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <MaterialCommunityIcons name="hand-heart" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>My Donations & History</Text>
                <Text style={styles.menuSubtitle}>Review completed rescues</Text>
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>24</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {/* Menu Item 2: Saved Pickup Addresses */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert("Addresses", "Saved pickup addresses.")}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="location-outline" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Saved Pickup Addresses</Text>
                <Text style={styles.menuSubtitle}>Colombo 03 (Primary Home Hub)</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Menu Item 3: Notification Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert("Notifications", "Notification preferences.")}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="notifications-outline" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Notification Settings</Text>
                <Text style={styles.menuSubtitle}>Urgent food alerts & SMS</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Menu Item 4: Food Safety & Guidelines */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(donor)/guidelines")}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="shield-checkmark-outline" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Food Safety & Guidelines</Text>
                <Text style={styles.menuSubtitle}>Storage, expiry, hygiene rules</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Menu Item 5: Help & Support */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => Alert.alert("Help & Support", "Volunteer helpline & FAQs.")}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="help-circle-outline" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Help & Support</Text>
                <Text style={styles.menuSubtitle}>Volunteer helpline & FAQs</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          {/* Log Out Button */}
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.85}
          >
            <Ionicons name="log-out-outline" size={18} color="#DC2626" style={{ marginRight: 8 }} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* App Version Footer */}
          <Text style={styles.versionText}>
            App Version 2.4.1 (Clean Redistribution Build)
          </Text>
        </ScrollView>

        {/* Fixed Bottom Navigation Bar with "Profile" active */}
        <DonorBottomNav initialTab="Profile" />
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
  settingsBtn: {
    padding: 6,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: "#F7F8F7",
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
    marginBottom: 14,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 12,
  },
  avatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E5E7EB",
  },
  cameraBadge: {
    position: "absolute",
    top: 0,
    right: -2,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
  verifiedBadge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
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
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  activeDotRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#087A3D",
    marginRight: 5,
  },
  activeContributorText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#087A3D",
  },
  bulletDot: {
    fontSize: 12,
    color: "#9CA3AF",
    marginHorizontal: 6,
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  contactText: {
    fontSize: 12,
    color: "#6B7280",
  },
  editProfileBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    paddingHorizontal: 22,
    paddingVertical: 9,
    borderRadius: 20,
  },
  editProfileText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
  },
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  statIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111827",
    marginBottom: 1,
  },
  statLabel: {
    fontSize: 11.5,
    color: "#6B7280",
    fontWeight: "500",
  },
  impactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F8EE",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#D1FAE5",
  },
  impactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  impactTextContainer: {
    flex: 1,
  },
  impactTitle: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#087A3D",
    marginBottom: 2,
  },
  impactSubtext: {
    fontSize: 12,
    color: "#374151",
  },
  menuSection: {
    marginBottom: 16,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.5,
    marginBottom: 8,
    marginLeft: 2,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.02,
    shadowRadius: 2,
    elevation: 1,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  counterBadge: {
    backgroundColor: "#BBF7D0",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  counterText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#087A3D",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
  },
  logoutText: {
    color: "#DC2626",
    fontSize: 14,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 6,
  },
});
