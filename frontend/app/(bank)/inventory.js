import React, { useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { AuthContext } from "../../context/AuthContext";

const breakdown = [
  { label: "Prepared Food", count: "80 items", icon: "restaurant-outline", color: "#f97316", bg: "#fff7ed" },
  { label: "Fruits & Vegetables", count: "40 items", icon: "nutrition-outline", color: "#10b981", bg: "#ecfdf5" },
  { label: "Bakery Items", count: "20 items", icon: "pizza-outline", color: "#f59e0b", bg: "#fffbeb" },
  { label: "Packaged Food", count: "10 items", icon: "cube-outline", color: "#2563eb", bg: "#eff6ff" },
];

export default function InventoryScreen() {
  const { user, logout } = useContext(AuthContext);
  const userName = user?.name || "Food Bank User";

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <TouchableOpacity accessibilityLabel="Open menu">
          <Ionicons name="menu-outline" size={27} color="#334155" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Food Bank</Text>
        <View style={styles.headerRight}>
          <Text style={styles.userName} numberOfLines={1}>
            {userName}
          </Text>
          <Ionicons name="search-outline" size={24} color="#334155" />
          <TouchableOpacity onPress={logout} accessibilityLabel="Log out">
            <Ionicons name="log-out-outline" size={20} color="#64748b" />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.titleRow}>
        <Text style={styles.title}>Inventory Overview</Text>
        <TouchableOpacity style={styles.period}>
          <Text style={styles.periodText}>This Week</Text>
          <Ionicons name="chevron-down" size={15} color="#64748b" />
        </TouchableOpacity>
      </View>

      <View style={styles.statsRow}>
        <StatCard icon="cube-outline" value="150" label="Total Items" />
        <StatCard icon="git-branch-outline" value="320" label="Total Portions" active />
        <StatCard icon="heart-outline" value="25" label="Active Donations" />
      </View>

      <Text style={styles.sectionLabel}>ITEM BREAKDOWN</Text>
      <View style={styles.breakdownCard}>
        {breakdown.map((item, index) => (
          <TouchableOpacity key={item.label} style={[styles.breakdownRow, index < breakdown.length - 1 && styles.rowBorder]}>
            <View style={[styles.breakdownIcon, { backgroundColor: item.bg }]}>
              <Ionicons name={item.icon} size={19} color={item.color} />
            </View>
            <Text style={styles.breakdownLabel}>{item.label}</Text>
            <Text style={styles.breakdownCount}>{item.count}</Text>
            <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.activityHeader}>
        <Text style={styles.sectionLabel}>RECENT ACTIVITY</Text>
        <Text style={styles.seeAll}>See All</Text>
      </View>
      <View style={styles.activityCard}>
        <ActivityRow icon="arrow-down" color="#10b981" bg="#d1fae5" title="New donation received" detail="Rice & Curry - 18 portions" time="2 hrs ago" />
        <ActivityRow icon="car-outline" color="#2563eb" bg="#dbeafe" title="Driver assigned" detail="Driver: D.001" time="3 hrs ago" />
        <ActivityRow icon="checkmark" color="#f59e0b" bg="#fef3c7" title="Donation picked up" detail="Sandwiches - 20 portions" time="5 hrs ago" />
      </View>
    </ScrollView>
  );
}

function StatCard({ icon, value, label, active }) {
  return (
    <View style={[styles.statCard, active && styles.activeStatCard]}>
      <View style={styles.statIcon}><Ionicons name={icon} size={18} color="#10b981" /></View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityRow({ icon, color, bg, title, detail, time }) {
  return (
    <View style={styles.activityRow}>
      <View style={[styles.activityIcon, { backgroundColor: bg }]}><Ionicons name={icon} size={19} color={color} /></View>
      <View style={styles.activityCopy}><Text style={styles.activityTitle}>{title}</Text><Text style={styles.activityDetail}>{detail}</Text></View>
      <Text style={styles.activityTime}>{time}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8fafc" },
  content: { padding: 20, paddingBottom: 30 },
  header: { height: 55, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#172033" },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 19 },
  userName: { maxWidth: 105, fontSize: 12, fontWeight: "700", color: "#334155" },
  titleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 14 },
  title: { fontSize: 19, fontWeight: "800", color: "#172033" },
  period: { flexDirection: "row", alignItems: "center", gap: 7, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 18, borderWidth: 1, borderColor: "#e2e8f0", backgroundColor: "#ffffff" },
  periodText: { fontSize: 12, fontWeight: "600", color: "#475569" },
  statsRow: { flexDirection: "row", gap: 10, marginTop: 20 },
  statCard: { flex: 1, height: 108, alignItems: "center", justifyContent: "center", borderRadius: 15, backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#f1f5f9" },
  activeStatCard: { borderColor: "#d1fae5" },
  statIcon: { width: 31, height: 31, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#ecfdf5" },
  statValue: { marginTop: 5, fontSize: 20, fontWeight: "800", color: "#172033" },
  statLabel: { marginTop: 2, fontSize: 11, color: "#64748b" },
  sectionLabel: { marginTop: 25, marginBottom: 11, fontSize: 13, fontWeight: "800", letterSpacing: 0.7, color: "#475569" },
  breakdownCard: { overflow: "hidden", borderRadius: 16, backgroundColor: "#ffffff" },
  breakdownRow: { minHeight: 65, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, gap: 13 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  breakdownIcon: { width: 36, height: 36, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  breakdownLabel: { flex: 1, fontSize: 14, fontWeight: "700", color: "#172033" },
  breakdownCount: { fontSize: 12, fontWeight: "600", color: "#64748b" },
  activityHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  activityCard: { overflow: "hidden", borderRadius: 16, backgroundColor: "#ffffff" },
  activityRow: { minHeight: 63, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  activityIcon: { width: 33, height: 33, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  activityCopy: { flex: 1, marginLeft: 12 },
  activityTitle: { fontSize: 12, fontWeight: "700", color: "#172033" },
  activityDetail: { marginTop: 3, fontSize: 11, color: "#64748b" },
  activityTime: { fontSize: 10, color: "#94a3b8" },
  seeAll: { marginTop: 25, marginBottom: 11, fontSize: 12, fontWeight: "700", color: "#16a34a" },
});
