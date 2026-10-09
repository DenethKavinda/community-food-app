import React, { useContext, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import DonorHeader from "../../components/donor/DonorHeader";
import DonorBottomNav from "../../components/donor/DonorBottomNav";
import { AuthContext } from "../../context/AuthContext";
import { getDonorStats } from "../../services/donorService";
import API from "../../services/api";

const getImageUrl = (url) => {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("file:") || url.startsWith("data:")) {
    return url;
  }
  const baseUrl = API.defaults.baseURL ? API.defaults.baseURL.replace(/\/api\/?$/, "") : "http://localhost:5000";
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function DonorProfileScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);

  const [stats, setStats] = useState({
    totalDonations: 0,
    totalQuantity: 0,
    completedDonations: 0,
    pickupsDone: 0,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Change Password Modal state
  const [isPasswordModalVisible, setIsPasswordModalVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  useEffect(() => {
    loadDonorStats();
  }, []);

  const loadDonorStats = async () => {
    setIsLoadingStats(true);
    try {
      const res = await getDonorStats();
      if (res && res.success && res.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      console.warn("Could not load donor stats:", err.message);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordError("");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setIsPasswordModalVisible(true);
  };

  const handleChangePassword = async () => {
    setPasswordError("");

    if (!currentPassword) {
      setPasswordError("Please enter your current password.");
      return;
    }
    if (!newPassword) {
      setPasswordError("Please enter a new password.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("New password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirm password do not match.");
      return;
    }

    try {
      setIsSubmittingPassword(true);
      const res = await API.put("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmPassword,
      });

      if (res.data && res.data.success) {
        setIsPasswordModalVisible(false);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setPasswordError("");

        if (Platform.OS === "web") {
          window.alert("Password updated successfully!");
        } else {
          Alert.alert("Success", "Your password has been changed successfully.");
        }
      } else {
        setPasswordError(res.data?.message || "Failed to update password.");
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to change password. Please check your current password.";
      console.warn("Change password info:", msg);
      setPasswordError(msg);
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  const handleLogout = () => {
    const doLogout = () => {
      if (logout) {
        logout();
      } else {
        router.replace("/(auth)/login");
      }
    };

    if (Platform.OS === "web") {
      if (typeof window !== "undefined" && window.confirm) {
        if (window.confirm("Are you sure you want to log out?")) {
          doLogout();
        }
      } else {
        doLogout();
      }
    } else {
      Alert.alert("Log Out", "Are you sure you want to log out?", [
        { text: "Cancel", style: "cancel" },
        {
          text: "Log Out",
          style: "destructive",
          onPress: doLogout,
        },
      ]);
    }
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
          onPress={openPasswordModal}
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
              {user?.avatar_url ? (
                <Image source={{ uri: getImageUrl(user.avatar_url) }} style={styles.avatarImage} resizeMode="cover" />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Ionicons name="person" size={40} color="#087A3D" />
                </View>
              )}

              {/* Verified Checkmark Bottom Right */}
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#087A3D" />
              </View>
            </View>

            {/* Name & Role */}
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.name || "Donor Account"}</Text>
            </View>

            {/* Organization Name if present */}
            {user?.organization_name ? (
              <Text style={styles.orgText}>🏢 {user.organization_name}</Text>
            ) : null}

            {/* Contributor Status & Location */}
            <View style={styles.metaRow}>
              <View style={styles.activeDotRow}>
                <View style={styles.greenDot} />
                <Text style={styles.activeContributorText}>
                  {user?.role ? `${user.role.charAt(0) + user.role.slice(1).toLowerCase()} Account` : "Donor Account"}
                </Text>
              </View>
              <Text style={styles.bulletDot}>•</Text>
              <View style={styles.locationRow}>
                <Ionicons name="location-outline" size={13} color="#6B7280" style={{ marginRight: 2 }} />
                <Text style={styles.metaText} numberOfLines={1}>{user?.address || "Address Not Set"}</Text>
              </View>
            </View>

            {/* Email & Phone Row */}
            <View style={styles.contactRow}>
              <Text style={styles.contactText} numberOfLines={1}>✉️ {user?.email || "No email"}</Text>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.contactText} numberOfLines={1}>📱 {user?.phone || "No phone"}</Text>
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

          {/* Real Database Stats 3-Card Row */}
          <View style={styles.statsRow}>
            {/* Card 1: Total Donations */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons name="hand-heart" size={20} color="#087A3D" />
              </View>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#087A3D" style={{ marginVertical: 4 }} />
              ) : (
                <Text style={styles.statNumber}>{stats.totalDonations}</Text>
              )}
              <Text style={styles.statLabel}>Donations</Text>
            </View>

            {/* Card 2: Total Quantity / Portions */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <Ionicons name="restaurant-outline" size={19} color="#087A3D" />
              </View>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#087A3D" style={{ marginVertical: 4 }} />
              ) : (
                <Text style={styles.statNumber}>{stats.totalQuantity}</Text>
              )}
              <Text style={styles.statLabel}>Portions Given</Text>
            </View>

            {/* Card 3: Pickups / Rescues Done */}
            <View style={styles.statCard}>
              <View style={styles.statIconCircle}>
                <MaterialCommunityIcons name="truck-delivery-outline" size={20} color="#087A3D" />
              </View>
              {isLoadingStats ? (
                <ActivityIndicator size="small" color="#087A3D" style={{ marginVertical: 4 }} />
              ) : (
                <Text style={styles.statNumber}>{stats.pickupsDone}</Text>
              )}
              <Text style={styles.statLabel}>Pickups Done</Text>
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
                <Text style={styles.menuSubtitle}>Review registered food donations</Text>
              </View>
              <View style={styles.counterBadge}>
                <Text style={styles.counterText}>{stats.totalDonations}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" style={{ marginLeft: 6 }} />
            </TouchableOpacity>

            {/* Menu Item 2: My Food Items Catalog */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(donor)/food-items")}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <MaterialCommunityIcons name="silverware-fork-knife" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>My Food Items Catalog</Text>
                <Text style={styles.menuSubtitle}>Manage reusable menu dishes & items</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Menu Item 3: Primary Pickup Address */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push("/(donor)/edit-profile")}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="location-outline" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Primary Pickup Address</Text>
                <Text style={styles.menuSubtitle}>{user?.address || "Address Not Set"}</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Menu Item 4: Account Security & Change Password */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={openPasswordModal}
              activeOpacity={0.8}
            >
              <View style={styles.menuIconBox}>
                <Ionicons name="key-outline" size={20} color="#087A3D" />
              </View>
              <View style={styles.menuTextContainer}>
                <Text style={styles.menuTitle}>Security & Password</Text>
                <Text style={styles.menuSubtitle}>Change account login password</Text>
              </View>
              <Feather name="chevron-right" size={16} color="#9CA3AF" />
            </TouchableOpacity>

            {/* Menu Item 5: Food Safety & Guidelines */}
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

            {/* Menu Item 6: Help & Support */}
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
            <Ionicons name="log-out-outline" size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
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

      {/* Change Password Modal */}
      <Modal
        visible={isPasswordModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPasswordModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleContainer}>
                <View style={styles.modalHeaderIcon}>
                  <Ionicons name="key-outline" size={20} color="#087A3D" />
                </View>
                <Text style={styles.modalTitle}>Change Password</Text>
              </View>
              <TouchableOpacity
                onPress={() => setIsPasswordModalVisible(false)}
                style={styles.closeBtn}
              >
                <Ionicons name="close" size={22} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <Text style={styles.modalSubtitle}>
                Update your password to keep your donor account secure.
              </Text>

              {passwordError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={18} color="#DC2626" />
                  <Text style={styles.errorText}>{passwordError}</Text>
                </View>
              ) : null}

              {/* Current Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Current Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    secureTextEntry={!showCurrentPassword}
                    value={currentPassword}
                    onChangeText={setCurrentPassword}
                    placeholder="Enter current password"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowCurrentPassword(!showCurrentPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* New Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    secureTextEntry={!showNewPassword}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="Enter new password (min. 6 chars)"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowNewPassword(!showNewPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm New Password Field */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Confirm New Password</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={styles.passwordInput}
                    secureTextEntry={!showConfirmPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#9CA3AF"
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.eyeIcon}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color="#6B7280"
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Modal Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setIsPasswordModalVisible(false)}
                disabled={isSubmittingPassword}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.saveBtn}
                onPress={handleChangePassword}
                disabled={isSubmittingPassword}
              >
                {isSubmittingPassword ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveBtnText}>Update Password</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E8F8EE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#DCFCE7",
  },
  orgText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4B5563",
    marginBottom: 4,
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
    justifyContent: "center",
    marginBottom: 4,
    maxWidth: "100%",
  },
  userName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.3,
    textAlign: "center",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    maxWidth: "100%",
    marginBottom: 6,
    paddingHorizontal: 8,
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
    flexShrink: 1,
    maxWidth: "100%",
  },
  metaText: {
    fontSize: 13,
    color: "#6B7280",
    flexShrink: 1,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    flexWrap: "wrap",
    maxWidth: "100%",
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  contactText: {
    fontSize: 12,
    color: "#6B7280",
    flexShrink: 1,
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
    backgroundColor: "#DC2626",
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 4,
    shadowColor: "#DC2626",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  logoutText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "700",
  },
  versionText: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "center",
    marginTop: 14,
    marginBottom: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    width: "100%",
    maxWidth: 440,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  modalTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modalHeaderIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  closeBtn: {
    padding: 4,
  },
  modalSubtitle: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#FCA5A5",
  },
  errorText: {
    fontSize: 12.5,
    color: "#DC2626",
    flex: 1,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  passwordInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 12,
  },
  passwordInput: {
    flex: 1,
    height: 44,
    fontSize: 14,
    color: "#111827",
  },
  eyeIcon: {
    padding: 6,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4B5563",
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#087A3D",
    alignItems: "center",
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
