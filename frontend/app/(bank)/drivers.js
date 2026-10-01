import React, { useState, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Platform,
  Keyboard,
} from "react-native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { AuthContext } from "../../context/AuthContext";

export default function RequestDriverScreen() {
  const router = useRouter();
  const { logout } = useContext(AuthContext);
  const [selectedDriver, setSelectedDriver] = useState(
    "Kamal Perera (Available - 1.2 km away)",
  );
  const [notes, setNotes] = useState("");

  const blurWebFocus = () => {
    Keyboard.dismiss();
    if (Platform.OS === "web" && typeof document !== "undefined") {
      if (
        document.activeElement &&
        typeof document.activeElement.blur === "function"
      ) {
        document.activeElement.blur();
      }
    }
  };

  const handleBack = () => {
    blurWebFocus();
    router.back();
  };

  const handleNavigate = (path) => {
    blurWebFocus();
    router.push(path);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <View style={styles.container}>
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Request Driver</Text>

          <View style={styles.headerRight}>
            <TouchableOpacity style={styles.profileBadge}>
              <Ionicons name="person-outline" size={18} color="#10b981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={logout}>
              <Ionicons name="log-out-outline" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Banner Card */}
          <View style={styles.bannerCard}>
            <View style={styles.truckIconContainer}>
              <MaterialCommunityIcons
                name="truck-delivery-outline"
                size={22}
                color="#ffffff"
              />
            </View>
            <View style={styles.bannerTextContainer}>
              <Text style={styles.bannerTitle}>Request Driver Dispatch</Text>
              <Text style={styles.bannerSubtitle}>
                Assign an active volunteer driver to collect and transport this
                food donation from the donor location.
              </Text>
            </View>
          </View>

          {/* Donation Details Card */}
          <View style={styles.donationCard}>
            <View style={styles.donationCardHeader}>
              <Text style={styles.sectionLabel}>DONATION DETAILS</Text>
              <View style={styles.statusBadge}>
                <Text style={styles.statusBadgeText}>Ready for pickup</Text>
              </View>
            </View>

            <View style={styles.donationContent}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&q=80",
                }}
                style={styles.foodImage}
              />

              <View style={styles.donationInfo}>
                <View style={styles.titleRow}>
                  <Text style={styles.foodTitle}>Rice & Curry</Text>
                  <View style={styles.portionsBadge}>
                    <Text style={styles.portionsText}>14 persons</Text>
                  </View>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="location-outline" size={14} color="#888" />
                  <Text style={styles.metaText}>
                    Colombo 03 (Green Villa Bistro)
                  </Text>
                </View>

                <View style={styles.metaRow}>
                  <Ionicons name="time-outline" size={14} color="#888" />
                  <Text style={styles.metaText}>Today, 11:30 AM</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver Assignment Dropdown */}
          <View style={styles.sectionContainer}>
            <Text style={styles.fieldLabel}>Driver Assignment</Text>
            <TouchableOpacity style={styles.dropdownButton}>
              <View style={styles.dropdownLeft}>
                <Ionicons name="person-outline" size={18} color="#10b981" />
                <Text style={styles.dropdownText}>{selectedDriver}</Text>
              </View>
              <Ionicons name="chevron-down" size={18} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.infoNoteRow}>
              <View style={styles.greenDot} />
              <Text style={styles.infoNoteText}>
                Driver will receive an immediate mobile notification and pickup
                route.
              </Text>
            </View>
          </View>

          {/* Additional Notes Input */}
          <View style={styles.sectionContainer}>
            <Text style={styles.fieldLabel}>
              Additional Notes{" "}
              <Text style={styles.optionalText}>(Optional)</Text>
            </Text>
            <TextInput
              style={styles.textArea}
              placeholder="e.g., Special instructions for pickup, container requirements, donor contact person..."
              placeholderTextColor="#a1a1aa"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
            />
          </View>

          {/* Confirm Request Button */}
          <TouchableOpacity style={styles.confirmButton}>
            <Ionicons
              name="paper-plane-outline"
              size={18}
              color="#ffffff"
              style={styles.buttonIcon}
            />
            <Text style={styles.confirmButtonText}>Confirm Request</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNav}>
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => handleNavigate("./")}
          >
            <Ionicons name="home-outline" size={24} color="#888" />
            <Text style={styles.navLabel}>Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.navItem}>
            <View style={styles.activeDriverIconWrapper}>
              <MaterialCommunityIcons
                name="truck-outline"
                size={24}
                color="#10b981"
              />
              <View style={styles.activeDotBadge} />
            </View>
            <Text style={[styles.navLabel, styles.activeNavLabel]}>
              Drivers
            </Text>
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
  },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
  headerRight: { flexDirection: "row", alignItems: "center" },
  profileBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#d1fae5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  iconButton: { padding: 4 },
  scrollContent: { paddingHorizontal: 18, paddingTop: 16, paddingBottom: 24 },
  bannerCard: {
    backgroundColor: "#e6f7ef",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  truckIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  bannerTextContainer: { flex: 1 },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#064e3b",
    marginBottom: 4,
  },
  bannerSubtitle: { fontSize: 12, color: "#047857", lineHeight: 17 },
  donationCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
  },
  donationCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: "#6b7280",
    letterSpacing: 0.5,
  },
  statusBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: { fontSize: 11, color: "#047857", fontWeight: "600" },
  donationContent: { flexDirection: "row", alignItems: "center" },
  foodImage: { width: 76, height: 76, borderRadius: 12, marginRight: 14 },
  donationInfo: { flex: 1 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 6,
  },
  foodTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111827",
    marginRight: 8,
  },
  portionsBadge: {
    backgroundColor: "#d1fae5",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  portionsText: { fontSize: 11, color: "#047857", fontWeight: "600" },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 3 },
  metaText: { fontSize: 12, color: "#4b5563", marginLeft: 4 },
  sectionContainer: { marginBottom: 20 },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  optionalText: { fontSize: 12, color: "#9ca3af", fontWeight: "normal" },
  dropdownButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  dropdownLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  dropdownText: {
    fontSize: 13,
    color: "#111827",
    marginLeft: 10,
    fontWeight: "500",
  },
  infoNoteRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 8,
    paddingHorizontal: 2,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
    marginTop: 5,
    marginRight: 6,
  },
  infoNoteText: { fontSize: 12, color: "#6b7280", flex: 1, lineHeight: 16 },
  textArea: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 90,
    fontSize: 13,
    color: "#111827",
  },
  confirmButton: {
    backgroundColor: "#10b981",
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
  },
  buttonIcon: { marginRight: 8 },
  confirmButtonText: { color: "#ffffff", fontSize: 15, fontWeight: "600" },
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
  activeDriverIconWrapper: { position: "relative" },
  activeDotBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  navLabel: { fontSize: 11, color: "#888888", marginTop: 4 },
  activeNavLabel: { color: "#10b981", fontWeight: "600" },
});
