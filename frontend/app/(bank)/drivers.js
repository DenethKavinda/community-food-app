import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

export default function DriversScreen() {
  const router = useRouter();
  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Food Bank User";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/(bank)")} accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={25} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Request Driver</Text>
        <View style={styles.headerActions}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <View style={styles.profileButton}>
            <Ionicons name="person-outline" size={19} color="#16a34a" />
          </View>
          <TouchableOpacity onPress={logout} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.infoCard}>
        <View style={styles.infoIcon}>
          <Ionicons name="car-outline" size={23} color="#ffffff" />
        </View>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>Request Driver Dispatch</Text>
          <Text style={styles.infoText}>
            Assign an active volunteer driver to collect and transport this food donation from the donor location.
          </Text>
        </View>
      </View>

      <View style={styles.detailsCard}>
        <View style={styles.detailsHeader}>
          <Text style={styles.label}>DONATION DETAILS</Text>
          <Text style={styles.readyPill}>Ready for pickup</Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.donationRow}>
          <View style={styles.foodImage}>
            <Ionicons name="restaurant-outline" size={26} color="#cbd5e1" />
          </View>
          <View>
            <View style={styles.nameRow}>
              <Text style={styles.foodName}>Rice & Curry</Text>
              <Text style={styles.peoplePill}>14 persons</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="location-outline" size={14} color="#64748b" />
              <Text style={styles.metaText}>Colombo 03 (Green Villa Bistro)</Text>
            </View>
            <View style={styles.metaRow}>
              <Ionicons name="time-outline" size={14} color="#16a34a" />
              <Text style={styles.metaTextDark}>Today, 11:30 AM</Text>
            </View>
          </View>
        </View>
      </View>

      <Text style={styles.fieldTitle}>Driver Assignment</Text>
      <TouchableOpacity style={styles.selectInput}>
        <Ionicons name="person-outline" size={20} color="#16a34a" />
        <Text style={styles.selectText}>Kamal Perera (Available - 1.2 km away)</Text>
        <Ionicons name="chevron-down" size={18} color="#64748b" />
      </TouchableOpacity>
      <View style={styles.helperRow}>
        <View style={styles.helperDot} />
        <Text style={styles.helperText}>Driver will receive an immediate mobile notification and pickup route.</Text>
      </View>

      <Text style={[styles.fieldTitle, styles.notesTitle]}>
        Additional Notes <Text style={styles.optional}>(Optional)</Text>
      </Text>
      <View style={styles.notesBox}>
        <Text style={styles.placeholder}>e.g., Special instructions for pickup, container requirements, donor contact person...</Text>
      </View>

      <TouchableOpacity style={styles.confirmButton}>
        <Ionicons name="send-outline" size={20} color="#ffffff" />
        <Text style={styles.confirmText}>Confirm Request</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 18, paddingBottom: 30 },
  header: { height: 55, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 17, fontWeight: "800", color: "#172033" },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 14 },
  userName: { maxWidth: 105, fontSize: 12, fontWeight: "700", color: "#334155" },
  profileButton: { width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: "#86efac", backgroundColor: "#ecfdf5", alignItems: "center", justifyContent: "center" },
  infoCard: { flexDirection: "row", marginTop: 12, padding: 17, borderRadius: 17, backgroundColor: "#ecfdf5", borderWidth: 1, borderColor: "#bbf7d0" },
  infoIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: "#16a34a", alignItems: "center", justifyContent: "center" },
  infoCopy: { flex: 1, marginLeft: 13 },
  infoTitle: { fontSize: 15, fontWeight: "800", color: "#172033" },
  infoText: { marginTop: 5, fontSize: 13, lineHeight: 20, color: "#64748b" },
  detailsCard: { marginTop: 17, padding: 16, borderRadius: 17, backgroundColor: "#ffffff", boxShadow: "0px 2px 10px rgba(15, 23, 42, 0.06)", elevation: 2 },
  detailsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  label: { fontSize: 12, fontWeight: "800", letterSpacing: 0.5, color: "#64748b" },
  readyPill: { paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12, backgroundColor: "#d1fae5", color: "#047857", fontSize: 11, fontWeight: "700" },
  separator: { height: 1, marginVertical: 13, backgroundColor: "#f1f5f9" },
  donationRow: { flexDirection: "row", alignItems: "center" },
  foodImage: { width: 80, height: 80, borderRadius: 13, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },
  nameRow: { flexDirection: "row", alignItems: "center", flexWrap: "wrap", gap: 8, marginLeft: 13 },
  foodName: { fontSize: 16, fontWeight: "800", color: "#172033" },
  peoplePill: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 9, backgroundColor: "#ecfdf5", color: "#16a34a", fontSize: 11, fontWeight: "700" },
  metaRow: { flexDirection: "row", alignItems: "center", gap: 5, marginTop: 7, marginLeft: 13 },
  metaText: { fontSize: 12, color: "#64748b" },
  metaTextDark: { fontSize: 12, fontWeight: "600", color: "#334155" },
  fieldTitle: { marginTop: 19, marginBottom: 8, fontSize: 15, fontWeight: "700", color: "#334155" },
  selectInput: { minHeight: 52, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, borderRadius: 13, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#ffffff", gap: 12 },
  selectText: { flex: 1, fontSize: 14, color: "#334155" },
  helperRow: { flexDirection: "row", alignItems: "flex-start", marginTop: 9, paddingHorizontal: 4 },
  helperDot: { width: 7, height: 7, marginTop: 5, marginRight: 7, borderRadius: 4, backgroundColor: "#10b981" },
  helperText: { flex: 1, fontSize: 12, lineHeight: 18, color: "#64748b" },
  notesTitle: { marginTop: 20 },
  optional: { fontWeight: "400", color: "#94a3b8" },
  notesBox: { minHeight: 89, padding: 14, borderRadius: 13, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#ffffff" },
  placeholder: { fontSize: 14, lineHeight: 21, color: "#94a3b8" },
  confirmButton: { height: 54, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 28, borderRadius: 13, backgroundColor: "#16a34a", boxShadow: "0px 5px 10px rgba(22, 163, 74, 0.2)", elevation: 4 },
  confirmText: { color: "#ffffff", fontSize: 16, fontWeight: "800" },
});
