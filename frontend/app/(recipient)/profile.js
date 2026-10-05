import React, { useState, useCallback, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useRouter, useFocusEffect } from "expo-router";
import { AuthContext } from "../../context/AuthContext";
import { fetchRecipientProfile } from "../../services/recipientService";

// ── Icons ──────────────────────────────────────────────────────────────────────
const BackIcon = () => <Text style={styles.backIconText}>←</Text>;
const EditIcon = () => <Text style={styles.btnIconText}>✏️</Text>;
const PersonAvatar = () => <Text style={styles.avatarEmoji}>👤</Text>;
const EmailIcon = () => <Text style={styles.fieldIconText}>✉️</Text>;
const PhoneIcon = () => <Text style={styles.fieldIconText}>📞</Text>;
const AddressIcon = () => <Text style={styles.fieldIconText}>📍</Text>;

export default function RecipientProfileScreen() {
  const router = useRouter();
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Automatically refresh profile data whenever this screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchRecipientProfile();
      if (data && data.profile) {
        setProfile(data.profile);
      } else {
        setError("Failed to load profile data.");
      }
    } catch (err) {
      console.error("Error fetching recipient profile:", err);
      const msg =
        err.response?.data?.message ||
        "Could not load recipient profile. Please check your network connection.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleEditPress = () => {
    router.push("/(recipient)/edit-profile");
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <BackIcon />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={styles.headerRightSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#2e7d32" />
            <Text style={styles.loadingText}>Loading profile...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorEmoji}>⚠️</Text>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={loadProfile}>
              <Text style={styles.retryBtnText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* ── Profile Header Card ── */}
            <View style={styles.profileHeaderCard}>
              <View style={styles.avatarContainer}>
                <PersonAvatar />
              </View>
              <Text style={styles.profileName}>{profile?.name || "Recipient User"}</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleBadgeText}>Verified Food Recipient</Text>
              </View>
            </View>

            {/* ── Personal Information Section ── */}
            <View style={styles.sectionCard}>
              <Text style={styles.sectionTitle}>RECIPIENT INFORMATION</Text>

              {/* Name Field */}
              <View style={styles.fieldRow}>
                <View style={styles.iconCircle}>
                  <PersonAvatar />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <Text style={styles.fieldValue}>{profile?.name || "Not provided"}</Text>
                </View>
              </View>
              <View style={styles.fieldDivider} />

              {/* Email Field */}
              <View style={styles.fieldRow}>
                <View style={styles.iconCircle}>
                  <EmailIcon />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <Text style={styles.fieldValue}>{profile?.email || "Not provided"}</Text>
                </View>
              </View>
              <View style={styles.fieldDivider} />

              {/* Phone Field */}
              <View style={styles.fieldRow}>
                <View style={styles.iconCircle}>
                  <PhoneIcon />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Phone Number</Text>
                  <Text style={styles.fieldValue}>{profile?.phone || "Not provided"}</Text>
                </View>
              </View>
              <View style={styles.fieldDivider} />

              {/* Address Field */}
              <View style={styles.fieldRow}>
                <View style={styles.iconCircle}>
                  <AddressIcon />
                </View>
                <View style={styles.fieldContent}>
                  <Text style={styles.fieldLabel}>Delivery Address</Text>
                  <Text style={styles.fieldValue}>{profile?.address || "Not provided"}</Text>
                </View>
              </View>
            </View>

            {/* ── Actions ── */}
            <TouchableOpacity
              style={styles.editBtn}
              onPress={handleEditPress}
              activeOpacity={0.8}
            >
              <EditIcon />
              <Text style={styles.editBtnText}>Edit Profile</Text>
            </TouchableOpacity>
          </>
        )}
      </ScrollView>

      {/* ── Bottom Navigation Bar ── */}
      <View style={styles.tabBar}>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/(recipient)")}>
          <Text style={styles.tabIcon}>🏠</Text>
          <Text style={styles.tabLabel}>Home</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem} onPress={() => router.push("/(recipient)/my-requests")}>
          <Text style={styles.tabIcon}>🤍</Text>
          <Text style={styles.tabLabel}>My Requests</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabItem}>
          <Text style={[styles.tabIcon, styles.tabIconActive]}>👤</Text>
          <Text style={[styles.tabLabel, styles.tabLabelActive]}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const GREEN = "#2e7d32";
const GREEN_LIGHT = "#e8f5e9";
const BORDER = "#e8e8e8";
const TEXT_PRIMARY = "#1a1a1a";
const TEXT_SECONDARY = "#666666";

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
  backBtn: {
    padding: 6,
    borderRadius: 8,
  },
  backIconText: {
    fontSize: 20,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: TEXT_PRIMARY,
  },
  headerRightSpacer: {
    width: 32,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  centerContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: TEXT_SECONDARY,
  },
  errorContainer: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#ffcdd2",
  },
  errorEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#d32f2f",
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: GREEN,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryBtnText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },

  // ── Profile Header Card ──
  profileHeaderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    paddingVertical: 24,
    paddingHorizontal: 16,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  avatarContainer: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: GREEN_LIGHT,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    borderWidth: 2,
    borderColor: GREEN,
  },
  avatarEmoji: {
    fontSize: 36,
  },
  profileName: {
    fontSize: 22,
    fontWeight: "800",
    color: TEXT_PRIMARY,
    marginBottom: 6,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: GREEN_LIGHT,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    color: GREEN,
    fontSize: 12,
    fontWeight: "600",
  },

  // ── Section Card ──
  sectionCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: BORDER,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXT_SECONDARY,
    letterSpacing: 0.6,
    marginBottom: 14,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f0f4f0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  fieldIconText: {
    fontSize: 16,
  },
  fieldContent: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: TEXT_SECONDARY,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  fieldValue: {
    fontSize: 15,
    fontWeight: "600",
    color: TEXT_PRIMARY,
  },
  fieldDivider: {
    height: 1,
    backgroundColor: "#f0f0f0",
    marginLeft: 50,
  },

  // ── Edit Button ──
  editBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GREEN,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    elevation: 2,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  btnIconText: {
    fontSize: 16,
  },
  editBtnText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "700",
  },

  // ── Tab Bar ──
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: BORDER,
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabIcon: {
    fontSize: 22,
    color: TEXT_SECONDARY,
  },
  tabIconActive: {
    color: GREEN,
  },
  tabLabel: {
    fontSize: 11,
    color: TEXT_SECONDARY,
  },
  tabLabelActive: {
    color: GREEN,
    fontWeight: "600",
  },
});
